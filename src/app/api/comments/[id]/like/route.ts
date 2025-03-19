import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    
    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Beğeni yapmak için giriş yapmalısınız' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Check if user has already liked this comment
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingLike) {
      // User already liked the comment, remove the like
      await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);
        
      // Decrement comment like count
      await supabase.rpc('decrement_comment_likes', { comment_id: commentId });
      
      return NextResponse.json({
        success: true,
        liked: false
      });
    } else {
      // User hasn't liked the comment yet, add a like
      await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        });
        
      // Increment comment like count
      await supabase.rpc('increment_comment_likes', { comment_id: commentId });
      
      return NextResponse.json({
        success: true,
        liked: true
      });
    }
  } catch (error) {
    console.error('Comment like error:', error);
    return NextResponse.json(
      { error: 'Beğeni işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 