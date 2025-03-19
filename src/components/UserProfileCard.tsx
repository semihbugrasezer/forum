import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate, formatNumber } from "@/lib/utils";
import { User } from "lucide-react";

interface UserProfileCardProps {
  user: {
    id: string;
    name: string;
    avatar_url?: string | null;
    bio?: string | null;
    created_at: string;
    topic_count?: number;
    comment_count?: number;
    like_count?: number;
  };
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <Card className="overflow-hidden border border-border">
      <div className="bg-gradient-to-r from-primary/30 to-primary/10 h-24 relative">
        <Avatar className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 h-24 w-24 border-4 border-background">
          <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
          <AvatarFallback className="bg-primary/60 text-primary-foreground text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <CardContent className="mt-14 text-center">
        <h3 className="text-xl font-bold mb-1">{user.name}</h3>
        
        <div className="flex justify-center items-center text-xs text-muted-foreground mb-3">
          <User className="h-3 w-3 mr-1" />
          <span>THY Forum üyesi • {formatDate(new Date(user.created_at))}</span>
        </div>
        
        {user.bio && (
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            {user.bio}
          </p>
        )}
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center">
            <span className="text-lg font-bold text-primary">{formatNumber(user.topic_count || 0)}</span>
            <span className="text-xs text-muted-foreground">Konu</span>
          </div>
          <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center">
            <span className="text-lg font-bold text-primary">{formatNumber(user.comment_count || 0)}</span>
            <span className="text-xs text-muted-foreground">Yorum</span>
          </div>
          <div className="bg-muted/30 p-3 rounded-md flex flex-col items-center">
            <span className="text-lg font-bold text-primary">{formatNumber(user.like_count || 0)}</span>
            <span className="text-xs text-muted-foreground">Beğeni</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 