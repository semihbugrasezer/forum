'use server';

import { cookies } from 'next/headers';
import { CookieOptions, createServerClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

type LikeResponse = {
  success?: boolean;
  liked?: boolean;
  message?: string;
};

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}

async function handleLikeOperation(
  table: 'topic_likes' | 'comment_likes',
  itemId: string,
  userId: string,
  idField: 'topic_id' | 'comment_id',
  incrementRpc: string,
  decrementRpc: string
): Promise<LikeResponse> {
  const supabase = await createServerSupabaseClient();
  
  // Check if user already liked this item
  const { data: existingLike, error: checkError } = await supabase
    .from(table)
    .select('id')
    .eq(idField, itemId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (checkError) {
    console.error('Check error:', checkError);
    return { error: 'Beğeni durumu kontrol edilirken bir hata oluştu.' };
  }
  
  // If already liked, remove the like
  if (existingLike) {
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq('id', existingLike.id);
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return { error: 'Beğeni kaldırılırken bir hata oluştu.' };
    }
    
    // Decrement like count
    try {
      await supabase.rpc(decrementRpc, { [idField]: itemId });
    } catch (rpcError) {
      console.error('RPC error:', rpcError);
    }
    
    return { success: true, action: 'unliked' };
  }

  // Add like
  const { error: insertError } = await supabase
    .from(table)
    .insert({
      [idField]: itemId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    
  if (insertError) {
    console.error('Insert error:', insertError);
    return { error: 'Beğeni eklenirken bir hata oluştu.' };
  }
  
  // Increment like count
  try {
    await supabase.rpc(incrementRpc, { [idField]: itemId });
  } catch (rpcError) {
    console.error('RPC error:', rpcError);
  }
  
  return { success: true, action: 'liked' };
}

export async function toggleTopicLike(topicId: string): Promise<LikeResponse> {
  try {
    const supabase = await createClient();
    
    // First check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, message: 'Authentication required' };
    }
    
    // Check if topic is already liked
    const { data: existingLike } = await supabase
      .from('topic_likes')
      .select('id')
      .eq('topic_id', topicId)
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (existingLike) {
      // Unlike the topic
      const { error } = await supabase
        .from('topic_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (error) {
        console.error('Error unliking topic:', error);
        return { success: false, message: 'Failed to unlike topic' };
      }
      
      revalidatePath(`/topics/${topicId}`);
      return { success: true, liked: false };
    } else {
      // Like the topic
      const { error } = await supabase
        .from('topic_likes')
        .insert({ 
          topic_id: topicId, 
          user_id: session.user.id,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error liking topic:', error);
        return { success: false, message: 'Failed to like topic' };
      }
      
      revalidatePath(`/topics/${topicId}`);
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Topic like operation error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

export async function toggleCommentLike(commentId: string, topicId: string): Promise<LikeResponse> {
  try {
    const supabase = await createClient();
    
    // First check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, message: 'Authentication required' };
    }
    
    // Check if comment is already liked
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (existingLike) {
      // Unlike the comment
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (error) {
        console.error('Error unliking comment:', error);
        return { success: false, message: 'Failed to unlike comment' };
      }
      
      revalidatePath(`/topics/${topicId}`);
      return { success: true, liked: false };
    } else {
      // Like the comment
      const { error } = await supabase
        .from('comment_likes')
        .insert({ 
          comment_id: commentId, 
          user_id: session.user.id,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error liking comment:', error);
        return { success: false, message: 'Failed to like comment' };
      }
      
      revalidatePath(`/topics/${topicId}`);
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error('Comment like operation error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

// Check if user has liked a topic
export async function checkTopicLike(topicId: string) {
  try {
    // Safely create Supabase client
    const supabase = await createClient();
    
    // First check if user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error in checkTopicLike:', sessionError);
      return { liked: false };
    }
    
    const session = sessionData?.session;
    
    if (!session) {
      return { liked: false };
    }
    
    // Ensure user ID exists
    if (!session.user?.id) {
      console.error('User ID missing in session');
      return { liked: false };
    }
    
    // Check if topic is liked by the user
    const { data, error } = await supabase
      .from('topic_likes')
      .select('id')
      .eq('topic_id', topicId)
      .eq('user_id', session.user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking topic like:', error);
      return { liked: false };
    }
    
    return { liked: !!data };
  } catch (error) {
    console.error('Check topic like error:', error);
    return { liked: false };
  }
}