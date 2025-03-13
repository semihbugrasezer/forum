'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', options);
        },
      },
    }
  );
}

import { getUser } from './auth';

// Tüm kategorileri alma
export async function getCategories() {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Kategoriler alınırken hata oluştu:', error.message);
    return [];
  }
  
  return data || [];
}

// Kategori detayını alma
export async function getCategoryBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Kategori alınırken hata oluştu:', error.message);
    return null;
  }
  
  return data;
}

// Kategori oluşturma (admin için)
export async function createCategory(categoryData: {
  name: string;
  slug: string;
  description?: string;
}) {
  const user = await getUser();
  
  if (!user) {
    return {
      error: 'Kullanıcı oturumu bulunamadı'
    };
  }
  
  // Admin kontrolü yapılabilir
  
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Kategori oluşturulurken hata oluştu:', error.message);
    return {
      error: error.message
    };
  }
  
  return { success: true, data };
}

// Kategori güncelleme (admin için)
export async function updateCategory(categoryId: string, categoryData: {
  name: string;
  slug: string;
  description?: string;
}) {
  const user = await getUser();
  
  if (!user) {
    return {
      error: 'Kullanıcı oturumu bulunamadı'
    };
  }
  
  // Admin kontrolü yapılabilir
  
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', categoryId)
    .select()
    .single();
  
  if (error) {
    console.error('Kategori güncellenirken hata oluştu:', error.message);
    return {
      error: error.message
    };
  }
  
  return { success: true, data };
}

// Kategori silme (admin için)
export async function deleteCategory(categoryId: string) {
  const user = await getUser();
  
  if (!user) {
    return {
      error: 'Kullanıcı oturumu bulunamadı'
    };
  }
  
  // Admin kontrolü yapılabilir
  
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);
  
  if (error) {
    console.error('Kategori silinirken hata oluştu:', error.message);
    return {
      error: error.message
    };
  }
  
  return { success: true };
}