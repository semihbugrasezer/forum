'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUser } from './auth';

/**
 * Adds a new comment to a topic
 */
export async function addComment(formData: FormData) {
  try {
    const supabase = await createClient();
    
    // Extract data from FormData
    const topicId = formData.get('topicId') as string;
    const commentContent = formData.get('commentContent') as string;
    const authorName = formData.get('authorName') as string;
    
    if (!topicId) {
      return { error: "Topic ID is required" };
    }
    
    if (!commentContent || commentContent.trim().length === 0) {
      return { error: "Comment content is required" };
    }
    
    // Try to get the authenticated user
    let userId = null;
    try {
      const user = await getUser();
      if (user) {
        userId = user.id;
      }
    } catch (authError) {
      console.error("Auth error in addComment:", authError);
      // Continue without userId - anonymous comment
    }
    
    // Prepare the comment data based on database schema
    const commentData = {
      topic_id: topicId,
      content: commentContent.trim(),
      user_id: userId,
      author_name: authorName || 'Anonymous', // Fallback to 'Anonymous' if no name provided
      created_at: new Date().toISOString(),
      is_solution: false
    };
    
    const { error } = await supabase
      .from("comments")
      .insert(commentData);

    if (error) {
      console.error("Database error in addComment:", error);
      return { error: error.message };
    }

    // Increment the comment count on the topic
    try {
      await supabase.rpc('increment_comment_count', { topic_id: topicId });
    } catch (rpcError) {
      console.error("Failed to increment comment count:", rpcError);
      // Continue even if this fails - comment was added successfully
    }

    // Revalidate the page to show the new comment
    revalidatePath(`/topics/${topicId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in addComment:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Gets comments for a topic
 */
export async function getComments(topicId: string | number) {
  if (!topicId) {
    console.error("getComments: No topicId provided");
    return [];
  }

  const topicIdStr = String(topicId); // Ensure we have a string
  
  console.log(`Fetching comments for topic: ${topicIdStr}`);
  
  try {
    // Get the supabase client
    let supabase;
    try {
      supabase = await createClient();
      if (!supabase) {
        console.error("getComments: Supabase client is null");
        return [];
      }
    } catch (clientError) {
      console.error("getComments: Failed to create Supabase client:", clientError);
      return [];
    }
    
    // Get the comments
    try {
      const { data: comments, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:user_id(id, name, avatar_url)
        `)
        .eq("topic_id", topicIdStr)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("getComments: Database error:", error);
        return [];
      }
      
      console.log(`Found ${comments?.length || 0} comments for topic ${topicIdStr}`);
      
      // Transform data to expected format
      return (comments || []).map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at || null,
        topic_id: comment.topic_id,
        author_name: comment.author_name || 'Anonymous',
        user_id: comment.user_id || null,
        author: comment.profiles ? {
          id: comment.profiles.id,
          full_name: comment.profiles.name || 'Anonymous',
          avatar_url: comment.profiles.avatar_url
        } : undefined,
        is_solution: comment.is_solution || false
      }));
    } catch (dbError) {
      console.error("getComments: Query execution error:", dbError);
      return [];
    }
  } catch (finalError) {
    console.error("getComments: Unexpected error:", finalError);
    return [];
  }
}

// Additional comment-related functions could be added here