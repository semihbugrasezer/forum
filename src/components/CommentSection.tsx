"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { MessageSquare, ThumbsUp, Reply, MoreHorizontal, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  likes: number;
  author: {
    name: string;
    avatar_url: string | null;
  };
  liked_by_user?: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  topicId: string;
}

export default function CommentSection({ topicId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  // Fetch comments when component mounts
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          setUser(session.session.user);
        }

        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            author:profiles(name, avatar_url)
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Check if the user has liked each comment
        const commentsWithLikes = await Promise.all(
          data.map(async (comment) => {
            if (session?.session?.user) {
              const { data: likeData } = await supabase
                .from('comment_likes')
                .select('id')
                .eq('comment_id', comment.id)
                .eq('user_id', session.session.user.id)
                .maybeSingle();
                
              return { ...comment, liked_by_user: !!likeData };
            }
            return { ...comment, liked_by_user: false };
          })
        );
        
        // Organize comments into threaded structure
        const threadedComments = organizeComments(commentsWithLikes);
        setComments(threadedComments);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        toast.error("Yorumlar yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [topicId, supabase, toast]);

  // Helper function to organize comments into threads
  const organizeComments = (commentsArray: Comment[]) => {
    const commentMap: Record<string, Comment> = {};
    const rootComments: Comment[] = [];

    // First pass: create a map of id -> comment
    commentsArray.forEach(comment => {
      comment.replies = [];
      commentMap[comment.id] = comment;
    });

    // Second pass: link child comments to parents
    commentsArray.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap[comment.parent_id];
        if (parent) {
          parent.replies?.push(comment);
        } else {
          // If parent doesn't exist, treat as root comment
          rootComments.push(comment);
        }
      } else {
        // Root level comment
        rootComments.push(comment);
      }
    });

    return rootComments;
  };

  // Handle new comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentContent.trim()) return;
    
    if (!user) {
      toast.error("Yorum yapmak için lütfen giriş yapın.");
      router.push('/auth/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: commentContent,
          topic_id: topicId,
          user_id: user.id,
        })
        .select(`
          *,
          author:profiles(name, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      // Increment comment count
      await supabase.rpc('increment_comment_count', { topic_id: topicId });
      
      // Add the new comment to state
      setComments(prev => [...prev, { ...data, replies: [] }]);
      setCommentContent("");
      
      toast.success("Yorumunuz başarıyla eklendi.");
      
    } catch (error) {
      console.error('Comment submit error:', error);
      toast.error("Yorumunuz eklenirken bir sorun oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (parentId: string) => {
    const content = replyContent[parentId];
    if (!content?.trim()) return;
    
    if (!user) {
      toast.error("Yanıt yazmak için lütfen giriş yapın.");
      router.push('/auth/login');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content,
          topic_id: topicId,
          user_id: user.id,
          parent_id: parentId,
        })
        .select(`
          *,
          author:profiles(name, avatar_url)
        `)
        .single();
        
      if (error) throw error;
      
      // Increment comment count
      await supabase.rpc('increment_comment_count', { topic_id: topicId });
      
      // Update the comment tree
      const updatedComments = [...comments];
      const findAndAddReply = (commentsArray: Comment[], newReply: Comment) => {
        for (let i = 0; i < commentsArray.length; i++) {
          if (commentsArray[i].id === parentId) {
            if (!commentsArray[i].replies) {
              commentsArray[i].replies = [];
            }
            commentsArray[i].replies.push({ ...newReply, replies: [] });
            return true;
          }
          if (commentsArray[i].replies && commentsArray[i].replies.length > 0) {
            if (findAndAddReply(commentsArray[i].replies, newReply)) {
              return true;
            }
          }
        }
        return false;
      };
      
      findAndAddReply(updatedComments, data);
      setComments(updatedComments);
      
      // Clear the reply field and hide the reply form
      setReplyContent(prev => ({
        ...prev,
        [parentId]: ''
      }));
      setReplyingTo(null);
      
      toast.success("Yanıtınız başarıyla eklendi.");
      
    } catch (error) {
      console.error('Reply submit error:', error);
      toast.error("Yanıtınız eklenirken bir sorun oluştu. Lütfen tekrar deneyin.");
    }
  };

  // Handle comment like
  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) {
      toast.error("Beğeni yapmak için lütfen giriş yapın.");
      router.push('/auth/login');
      return;
    }
    
    try {
      if (isLiked) {
        // Unlike the comment
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
          
        await supabase.rpc('decrement_comment_likes', { comment_id: commentId });
      } else {
        // Like the comment
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });
          
        await supabase.rpc('increment_comment_likes', { comment_id: commentId });
      }
      
      // Update the comment in state
      const updateLikeStatus = (commentsArray: Comment[]) => {
        return commentsArray.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: isLiked ? (comment.likes - 1) : (comment.likes + 1),
              liked_by_user: !isLiked
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateLikeStatus(comment.replies)
            };
          }
          return comment;
        });
      };
      
      setComments(updateLikeStatus(comments));
      
    } catch (error) {
      console.error('Like comment error:', error);
      toast.error("Beğeni işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Decrement comment count
      await supabase.rpc('decrement_comment_count', { topic_id: topicId });
      
      // Remove the comment from state
      const removeComment = (commentsArray: Comment[]) => {
        return commentsArray.filter(comment => {
          if (comment.id === commentId) {
            return false;
          }
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = removeComment(comment.replies);
          }
          return true;
        });
      };
      
      setComments(removeComment(comments));
      
      toast.success("Yorumunuz başarıyla silindi.");
      
    } catch (error) {
      console.error('Delete comment error:', error);
      toast.error("Yorumunuz silinirken bir sorun oluştu. Lütfen tekrar deneyin.");
    }
  };

  // Render a single comment with its replies
  const renderComment = (comment: Comment, depth = 0) => (
    <div 
      key={comment.id} 
      className={cn(
        "border-l-2 pl-4 py-2 mb-4",
        depth === 0 ? "border-transparent" : "border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author?.avatar_url || ''} alt={comment.author?.name || 'User'} />
          <AvatarFallback>{comment.author?.name?.substring(0, 2) || 'U'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.author?.name || 'Anonymous'}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
          </div>
          
          <div className="mt-2 text-sm">
            {comment.content}
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-8 p-0 text-xs text-muted-foreground",
                comment.liked_by_user && "text-blue-500"
              )}
              onClick={() => handleLikeComment(comment.id, !!comment.liked_by_user)}
            >
              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
              {comment.likes || 0}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 p-0 text-xs text-muted-foreground"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3.5 w-3.5 mr-1" />
              Yanıtla
            </Button>
            
            {user && user.id === comment.user_id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 p-0 text-xs text-muted-foreground">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>
                    Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <Textarea
                value={replyContent[comment.id] || ''}
                onChange={e => setReplyContent({
                  ...replyContent,
                  [comment.id]: e.target.value
                })}
                placeholder="Yanıtınızı yazın..."
                className="min-h-[80px] text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setReplyingTo(null)}
                >
                  İptal
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleReplySubmit(comment.id)}
                  disabled={!replyContent[comment.id]?.trim()}
                >
                  Yanıtla
                </Button>
              </div>
            </div>
          )}
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map(reply => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-4">Yorum Ekle</h3>
          <form onSubmit={handleCommentSubmit}>
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Yorumunuzu buraya yazın..."
              className="mb-4 min-h-[120px]"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!commentContent.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  "Gönderiliyor..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Gönder
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div>
        <div className="flex items-center mb-4">
          <MessageSquare className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">Yorumlar ({comments.length})</h3>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Yorumlar yükleniyor...</p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        ) : (
          <div className="space-y-2">
            {comments.map(comment => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
} 