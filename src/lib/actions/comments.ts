'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Adds a new comment to a topic
 */
export async function addComment(data: {
  topicId: number;
  content: string;
  userId: string;
  authorName: string;
}) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.from("comments").insert({
      topic_id: data.topicId,
      content: data.content,
      author_id: data.userId
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/topics/[slug]');
    return { success: true };
  } catch (error) {
    console.error("Error in addComment:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Gets comments for a topic
 */
export async function getComments(topicId: number | string) {
  if (!topicId) {
    console.error("getComments: No topicId provided");
    return [];
  }

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
          author:profiles(*)
        `)
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("getComments: Database error:", error);
        return [];
      }

      return comments || [];
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