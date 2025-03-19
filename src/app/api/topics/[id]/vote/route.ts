import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Handle POST request for topic voting
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Resolve params
    const resolvedParams = await Promise.resolve(params);
    const topicId = resolvedParams.id;
    
    const body = await request.json();
    const { direction } = body;
    
    // Validate input
    if (!direction || (direction !== 'up' && direction !== 'down')) {
      return NextResponse.json({ error: 'Invalid vote direction' }, { status: 400 });
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;

    // Check if user has already voted on this topic
    const { data: existingVote } = await supabase
      .from('topic_votes')
      .select('id, direction')
      .eq('topic_id', topicId)
      .eq('user_id', userId)
      .maybeSingle();
    
    // Handle existing votes or create new ones based on logic
    if (existingVote) {
      if (existingVote.direction === direction) {
        // User is clicking the same direction - remove vote
        const { error } = await supabase
          .from('topic_votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (error) throw error;
        
        // Update topic votes count
        await updateTopicVoteCount(supabase, topicId);
        
        return NextResponse.json({ success: true, action: 'removed' });
      } else {
        // User is changing vote direction
        const { error } = await supabase
          .from('topic_votes')
          .update({ direction })
          .eq('id', existingVote.id);
        
        if (error) throw error;
        
        // Update topic votes count
        await updateTopicVoteCount(supabase, topicId);
        
        return NextResponse.json({ success: true, action: 'changed' });
      }
    } else {
      // New vote
      const { error } = await supabase
        .from('topic_votes')
        .insert({
          topic_id: topicId,
          user_id: userId,
          direction,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update topic votes count
      await updateTopicVoteCount(supabase, topicId);
      
      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}

// Helper function to update the topic's vote count
async function updateTopicVoteCount(supabase: any, topicId: string) {
  try {
    // Count upvotes
    const { count: upvotes } = await supabase
      .from('topic_votes')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId)
      .eq('direction', 'up');
    
    // Count downvotes
    const { count: downvotes } = await supabase
      .from('topic_votes')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId)
      .eq('direction', 'down');
    
    // Calculate net votes
    const voteCount = (upvotes || 0) - (downvotes || 0);
    
    // Update the topic's vote count
    await supabase
      .from('topics')
      .update({ votes: voteCount })
      .eq('id', topicId);
      
    return voteCount;
  } catch (error) {
    console.error('Error updating vote count:', error);
    throw error;
  }
} 