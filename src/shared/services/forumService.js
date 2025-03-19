// ...existing imports...
import { getCommentsByTopicId } from "../../lib/actions/comments";

// ...existing code...

// Get a single topic with details
export async function getTopic(id) {
  try {
    const supabase = createClient();

    // Get the topic data
    const { data: topic, error } = await supabase
      .from("topic_details")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Get the authenticated user to check like status
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if the user has liked this topic
    if (session?.user) {
      const { data: likeData } = await supabase
        .from("topic_likes")
        .select("id")
        .eq("topic_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();

      topic.user_has_liked = !!likeData;
    }

    // Get comments for this topic
    const { comments, error: commentsError } = await getCommentsByTopicId(id);

    if (!commentsError) {
      topic.comments = comments;
    } else {
      topic.comments = [];
      console.error("Error fetching comments:", commentsError);
    }

    // Increment view count
    await supabase.rpc("increment_view_count", { topic_id: id });

    return topic;
  } catch (error) {
    console.error("Error getting topic:", error);
    throw new Error("Konu alınırken bir hata oluştu.");
  }
}

// ...existing code...
