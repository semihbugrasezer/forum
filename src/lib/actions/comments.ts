'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { User } from '@supabase/supabase-js';

// Helper function to get current logged in user
async function getUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set(name, value, options);
        },
        remove: (name: string, options: any) => {
          cookieStore.set(name, '', options);
        },
      },
    }
  );
}

/**
 * Bir konuya ait yorumları alma
 * @param topicId - Yorumların alınacağı konunun ID'si
 * @returns Yorumların listesi veya hata
 */
export async function getCommentsByTopicId(topicId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('comment_details')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Yorumlar alınırken hata oluştu:', error.message);
    return [];
  }
  
  return data || [];
}

/**
 * Yeni bir yorum ekler
 * @param topicId - Yorum yapılan konunun ID'si
 * @param content - Yorum içeriği
 * @returns Eklenen yorumun ID'si veya hata
 */
export async function addComment(topicId: string, content: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: 'Yorum yapmak için giriş yapmalısınız.' };
    }

    // Yorumu ekle
    const { data, error } = await supabase
      .from('comments')
      .insert({
        topic_id: topicId,
        user_id: session.user.id,
        content,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;

    // Konu tablosundaki yorum sayısını güncelle ve sayfayı yeniden doğrula
    await supabase.rpc('increment_comment_count', { topic_id: topicId });
    revalidatePath(`/topics/${topicId}`);

    return { success: true, commentId: data.id };
  } catch (error) {
    console.error('Yorum eklenirken hata:', error);
    return { error: 'Yorum eklenirken bir hata oluştu.' };
  }
}

/**
 * Bir yorumu günceller
 * @param commentId - Güncellenecek yorumun ID'si
 * @param content - Yeni yorum içeriği
 * @param topicId - Yorumun ait olduğu konunun ID'si (opsiyonel)
 * @returns İşlem sonucu
 */
export async function updateComment(commentId: string, content: string, topicId?: string) {
  try {
    const user = await getUser();
    
    if (!user) {
      return { error: 'Kullanıcı oturumu bulunamadı' };
    }
    
    const supabase = await createServerSupabaseClient();
    
    // Yorumun kullanıcıya ait olup olmadığını kontrol et
    const { data: comment, error: checkError } = await supabase
      .from('comments')
      .select('user_id, topic_id')
      .eq('id', commentId)
      .single();
    
    if (checkError) {
      console.error('Yorum kontrol edilirken hata oluştu:', checkError.message);
      return { error: checkError.message };
    }
    
    if (!comment) {
      return { error: 'Yorum bulunamadı.' };
    }
    
    if (comment.user_id !== user.id) {
      return { error: 'Bu yorumu düzenleme yetkiniz yok.' };
    }
    
    // Yorumu güncelle
    const { data, error } = await supabase
      .from('comments')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single();
    
    if (error) {
      console.error('Yorum güncellenirken hata oluştu:', error.message);
      return { error: 'Yorum güncellenirken bir hata oluştu.' };
    }
    
    // Sayfayı yeniden doğrula (eğer topicId verilmişse)
    if (topicId) {
      revalidatePath(`/topics/${topicId}`);
    } else if (comment.topic_id) {
      revalidatePath(`/topics/${comment.topic_id}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Yorum güncellenirken beklenmeyen hata:', error);
    return { error: 'Yorum güncellenirken beklenmeyen bir hata oluştu.' };
  }
}

// Yeni yorum oluşturma
export async function createComment(commentData: {
  content: string;
  topic_id: string;
  parent_id?: string;
}) {
  const user = await getUser();
  
  if (!user) {
    return {
      error: 'Kullanıcı oturumu bulunamadı'
    };
  }
  
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: commentData.content,
        topic_id: commentData.topic_id,
        user_id: user.id,
        parent_id: commentData.parent_id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update comment count and revalidate page
    await supabase.rpc('increment_comment_count', { topic_id: commentData.topic_id });
    revalidatePath(`/topics/${commentData.topic_id}`);

    return { success: true, data };
  } catch (error) {
    console.error('Yorum oluşturulurken hata:', error);
    return { error: 'Yorum oluşturulurken bir hata oluştu.' };
  }
}

/**
 * Bir yorumu siler
 * @param commentId - Silinecek yorumun ID'si
 * @param topicId - Yorumun ait olduğu konunun ID'si (opsiyonel)
 * @returns İşlem sonucu
 */
export async function deleteComment(commentId: string, topicId?: string) {
  try {
    const user = await getUser();
    
    if (!user) {
      return { error: 'Bu işlem için giriş yapmalısınız.' };
    }
    
    const supabase = await createServerSupabaseClient();
    
    // Yorumun kullanıcıya ait olup olmadığını kontrol et
    const { data: comment, error: checkError } = await supabase
      .from('comments')
      .select('user_id, topic_id')
      .eq('id', commentId)
      .single();
    
    if (checkError) {
      console.error('Yorum kontrol edilirken hata oluştu:', checkError.message);
      return { error: checkError.message };
    }
    
    if (!comment) {
      return { error: 'Yorum bulunamadı.' };
    }
    
    if (comment.user_id !== user.id) {
      return { error: 'Bu yorumu silme yetkiniz yok.' };
    }
    
    // Yorumu sil
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) {
      console.error('Yorum silinirken hata oluştu:', error);
      return { error: 'Yorum silinirken bir hata oluştu.' };
    }
    
    // Konu tablosundaki yorum sayısını güncelle
    const actualTopicId = topicId || comment.topic_id;
    if (actualTopicId) {
      await supabase.rpc('decrement_comment_count', { topic_id: actualTopicId });
      
      // Sayfayı yeniden doğrula
      revalidatePath(`/topics/${actualTopicId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Yorum silinirken beklenmeyen hata:', error);
    return { error: 'Yorum silinirken beklenmeyen bir hata oluştu.' };
  }
}

// Yorum beğenme/beğeniyi kaldırma
export async function toggleCommentLike(commentId: string) {
  const user = await getUser();
  
  if (!user) {
    return {
      error: 'Kullanıcı oturumu bulunamadı'
    };
  }
  
  const supabase = await createServerSupabaseClient();
  
  // Kullanıcının yorumu beğenip beğenmediğini kontrol et
  const { data: existingLike, error: checkError } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (checkError) {
    console.error('Beğeni kontrol edilirken hata oluştu:', checkError.message);
    return {
      error: checkError.message
    };
  }
  
  if (existingLike) {
    // Beğeniyi kaldır
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('id', existingLike.id);
    
    if (error) {
      console.error('Beğeni kaldırılırken hata oluştu:', error.message);
      return {
        error: error.message
      };
    }
    
    return { success: true, liked: false };
  } else {
    // Beğeni ekle
    const { error } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: user.id,
      });
    
    if (error) {
      console.error('Beğeni eklenirken hata oluştu:', error.message);
      return {
        error: error.message
      };
    }
    
    return { success: true, liked: true };
  }
}

// Kullanıcının yorumlarını alma
export async function getUserComments(userId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('comment_details')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Kullanıcı yorumları alınırken hata oluştu:', error.message);
    return [];
  }
  
  return data || [];
}

// Kullanıcının yorumu beğenip beğenmediğini kontrol etme
export async function checkCommentLike(commentId: string) {
  const user = await getUser();
  
  if (!user) {
    return false;
  }
  
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (error) {
    console.error('Beğeni kontrol edilirken hata oluştu:', error.message);
    return false;
  }
  
  return !!data;
}

// Add type definitions for clarity
export interface CommentData {
  content: string;
  topic_id: string;
  parent_id?: string;
}

export interface CommentResponse {
  success?: boolean;
  error?: string;
  data?: any;
  commentId?: string;
  liked?: boolean;
}