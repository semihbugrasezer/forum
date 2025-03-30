'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as serverCreateClient } from '@/lib/supabase/server';

// Create a Supabase client for this file
export async function createClient() {
  try {
    return await serverCreateClient();
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    throw error;
  }
}

import { getUser } from './auth';

// Tüm kategorileri alma
export async function getCategories() {
  const supabase = await createClient();
  
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
  const supabase = await createClient();
  
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

// Admin kontrolü yapan yardımcı fonksiyon
async function isAdmin(user: any) {
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ADMIN_ACCESS === 'true') {
    return true;
  }
  
  return user.email?.endsWith("@thy.com") || 
         user.app_metadata?.roles?.includes("admin") || 
         false;
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
  
  // Admin kontrolü
  if (!(await isAdmin(user))) {
    return {
      error: 'Bu işlem için admin yetkiniz yok'
    };
  }
  
  const supabase = await createClient();
  
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
  
  // Admin kontrolü
  if (!(await isAdmin(user))) {
    return {
      error: 'Bu işlem için admin yetkiniz yok'
    };
  }
  
  const supabase = await createClient();
  
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
  
  // Admin kontrolü
  if (!(await isAdmin(user))) {
    return {
      error: 'Bu işlem için admin yetkiniz yok'
    };
  }
  
  const supabase = await createClient();
  
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