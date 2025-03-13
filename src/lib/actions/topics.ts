'use server';

import { revalidatePath } from 'next/cache';
import { createSlug } from '@/lib/utils';
import { getUser } from './auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Yeni bir konu oluşturur
 */
export async function createTopic({ title, content, category_id, tags }: {
  title: string;
  content: string;
  category_id?: string;
  tags?: string[] | string;
}) {
  try {
    const user = await getUser();
    if (!user) return { error: 'Kullanıcı oturumu bulunamadı' };
    
    const supabase = await createServerSupabaseClient();
    const slug = createSlug(title);
    const tagArray = processTags(tags);
    
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .insert({
        title, content, slug, category_id, user_id: user.id,
        created_at: new Date().toISOString(), tags: tagArray,
        comment_count: 0, view_count: 0, like_count: 0
      })
      .select()
      .single();
    
    if (topicError) return { error: topicError.message };
    await manageTags(supabase, tagArray, topic.id);
    if (category_id) await supabase.rpc('increment_topic_count', { category_id });
    
    revalidatePaths(['/', '/categories', `/categories/${category_id}`]);
    return { success: true, data: topic };
  } catch (error) {
    console.error('Konu oluşturulurken hata:', error);
    return { error: 'Beklenmeyen bir hata oluştu.' };
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
    
    const supabase = createServerSupabaseClient();
    const { data: existingTopic, error: checkError } = await (await supabase)
      .from('topics')
      .select('user_id, category_id')
      .eq('id', topicId)
      .single();
    
    if (checkError || existingTopic.user_id !== user.id) return { error: 'Yetkiniz yok' };
    
    const slug = createSlug(title);
    const tagArray = processTags(tags);
    
    const { data, error } = await (await supabase)
      .from('topics')
      .update({ title, content, slug, category_id, updated_at: new Date().toISOString(), tags: tagArray })
      .eq('id', topicId)
      .select()
      .single();
    
    if (error) return { error: error.message };
    
    if (category_id && existingTopic.category_id !== category_id) {
      await (await supabase).rpc('decrement_topic_count', { category_id: existingTopic.category_id });
      await (await supabase).rpc('increment_topic_count', { category_id });
    }
    
    await (await supabase).from('topic_tags').delete().eq('topic_id', topicId);
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
    
    const supabase = createServerSupabaseClient();
    const { data: existingTopic, error: checkError } = await (await supabase)
      .from('topics')
      .select('user_id, category_id')
      .eq('id', topicId)
      .single();
    
    if (checkError || existingTopic.user_id !== user.id) return { error: 'Yetkiniz yok' };
    
    await (await supabase).from('topic_tags').delete().eq('topic_id', topicId);
    await (await supabase).from('comments').delete().eq('topic_id', topicId);
    await (await supabase).from('topics').delete().eq('id', topicId);
    await (await supabase).rpc('decrement_topic_count', { category_id: existingTopic.category_id });
    
    revalidatePaths(['/', '/categories', `/categories/${existingTopic.category_id}`]);
    return { success: true };
  } catch (error) {
    console.error('Konu silinirken hata:', error);
    return { error: 'Beklenmeyen bir hata oluştu.' };
  }
}

/**
 * Görüntülenme sayısını artırır
 */
export async function incrementTopicViewCount(topicId: string) {
  try {
    const supabase = createServerSupabaseClient();
    await (await supabase).rpc('increment_view_count', { topic_id: topicId });
    return { success: true };
  } catch (error) {
    console.error('Görüntülenme artırılırken hata:', error);
    return { error: 'Beklenmeyen bir hata oluştu.' };
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