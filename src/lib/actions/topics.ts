'use server';

import { revalidatePath } from 'next/cache';
import { createSlug } from '@/lib/utils';
import { getUser } from './auth';
import { createClient } from '@/lib/supabase/server';

/**
 * Yeni bir konu oluşturur
 */
export async function createTopic(formDataOrParams: FormData | {
  title: string;
  content: string;
  category_id?: string;
  tags?: string[] | string;
}) {
  try {
    const supabase = await createClient();
    
    let title: string;
    let content: string;
    let tags: string[];
    let category_id: string | undefined;

    if (formDataOrParams instanceof FormData) {
      title = formDataOrParams.get('title') as string;
      content = formDataOrParams.get('content') as string;
      tags = (formDataOrParams.get('tags') as string)?.split(',').map(tag => tag.trim()) || [];
      category_id = formDataOrParams.get('category_id') as string;
    } else {
      title = formDataOrParams.title;
      content = formDataOrParams.content;
      tags = processTags(formDataOrParams.tags);
      category_id = formDataOrParams.category_id;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "You must be logged in to create a topic" };
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .insert({
        title,
        content,
        slug,
        tags,
        category_id,
        author_id: user.id,
        created_at: new Date().toISOString(),
        comment_count: 0,
        view_count: 0,
        like_count: 0
      })
      .select()
      .single();

    if (topicError) {
      return { error: topicError.message };
    }

    if (category_id) {
      await supabase.rpc('increment_topic_count', { category_id });
    }

    revalidatePath('/');
    return { success: true, data: topic };
  } catch (error) {
    console.error("Error in createTopic:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Bir konuyu günceller
 */
export async function updateTopic(topicId: string, { title, content, category_id, tags }: {
  title: string;
  content: string;
  category_id?: string;
  tags?: string[] | string;
}) {
  try {
    const user = await getUser();
    if (!user) return { error: 'Kullanıcı oturumu bulunamadı' };
    
    const supabase = await createClient();
    if (!supabase) {
      console.error("updateTopic: Supabase client is null");
      return { error: 'Veritabanı bağlantısı kurulamadı' };
    }
    
    const { data: existingTopic, error: checkError } = await supabase
      .from('topics')
      .select('user_id, category_id')
      .eq('id', topicId)
      .single();
    
    if (checkError || existingTopic.user_id !== user.id) return { error: 'Yetkiniz yok' };
    
    const slug = createSlug(title);
    const tagArray = processTags(tags);
    
    const { data, error } = await supabase
      .from('topics')
      .update({ title, content, slug, category_id, updated_at: new Date().toISOString(), tags: tagArray })
      .eq('id', topicId)
      .select()
      .single();
    
    if (error) return { error: error.message };
    
    if (category_id && existingTopic.category_id !== category_id) {
      await supabase.rpc('decrement_topic_count', { category_id: existingTopic.category_id });
      await supabase.rpc('increment_topic_count', { category_id });
    }
    
    await supabase.from('topic_tags').delete().eq('topic_id', topicId);
    await manageTags(supabase, tagArray, topicId);
    
    revalidatePaths(['/', `/topics/${topicId}`, `/categories/${existingTopic.category_id}`, `/categories/${category_id}`]);
    return { success: true, data };
  } catch (error) {
    console.error('Konu güncellenirken hata:', error);
    return { error: 'Beklenmeyen bir hata oluştu.' };
  }
}

/**
 * Bir konuyu siler
 */
export async function deleteTopic(topicId: string) {
  try {
    const user = await getUser();
    if (!user) return { error: 'Kullanıcı oturumu bulunamadı' };
    
    const supabase = await createClient();
    if (!supabase) {
      console.error("deleteTopic: Supabase client is null");
      return { error: 'Veritabanı bağlantısı kurulamadı' };
    }
    
    const { data: existingTopic, error: checkError } = await supabase
      .from('topics')
      .select('user_id, category_id')
      .eq('id', topicId)
      .single();
    
    if (checkError || existingTopic.user_id !== user.id) return { error: 'Yetkiniz yok' };
    
    await supabase.from('topic_tags').delete().eq('topic_id', topicId);
    await supabase.from('comments').delete().eq('topic_id', topicId);
    await supabase.from('topics').delete().eq('id', topicId);
    await supabase.rpc('decrement_topic_count', { category_id: existingTopic.category_id });
    
    revalidatePaths(['/', '/categories', `/categories/${existingTopic.category_id}`]);
    return { success: true };
  } catch (error) {
    console.error('Konu silinirken hata:', error);
    return { error: 'Beklenmeyen bir hata oluştu.' };
  }
}

/**
 * Increments the view count for a topic
 */
export async function incrementViewCount(topicId: string) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      console.error('Failed to create Supabase client');
      return false;
    }

    const { error } = await supabase.rpc('increment_view_count', {
      topic_id: topicId,
    });

    if (error) {
      console.error('Error incrementing view count:', error);
      return false;
    }

    revalidatePath('/topics/[slug]');
    return true;
  } catch (error) {
    console.error('Error in incrementViewCount:', error);
    return false;
  }
}

/** Yardımcı Fonksiyonlar **/

function processTags(tags?: string[] | string): string[] {
  if (!tags) return [];
  return (typeof tags === 'string' ? tags.split(',') : tags)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 5);
}

async function manageTags(supabase: any, tags: string[], topicId: string) {
  for (const tagName of tags) {
    const { data: tag, error } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .single()
      .then(async (result: { error: any; }) => result.error ? await supabase.from('tags').insert({ name: tagName }).select().single() : result);
    
    if (!error) {
      await supabase.from('topic_tags').insert({ topic_id: topicId, tag_id: tag.id });
    }
  }
}

function revalidatePaths(paths: string[]) {
  paths.forEach(path => path && revalidatePath(path));
}

export async function getTopicBySlug(slug: string) {
  if (!slug) {
    console.error("getTopicBySlug: No slug provided");
    return null;
  }

  try {
    // Get the supabase client
    let supabase;
    try {
      supabase = await createClient();
      if (!supabase) {
        console.error("getTopicBySlug: Supabase client is null");
        return null;
      }
    } catch (error) {
      console.error("getTopicBySlug: Failed to create Supabase client:", error);
      return null;
    }
    
    // Try to get topic by slug first
    try {
      // Try by slug
      const result = await supabase
        .from("topics")
        .select(`
          *,
          author:profiles(*)
        `)
        .eq("slug", slug)
        .single();
        
      if (result.data) {
        return result.data;
      }
      
      console.log(`getTopicBySlug: No topic found with slug "${slug}", trying as ID`);
      
      // If no result by slug, try by ID if the slug looks like a number or UUID
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug) || 
        /^\d+$/.test(slug)
      ) {
        try {
          const resultById = await supabase
            .from("topics")
            .select(`
              *,
              author:profiles(*)
            `)
            .eq("id", slug)
            .single();
            
          if (resultById.data) {
            return resultById.data;
          } else {
            console.error("getTopicBySlug: No topic found with ID", slug);
          }
        } catch (idError) {
          console.error("getTopicBySlug: Error fetching by ID:", idError);
        }
      }
      
      // If we get here, no topic was found
      console.error(`getTopicBySlug: Topic not found for "${slug}"`);
      return null;
    } catch (queryError) {
      console.error("getTopicBySlug: Query error:", queryError);
      return null;
    }
  } catch (finalError) {
    console.error("getTopicBySlug: Final error:", finalError);
    return null;
  }
}