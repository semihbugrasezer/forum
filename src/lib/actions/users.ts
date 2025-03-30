'use server';
import { getUser } from './auth';
import { createClient } from '@/lib/supabase/server';

// Kullanıcı profilini alma
export async function getUserProfile() {
  const user = await getUser();
  
  if (!user) {
    return null;
  }
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.error('Profil alınırken hata oluştu:', error.message);
    return null;
  }
  
  return data;
}

// Kullanıcı profilini güncelleme
export async function updateUserProfile(profileData: {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
}) {
  const user = await getUser();
  
  if (!user) {
    return {
      error: 'Kullanıcı oturumu bulunamadı'
    };
  }
  
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: profileData.name,
      bio: profileData.bio,
      location: profileData.location,
      website: profileData.website,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();
  
  if (error) {
    console.error('Profil güncellenirken hata oluştu:', error.message);
    return {
      error: error.message
    };
  }
  
  return { success: true, data };
}

// Kullanıcı profil resmi güncelleme
export async function updateUserAvatar(avatarFile: File) {
  const user = await getUser();
  
  if (!user) {
    return {
      error: 'Kullanıcı oturumu bulunamadı'
    };
  }
  
  const supabase = await createClient();
  
  // Dosya adını oluştur
  const fileExt = avatarFile.name.split('.').pop();
  const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  // Dosyayı yükle
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, avatarFile, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (uploadError) {
    console.error('Profil resmi yüklenirken hata oluştu:', uploadError.message);
    return {
      error: uploadError.message
    };
  }
  
  // Dosya URL'sini al
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  // Profili güncelle
  const { data, error } = await supabase
    .from('profiles')
    .update({
      avatar_url: urlData.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();
  
  if (error) {
    console.error('Profil güncellenirken hata oluştu:', error.message);
    return {
      error: error.message
    };
  }
  
  return { success: true, data };
}

// Kullanıcı ID'sine göre profil alma
export async function getUserProfileById(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Profil alınırken hata oluştu:', error.message);
    return null;
  }
  
  return data;
}
