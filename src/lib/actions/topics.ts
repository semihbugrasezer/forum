'use server';

import { revalidatePath } from 'next/cache';
import { createSlug } from '@/lib/utils';
import { getUser } from './auth';
import { createClient } from '@/lib/supabase/server';
import { PostgrestQueryBuilder } from '@supabase/postgrest-js';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc(
      fn: 'increment_topic_count' | 'decrement_topic_count' | 'increment_comment_count' | 'increment_view_count',
      params: Record<string, any>
    ): Promise<any>;
    from<T extends keyof Database['Tables'] | keyof Database['Views']>(
      table: T
    ): T extends keyof Database['Tables']
      ? PostgrestQueryBuilder<Database, Database['Tables'][T], any, any>
      : T extends keyof Database['Views']
      ? PostgrestQueryBuilder<Database, Database['Views'][T], any, any>
      : never;
  }
}

// Add utility types for Supabase operations
type PostgresError = {
  message: string;
  details: string;
  hint?: string;
  code: string;
};

type QueryResult<T> = {
  data: T | null;
  error: PostgresError | null;
};

// Update Database interface
interface Database {
  Tables: {
    topics: {
      Row: {
        id: string;
        title: string;
        content: string;
        slug: string;
        user_id: string;
        category_id?: string;
        tags: string[];
        created_at: string;
        updated_at?: string;
        comments_count: number;
        views: number;
        likes_count: number;
      };
      Insert: Omit<Database['Tables']['topics']['Row'], 'id' | 'updated_at'>;
      Update: Partial<Database['Tables']['topics']['Row']>;
      Relationships: [
        {
          foreignKeyName: "topics_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "topics_category_id_fkey"
          columns: ["category_id"]
          referencedRelation: "categories"
          referencedColumns: ["id"]
        }
      ];
    };
    topic_tags: {
      Row: {
        topic_id: string;
        tag_id: string;
      };
      Insert: {
        topic_id: string;
        tag_id: string;
      };
      Update: {
        topic_id?: string;
        tag_id?: string;
      };
      Relationships: [
        {
          foreignKeyName: "topic_tags_topic_id_fkey"
          columns: ["topic_id"]
          referencedRelation: "topics"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "topic_tags_tag_id_fkey" 
          columns: ["tag_id"]
          referencedRelation: "tags"
          referencedColumns: ["id"]
        }
      ];
    };
    tags: {
      Row: {
        id: string;
        name: string;
      };
      Insert: Omit<Database['Tables']['tags']['Row'], 'id'>;
      Update: Partial<Database['Tables']['tags']['Row']>;
      Relationships: [
        {
          foreignKeyName: "tags_id_fkey"
          columns: ["id"]
          referencedRelation: "topic_tags"
          referencedColumns: ["tag_id"]
        }
      ];
    };
    comments: {
      Row: {
        id: string;
        topic_id: string;
        content: string;
        user_id: string;
        created_at: string;
        updated_at?: string;
      };
      Insert: Omit<Database['Tables']['comments']['Row'], 'id' | 'updated_at'>;
      Update: Partial<Database['Tables']['comments']['Row']>;
      Relationships: [
        {
          foreignKeyName: "comments_topic_id_fkey"
          columns: ["topic_id"]
          referencedRelation: "topics"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "comments_user_id_fkey"
          columns: ["user_id"]
          referencedRelation: "profiles"
          referencedColumns: ["id"]
        }
      ];
    };
  };
  Views: Record<string, never>;
  Functions: {
    increment_topic_count: {
      Args: { category_id: string };
      Returns: void;
    };
    decrement_topic_count: {
      Args: { category_id: string };
      Returns: void;  
    };
    increment_comment_count: {
      Args: { topic_id: string };
      Returns: void;
    };
    increment_view_count: {
      Args: { topic_id: string };
      Returns: void;
    };
  };
}

// Add type guard for database results
function isQueryError(result: QueryResult<any>): result is QueryResult<any> & { error: PostgresError } {
  return !!(result && result.error);
}

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

    const topicData: Database['Tables']['topics']['Insert'] = {
      title,
      content,
      slug,
      tags,
      category_id,
      user_id: user.id,
      created_at: new Date().toISOString(),
      comments_count: 0,
      views: 0,
      likes_count: 0
    };

    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .insert(topicData)
      .select('*')
      .single() as QueryResult<Database['Tables']['topics']['Row']>;

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
    
    const result = await supabase
      .from('topics')
      .select('user_id, category_id')
      .eq('id', topicId)
      .single() as QueryResult<Pick<Database['Tables']['topics']['Row'], 'user_id' | 'category_id'>>;

    if (isQueryError(result) || !result.data) {
      return { error: 'Topic not found' };
    }

    const existingTopic = result.data;
    
    if (existingTopic.user_id !== user.id) return { error: 'Yetkiniz yok' };
    
    const slug = createSlug(title);
    const tagArray = processTags(tags);
    
    const { data, error } = await supabase
      .from('topics')
      .update({
        title,
        content,
        slug,
        category_id,
        updated_at: new Date().toISOString(),
        tags: tagArray
      } as Database['Tables']['topics']['Update'])
      .eq('id', topicId)
      .select()
      .single() as QueryResult<Database['Tables']['topics']['Row']>;
    
    if (error) return { error: error.message };
    
    if (category_id && existingTopic?.category_id !== category_id) {
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
    
    const result = await supabase
      .from('topics')
      .select('user_id, category_id')
      .eq('id', topicId)
      .single() as QueryResult<Pick<Database['Tables']['topics']['Row'], 'user_id' | 'category_id'>>;
    
    if (isQueryError(result) || !result.data || result.data.user_id !== user.id) return { error: 'Yetkiniz yok' };
    
    const existingTopic = result.data;
    
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
  if (!topicId) {
    console.error('incrementViewCount: No topic ID provided');
    return false;
  }

  try {
    console.log(`Incrementing view count for topic ${topicId}`);
    const supabase = await createClient();
    if (!supabase) {
      console.error('Failed to create Supabase client');
      return false;
    }

    // First try to use the RPC function if it exists
    try {
      const { error } = await supabase.rpc('increment_view_count', {
        topic_id: topicId,
      });

      if (!error) {
        console.log(`Successfully incremented view count for topic ${topicId} using RPC`);
        revalidatePath(`/topics/${topicId}`);
        return true;
      }

      // If RPC fails, it might be that the function doesn't exist, try direct update
      console.warn('RPC increment_view_count failed, trying direct update', error);
    } catch (rpcError) {
      console.warn('RPC increment_view_count error, trying direct update', rpcError);
    }

    // Fallback to direct update
    const { error: updateError } = await supabase
      .from('topics')
      .update({ views: supabase.rpc('increment', { value: 1, max: 1000000 }) })
      .eq('id', topicId);

    if (updateError) {
      console.error('Error incrementing view count via direct update:', updateError);
      return false;
    }

    console.log(`Successfully incremented view count for topic ${topicId} via direct update`);
    revalidatePath(`/topics/${topicId}`);
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

interface Topic {
  id: string;
  title: string;
  content: string;
  slug: string;
  author_id: string;
  category_id?: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
  comment_count: number;
  view_count: number;
  like_count: number;
}

function mapDbTopicToTopic(dbTopic: Database['Tables']['topics']['Row']): Topic {
  assertTopicResult(dbTopic);
  return {
    id: dbTopic.id,
    title: dbTopic.title,
    content: dbTopic.content, 
    slug: dbTopic.slug,
    author_id: dbTopic.user_id,
    category_id: dbTopic.category_id,
    tags: dbTopic.tags || [],
    created_at: dbTopic.created_at,
    updated_at: dbTopic.updated_at,
    comment_count: dbTopic.comments_count,
    view_count: dbTopic.views,
    like_count: dbTopic.likes_count
  };
}

function assertTopicResult(result: unknown): asserts result is Database['Tables']['topics']['Row'] {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid topic result');
  }
}

export async function getTopicBySlug(slugOrId: string): Promise<Topic | null> {
  if (!slugOrId || typeof slugOrId !== 'string') {
    console.error("Invalid slug or ID provided:", slugOrId);
    return null;
  }

  try {
    const supabase = await createClient();
    if (!supabase) throw new Error("Failed to create Supabase client");

    // Looking at the database.types.ts schema
    console.log(`Attempting to fetch topic with slug/id: ${slugOrId}`);
    
    // First try to fetch by slug
    const { data, error } = await supabase
      .from('topics')
      .select(`
        id,
        title,
        content,
        slug,
        user_id,
        category,
        tags,
        created_at,
        updated_at,
        likes_count,
        comments_count,
        views,
        is_pinned,
        is_locked,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('slug', slugOrId)
      .single();

    if (error || !data) {
      console.log(`No topic found with slug "${slugOrId}", trying as ID...`);
      
      // If no results by slug, try by ID
      const { data: idData, error: idError } = await supabase
        .from('topics')
        .select(`
          id,
          title,
          content,
          slug,
          user_id,
          category,
          tags,
          created_at,
          updated_at,
          likes_count,
          comments_count,
          views,
          is_pinned,
          is_locked,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('id', slugOrId)
        .single();

      if (idError || !idData) {
        console.log(`No topic found with ID "${slugOrId}" either.`);
        return null;
      }
      
      console.log(`Topic found by ID: ${idData.id}`);
      
      // Map the database topic to our application's Topic interface
      return {
        id: idData.id,
        title: idData.title,
        content: idData.content, 
        slug: idData.slug || idData.id,
        author_id: idData.user_id || '',
        author: idData.profiles ? {
          id: idData.profiles.id || '',
          full_name: idData.profiles.name || '',
          email: ''
        } : undefined,
        category_id: idData.category || undefined,
        category: idData.category ? {
          id: idData.category,
          name: idData.category // We'll use the slug as name if category object isn't available
        } : undefined,
        tags: idData.tags || [],
        created_at: idData.created_at,
        updated_at: idData.updated_at || undefined,
        comment_count: idData.comments_count || 0,
        view_count: idData.views || 0,
        like_count: idData.likes_count || 0
      };
    }

    console.log(`Topic found by slug: ${data.id}`);

    // Map the database topic to our application's Topic interface
    return {
      id: data.id,
      title: data.title,
      content: data.content, 
      slug: data.slug || data.id,
      author_id: data.user_id || '',
      author: data.profiles ? {
        id: data.profiles.id || '',
        full_name: data.profiles.name || '',
        email: ''
      } : undefined,
      category_id: data.category || undefined,
      category: data.category ? {
        id: data.category,
        name: data.category // We'll use the slug as name if category object isn't available
      } : undefined,
      tags: data.tags || [],
      created_at: data.created_at,
      updated_at: data.updated_at || undefined,
      comment_count: data.comments_count || 0,
      view_count: data.views || 0,
      like_count: data.likes_count || 0
    };
  } catch (error) {
    console.error("Error in getTopicBySlug:", error);
    return null;
  }
}

function isError<T>(result: { data: T; error: null; } | { data: null; error: any; }): result is { data: null; error: any; } {
  return result && typeof result === 'object' && 'error' in result && result.error !== null;
}