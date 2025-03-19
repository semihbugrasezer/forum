import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function getTopics(categoryId?: string) {
  const supabase = createClientComponentClient();
  
  let query = supabase
    .from('topics')
    .select(`
      *,
      author:profiles(name, email),
      category:categories(name)
    `)
    .order('created_at', { ascending: false });
    
  if (categoryId && categoryId !== 'all') {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function deleteTopic(topicId: string) {
  const supabase = createClientComponentClient();
  
  const { error } = await supabase
    .from('topics')
    .delete()
    .eq('id', topicId);
    
  if (error) throw error;
}

export async function createTopic(topicData: any) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('topics')
    .insert([topicData])
    .select();
    
  if (error) throw error;
  return data;
}

export async function updateTopic(topicId: string, topicData: any) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('topics')
    .update(topicData)
    .eq('id', topicId)
    .select();
    
  if (error) throw error;
  return data;
}
