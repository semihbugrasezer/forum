"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Flag, Reply, Edit, Trash2, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  topicId: string;
}

export function CommentSection({ topicId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch comments and user
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Get comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            user:user_id (id, name, email, avatar_url)
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });
        
        if (commentsError) throw commentsError;
        
        setComments(commentsData || []);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Yorumlar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    if (topicId) {
      fetchData();
    }
  }, [topicId]);

  // Handle submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Hata",
        description: "Yorum içeriği boş olamaz.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Giriş Yapın",
        description: "Yorum yapabilmek için giriş yapmalısınız.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          topic_id: topicId,
          user_id: user.id,
          content: newComment
        })
        .select(`
          *,
          user:user_id (id, name, email, avatar_url)
        `)
        .single();
      
      if (error) throw error;
      
      setComments([...comments, data]);
      setNewComment("");
      
      toast({
        title: "Başarılı",
        description: "Yorumunuz eklendi.",
        variant: "default"
      });
    } catch (err) {
      console.error('Error submitting comment:', err);
      toast({
        title: "Hata",
        description: "Yorumunuz eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MessageSquare className="mr-2 h-5 w-5" />
            Yorumlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-full bg-muted rounded animate-pulse"></div>
                  <div className="h-3 w-2/3 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <MessageSquare className="mr-2 h-5 w-5" />
            Yorumlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-red-500">
            <AlertTriangle className="mr-2 h-5 w-5" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <MessageSquare className="mr-2 h-5 w-5" />
          Yorumlar ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comment List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Bu konuya henüz yorum yapılmamış. İlk yorumu sen yap!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.user?.avatar_url || ''} alt={comment.user?.name || 'Kullanıcı'} />
                  <AvatarFallback>
                    {(comment.user?.name?.charAt(0) || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{comment.user?.name || 'İsimsiz Kullanıcı'}</span>
                    <span className="text-xs text-muted-foreground">
                      {comment.created_at && formatDate(new Date(comment.created_at))}
                    </span>
                  </div>
                  <div className="text-sm mb-2">{comment.content}</div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <button className="flex items-center hover:text-primary">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Beğen
                    </button>
                    <button className="flex items-center hover:text-primary">
                      <Reply className="h-3 w-3 mr-1" />
                      Yanıtla
                    </button>
                    <button className="flex items-center hover:text-destructive">
                      <Flag className="h-3 w-3 mr-1" />
                      Bildir
                    </button>
                    
                    {user && user.id === comment.user_id && (
                      <>
                        <button className="flex items-center hover:text-primary">
                          <Edit className="h-3 w-3 mr-1" />
                          Düzenle
                        </button>
                        <button className="flex items-center hover:text-destructive">
                          <Trash2 className="h-3 w-3 mr-1" />
                          Sil
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <Textarea
            placeholder="Yorumunuzu yazın..."
            className="mb-3"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user || submitting}
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={!user || submitting}
            >
              {submitting ? 'Gönderiliyor...' : 'Yorum Gönder'}
            </Button>
          </div>
          {!user && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Yorum yapabilmek için giriş yapmalısınız.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 