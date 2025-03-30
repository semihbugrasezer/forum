import { createClientComponentClient } from '@/utils/supabase/client';

export async function getCategories() {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');
    
  if (error) throw error;
  return data || [];
}

export async function createCategory(categoryData: any) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('categories')
    .insert([categoryData])
    .select();
    
  if (error) throw error;
  return data;
}

export async function updateCategory(categoryId: string, categoryData: any) {
  const supabase = createClientComponentClient();
  
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select();
    
  if (error) throw error;
  return data;
}

export async function deleteCategory(categoryId: string) {
  const supabase = createClientComponentClient();
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);
    
  if (error) throw error;
}
