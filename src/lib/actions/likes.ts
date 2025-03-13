'use server';

import { cookies } from 'next/headers';
import { CookieOptions, createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';

type LikeResponse = {
  success?: boolean;
  action?: 'liked' | 'unliked';
  error?: string;
};

function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          (await cookieStore).set(name, value, options);
        },
        async remove(name: string, options: CookieOptions) {
          (await cookieStore).set(name, '', options);
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
  const supabase = createServerSupabaseClient();
  
  // Check for existing like
  const { data: existingLike, error: fetchError } = await supabase
    .from(table)
    .select('id')
    .eq(idField, itemId)
    .eq('user_id', userId)
    .single();
    
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error(`Like check error:`, fetchError);
    return { error: 'Beğeni durumu kontrol edilirken bir hata oluştu.' };
  }

  if (existingLike) {
    // Remove like
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .eq('id', existingLike.id);
      
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return { error: 'Beğeni kaldırılırken bir hata oluştu.' };
    }
    
    await supabase.rpc(decrementRpc, { [idField]: itemId });
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
  
  await supabase.rpc(incrementRpc, { [idField]: itemId });
  return { success: true, action: 'liked' };
}

export async function toggleTopicLike(topicId: string): Promise<LikeResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: 'Bu işlem için giriş yapmalısınız.' };
    }

    const result = await handleLikeOperation(
      'topic_likes',
      topicId,
      session.user.id,
      'topic_id',
      'increment_topic_like_count',
      'decrement_topic_like_count'
    );
    
    revalidatePath(`/topics/${topicId}`);
    return result;
  } catch (error) {
    console.error('Topic like error:', error);
    return { error: 'Beğeni işlemi sırasında beklenmeyen bir hata oluştu.' };
  }
}

export async function toggleCommentLike(commentId: string, topicId: string): Promise<LikeResponse> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { error: 'Bu işlem için giriş yapmalısınız.' };
    }

    const result = await handleLikeOperation(
      'comment_likes',
      commentId,
      session.user.id,
      'comment_id',
      'increment_comment_like_count',
      'decrement_comment_like_count'
    );
    
    revalidatePath(`/topics/${topicId}`);
    return result;
  } catch (error) {
    console.error('Comment like error:', error);
    return { error: 'Beğeni işlemi sırasında beklenmeyen bir hata oluştu.' };
  }
}