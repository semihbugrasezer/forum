"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface BookmarkButtonProps {
  topicId: string;
  size?: "default" | "sm";
  variant?: "default" | "ghost" | "outline";
  className?: string;
  showText?: boolean;
}

export default function BookmarkButton({
  topicId,
  size = "default",
  variant = "ghost",
  className = "",
  showText = true
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const supabase = createBrowserSupabaseClient();
  
  // Check if topic is bookmarked when component mounts
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        setIsChecking(true);
        const { data: session } = await supabase.auth.getSession();
        
        if (!session?.session?.user) {
          setIsChecking(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('topic_id', topicId)
          .eq('user_id', session.session.user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        setIsBookmarked(!!data);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkBookmarkStatus();
  }, [topicId, supabase]);
  
  const toggleBookmark = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast.error("Konuyu kaydetmek için lütfen giriş yapın");
        return;
      }
      
      setIsLoading(true);
      
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('topic_id', topicId)
          .eq('user_id', session.session.user.id);
          
        if (error) throw error;
        
        setIsBookmarked(false);
        toast.success("Konu kaydedilenlerden çıkarıldı");
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            topic_id: topicId,
            user_id: session.session.user.id,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        setIsBookmarked(true);
        toast.success("Konu kaydedildi");
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error("İşlem sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground'}`}
      onClick={toggleBookmark}
      disabled={isLoading || isChecking}
    >
      <Bookmark 
        className={`${size === "sm" ? "h-4 w-4 mr-1" : "h-5 w-5 mr-2"} ${isBookmarked ? 'fill-current' : ''}`} 
      />
      {showText && <span>{isBookmarked ? "Kaydedildi" : "Kaydet"}</span>}
    </Button>
  );
} 