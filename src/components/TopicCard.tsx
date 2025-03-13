"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatNumber, cn, slugify } from "@/lib/utils";
import {
  MessageSquare,
  Star,
  Users,
  ArrowUp,
  ArrowDown,
  Heart,
  Share2,
  ChevronRight,
} from "lucide-react";

interface Topic {
  id: number | string;
  title: string;
  author: string;
  category: string;
  comments: number;
  views: number;
  votes: number;
  createdAt: Date;
  pinned?: boolean;
  hot?: boolean;
  slug?: string;
  image?: string | null;
}

interface TopicCardProps {
  topic: Topic;
  pathPrefix?: string;
}

export default function TopicCard({ topic, pathPrefix = "/forum" }: TopicCardProps) {
  const [userVote, setUserVote] = useState(0);
  
  const handleVote = (vote: number) => {
    setUserVote(vote === userVote ? 0 : vote);
  };
  
  // Eğer slug değeri yoksa başlıktan oluştur
  const topicSlug = topic.slug || slugify(topic.title);
  
  return (
    <Card className={cn(
      "transition-all hover:border-blue-200 dark:hover:border-blue-900",
      topic.pinned && "border-l-4 border-l-blue-500"
    )}>
      <CardContent className="p-0">
        <div className="flex">
          {/* Sol: Oy Bölümü */}
          <div className="flex flex-col items-center justify-start py-4 px-2 bg-gray-50 dark:bg-gray-900/30 border-r w-14">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-6 w-6", 
                userVote === 1 && "text-blue-600"
              )}
              onClick={() => handleVote(1)}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium my-1">{topic.votes + (userVote === 1 ? 1 : userVote === -1 ? -1 : 0)}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-6 w-6",
                userVote === -1 && "text-red-600"
              )}
              onClick={() => handleVote(-1)}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Orta: Ana İçerik */}
          <div className="flex-1 p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {topic.hot && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Popüler</Badge>
                )}
                <Badge variant="outline">{topic.category}</Badge>
                <span>• {topic.author} tarafından • {formatDate(topic.createdAt)}</span>
              </div>
              
              <Link href={`${pathPrefix}/topics/${topicSlug}`} className="group">
                <h3 className="text-xl font-semibold group-hover:text-blue-600 group-hover:underline decoration-from-font">
                  {topic.pinned && <Star className="inline h-4 w-4 mr-1 text-blue-500" />}
                  {topic.title}
                </h3>
                {topic.image && (
                  <div className="mt-3 relative w-full h-40 rounded-md overflow-hidden">
                    <img
                      src={topic.image}
                      alt={topic.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </Link>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {formatNumber(topic.comments)} yorum
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {formatNumber(topic.views)} görüntüleme
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-2 flex justify-end gap-2">
        <Button variant="ghost" size="sm" className="h-8">
          <Heart className="h-4 w-4 mr-1" />
          <span className="text-xs">Kaydet</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8">
          <Share2 className="h-4 w-4 mr-1" />
          <span className="text-xs">Paylaş</span>
        </Button>
        <Button variant="default" size="sm" className="h-8 ml-auto" asChild>
          <Link href={`${pathPrefix}/topics/${topicSlug}`}>
            <ChevronRight className="h-4 w-4" />
            <span className="text-xs">Konuya Git</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 