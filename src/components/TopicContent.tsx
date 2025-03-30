"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Tag, Eye, Calendar, User, Mail } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface TopicContentProps {
  id: string;
}

export function TopicContent({ id }: TopicContentProps) {
  const [topic, setTopic] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Fetch topic details
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select(`
            *,
            user:user_id (id, name, email, avatar_url),
            category:category_id (id, name, slug)
          `)
          .eq('id', id)
          .single();
        
        if (topicError) throw topicError;
        
        // Increment view count
        await supabase
          .from('topics')
          .update({ view_count: (topicData.view_count || 0) + 1 })
          .eq('id', id);
        
        setTopic(topicData);
      } catch (err) {
        console.error('Error fetching topic:', err);
        setError('Konu yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchTopic();
    }
  }, [id]);
  
  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="h-8 w-3/4 bg-muted rounded animate-pulse mb-4"></div>
          <div className="h-4 w-1/4 bg-muted rounded animate-pulse mb-6"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.refresh()}
          >
            Yeniden Dene
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!topic) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6 text-center">
          <p>Konu bulunamadı.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/forum')}
          >
            Forum'a Dön
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const timeAgo = topic.created_at ? formatDate(new Date(topic.created_at)) : '';
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
          {topic.category && (
            <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 border-primary/20">
              <Tag className="w-3 h-3 mr-1" />
              <Link href={`/forum/category/${topic.category.slug}`}>
                {topic.category.name}
              </Link>
            </Badge>
          )}
          
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            <span>{formatNumber(topic.view_count || 0)} görüntülenme</span>
          </span>
          
          <time dateTime={topic.created_at} className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{timeAgo}</span>
          </time>
        </div>
        
        <CardTitle className="text-2xl">{topic.title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center mb-4 p-3 bg-muted/30 rounded-lg">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={topic.user?.avatar_url || ''} alt={topic.user?.name || 'Kullanıcı'} />
            <AvatarFallback>
              {(topic.user?.name?.charAt(0) || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium flex items-center">
              <User className="w-3 h-3 mr-1 text-muted-foreground" />
              {topic.user?.name || 'İsimsiz Kullanıcı'}
            </p>
            {topic.user?.email && (
              <p className="text-xs text-muted-foreground flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {topic.user.email}
              </p>
            )}
          </div>
        </div>
        
        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
          {topic.content && (
            <div dangerouslySetInnerHTML={{ __html: topic.content }} />
          )}
        </div>
      </CardContent>
    </Card>
  );
} 