'use server';

import { Database } from '@/lib/supabase/database.types';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { User } from '@supabase/supabase-js';

// Helper function to get current logged in user
async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

export async function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createClient();
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  topic_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    profiles?: {
      name: string;
      avatar_url?: string;
    };
  };
  like_count?: number;
}

interface FormattedComment extends Omit<Comment, 'user'> {
  user_name: string;
  user_avatar?: string;
  like_count: number;
  user_has_liked: boolean;
  replies: FormattedComment[];
}

interface CommentQueryResponse {
  id: string;
  content: string;
  user_id: string;
  topic_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    profiles: {
      name: string;
      avatar_url?: string;
    } | null;
  };
  like_count: number;
}

/**
 * Bir konuya ait yorumları alma
 * @param topicId - Yorumların alınacağı konunun ID'si
 * @returns Yorumların listesi veya hata
 */
export async function getCommentsByTopicId(topicId: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id
      `)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Get user profiles separately
    const userIds = data?.map(comment => comment.user_id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);

    // Create a map of user profiles
    const profileMap = new Map();
    profiles?.forEach(profile => {
      profileMap.set(profile.id, profile);
    });

    // Format the comments to match the expected structure
    const formattedComments = data?.map(comment => {
      const profile = profileMap.get(comment.user_id);
      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_name: profile?.name || 'Anonymous',
        user_avatar: profile?.avatar_url || null
      };
    }) || [];

    return { comments: formattedComments };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { comments: [] };
  }
}

// Yorumları hiyerarşik yapıya çevirme yardımcı fonksiyonu
function buildCommentTree(comments: FormattedComment[]): FormattedComment[] {
  const commentMap: Record<string, FormattedComment> = {};
  const roots: FormattedComment[] = [];

  // Önce tüm yorumları ID'lerine göre map'leyelim
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  // Sonra parent_id ilişkilerine göre yorumları düzenleyelim
  comments.forEach(comment => {
    if (comment.parent_id && commentMap[comment.parent_id]) {
      commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
    } else {
      roots.push(commentMap[comment.id]);
    }
  });

  return roots;
}

/**
 * Yeni bir yorum ekler
 * @param topicId - Yorum yapılan konunun ID'si
 * @param content - Yorum içeriği
 * @returns Eklenen yorumun ID'si veya hata
 */
export async function addComment(formData: FormData) {
  const supabase = await createClient();
  const content = formData.get('content')?.toString();
  const topicId = formData.get('topicId')?.toString();

  if (!content || !topicId) {
    return { error: 'Missing required fields' };
  }

  // Get the current user
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return { error: 'User not authenticated' };
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([{ 
      content,
      topic_id: topicId,
      user_id: session.user.id
    }])
    .select();

  if (error) {
    console.error('Error adding comment:', error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Bir yorumu günceller
 * @param commentId - Güncellenecek yorumun ID'si
 * @param content - Yeni yorum içeriği
 * @param topicId - Yorumun ait olduğu konunun ID'si (opsiyonel)
 * @returns İşlem sonucu
 */
export async function updateComment(commentId: string, content: string, topicId?: string) {
  const supabase = await createClient();
  try {
    const user = await getUser();
    
    if (!user) {
      return { error: 'Kullanıcı oturumu bulunamadı' };
    }
    
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
  const supabase = await createClient();
  const user = await getUser();
  
  if (!user) {
    return {
      error: 'Kullanıcı oturumu bulunamadı'
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: commentData.content,
        topic_id: commentData.topic_id,
        user_id: user.id,
        parent_id: commentData.parent_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update comment count in topics table
    try {
      // Use type assertion for the RPC call
      await (supabase.rpc as any)('increment_comment_count', { topic_id: commentData.topic_id });
    } catch (rpcError) {
      console.error('Error incrementing comment count:', rpcError);
      // Continue execution even if this fails
    }
    
    // Revalidate the page to show the new comment
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
  const supabase = await createClient();
  try {
    const user = await getUser();
    
    if (!user) {
      return { error: 'Bu işlem için giriş yapmalısınız.' };
    }
    
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
      try {
        // Use type assertion for the RPC call
        await (supabase.rpc as any)('decrement_comment_count', { topic_id: actualTopicId });
      } catch (rpcError) {
        console.error('Error decrementing comment count:', rpcError);
        // Continue execution even if this fails
      }
      
      // Sayfayı yeniden doğrula
      revalidatePath(`/topics/${actualTopicId}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Yorum silinirken beklenmeyen hata:', error);
    return { error: 'Yorum silinirken beklenmeyen bir hata oluştu.' };
  }
}

/**
 * Bir yoruma beğeni ekler veya kaldırır
 * @param commentId - Beğeni eklenecek/kaldırılacak yorumun ID'si
 * @returns İşlem sonucu
 */
export async function toggleCommentLike(commentId: string) {
  const supabase = await createClient();
  const user = await getUser();
  
  if (!user) {
    return {
      error: 'Kullanıcı oturumu bulunamadı'
    };
  }
  
  try {
    // Complete type assertion approach for comment_likes table
    const { data: existingLike, error: checkError } = await (supabase as any)
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
      const { error } = await (supabase as any)
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
      const { error } = await (supabase as any)
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
  } catch (error) {
    console.error('Beğeni işleminde hata:', error);
    return { error: 'Beğeni işleminde bir hata oluştu.' };
  }
}

// Kullanıcının yorumlarını alma
export async function getUserComments(userId: string) {
  const supabase = await createClient();
  try {
    // Complete type assertion for comment_details view
    const { data, error } = await (supabase as any)
      .from('comment_details')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Kullanıcı yorumları alınırken hata oluştu:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Kullanıcı yorumları alınırken beklenmeyen hata:', error);
    return [];
  }
}

// Kullanıcının yorumu beğenip beğenmediğini kontrol etme
export async function checkCommentLike(commentId: string) {
  const supabase = await createClient();
  const user = await getUser();
  
  if (!user) {
    return false;
  }
  
  try {
    // Complete type assertion for comment_likes table
    const { data, error } = await (supabase as any)
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
  } catch (error) {
    console.error('Beğeni kontrol edilirken beklenmeyen hata:', error);
    return false;
  }
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

// Export getCommentsForTopic as an alias for getCommentsByTopicId
export const getCommentsForTopic = getCommentsByTopicId;