"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageSquare, ThumbsUp, Calendar, Hash, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Updated Topic interface to match the actual database schema
interface Topic {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  views: number;
  is_pinned: boolean;
  is_locked: boolean;
  last_activity_at: string;
}

// Mock data for related topics
const mockTopics: Topic[] = [
  {
    id: "1",
    title: "Miles&Smiles ile yurtdışı uçuşlarda ekstra mil kazanma",
    content: "THY Miles&Smiles programıyla yurtdışı uçuşlarda ekstra mil kazanmak için ipuçları ve stratejiler. Business class yükseltmelerini nasıl daha uygun şekilde alabilirim?",
    user_id: "user-1",
    category: "Miles&Smiles",
    created_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    likes_count: 45,
    comments_count: 12,
    views: 320,
    is_pinned: false,
    is_locked: false,
    last_activity_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  },
  {
    id: "2",
    title: "İstanbul - New York uçuşu için en iyi koltuk önerileri",
    content: "THY'nin İstanbul-New York rotasında A330-300 uçağında en rahat koltuklar ve kaçınılması gereken yerler hakkında bilgiler ve deneyimlerim.",
    user_id: "user-2",
    category: "Uçuş Deneyimi",
    created_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    likes_count: 32,
    comments_count: 24,
    views: 528,
    is_pinned: false,
    is_locked: false,
    last_activity_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString()
  },
  {
    id: "3",
    title: "THY lounge İstanbul deneyimim ve öneriler",
    content: "İstanbul Havalimanı'ndaki Turkish Airlines Business Lounge'da sunulan hizmetler, yemekler ve dinlenme alanları hakkında detaylı bir inceleme ve ipuçları.",
    user_id: "user-3",
    category: "Lounge",
    created_at: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    likes_count: 87,
    comments_count: 35,
    views: 1120,
    is_pinned: true,
    is_locked: false,
    last_activity_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString()
  },
  {
    id: "4",
    title: "THY'nin yeni ekonomi plus sınıfı değer mi?",
    content: "Türk Hava Yolları'nın uzun mesafeli uçuşlarda sunduğu yeni ekonomi plus sınıfının standart ekonomiye kıyasla avantajları ve dezavantajları nelerdir?",
    user_id: "user-4",
    category: "Uçuş Sınıfları",
    created_at: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    likes_count: 54,
    comments_count: 28,
    views: 890,
    is_pinned: false,
    is_locked: false,
    last_activity_at: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString()
  },
  {
    id: "5",
    title: "THY el bagajı politikası - 2024 güncellemeleri",
    content: "Türk Hava Yolları'nın güncel el bagajı kuralları, ağırlık ve boyut sınırlamalarıyla birlikte fazla bagaj ücretlerinden kaçınma yöntemleri hakkında bilgiler.",
    user_id: "user-5",
    category: "Bagaj",
    created_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    likes_count: 62,
    comments_count: 17,
    views: 780,
    is_pinned: false,
    is_locked: false,
    last_activity_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  },
  {
    id: "6",
    title: "THY kabin ekibi memnuniyeti anketi sonuçları",
    content: "Türk Hava Yolları kabin ekibi memnuniyeti anketi sonuçları ve 2024 yılında yapılacak iyileştirmeler hakkında detaylı bir rapor.",
    user_id: "user-6",
    category: "Hizmet Kalitesi",
    created_at: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    updated_at: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    likes_count: 42,
    comments_count: 19,
    views: 630,
    is_pinned: false,
    is_locked: true,
    last_activity_at: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString()
  }
];

interface RelatedTopicsProps {
  currentTopicId: string;
  categoryId: string;
  tags: string[];
  limit?: number;
}

// Format date to show days instead of seconds
function formatDateAsDays(dateString: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Same day check - return "Bugün"
  if (date.toDateString() === now.toDateString()) {
    return "Bugün";
  }
  
  // Yesterday check - return "Dün"
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Dün";
  }
  
  // Calculate days difference
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If within 7 days, show as "X gün önce"
  if (diffDays < 7) {
    return `${diffDays} gün önce`;
  }
  
  // Use Turkish date format for older dates
  const formatter = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  
  return formatter.format(date);
}

// Get random gradient classes for cards
function getGradientClass(id: string): string {
  // Use the first character of the ID to determine a consistent gradient
  const gradients = [
    "from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-950/30 dark:hover:to-blue-900/30",
    "from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 hover:from-green-100 hover:to-green-200 dark:hover:from-green-950/30 dark:hover:to-green-900/30",
    "from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-950/30 dark:hover:to-purple-900/30",
    "from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 hover:from-amber-100 hover:to-amber-200 dark:hover:from-amber-950/30 dark:hover:to-amber-900/30",
    "from-pink-50 to-pink-100 dark:from-pink-950/20 dark:to-pink-900/20 hover:from-pink-100 hover:to-pink-200 dark:hover:from-pink-950/30 dark:hover:to-pink-900/30",
    "from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-950/30 dark:hover:to-indigo-900/30",
  ];
  
  const index = parseInt(id.charAt(0), 16) % gradients.length;
  return gradients[index];
}

export default function RelatedTopics({
  currentTopicId,
  categoryId,
  tags,
  limit = 4
}: RelatedTopicsProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const supabase = createClient();
  
  useEffect(() => {
    const fetchRelatedTopics = async () => {
      try {
        setIsLoading(true);
        
        // Use mock data if requested or when in development without connection
        if (useMockData || process.env.NODE_ENV === 'development') {
          console.log("Using mock data for related topics");
          // Filter mock data to exclude current topic and respect limit
          const filteredMockTopics = mockTopics
            .filter(topic => topic.id !== currentTopicId)
            .slice(0, limit);
          
          // Simulate network delay for realistic behavior
          setTimeout(() => {
            setTopics(filteredMockTopics);
            setIsLoading(false);
          }, 500);
          return;
        }
        
        if (!tags || tags.length === 0) {
          // If no tags provided, fetch random topics instead
          const { data: randomTopics, error: randomError } = await supabase
            .from('topics')
            .select('*') // Select all columns to avoid specifying problematic ones
            .neq('id', currentTopicId)
            .order('created_at', { ascending: false })
            .limit(limit);
          
          if (!randomError && randomTopics) {
            console.log("Found random topics:", randomTopics);
            setTopics(randomTopics);
          } else if (randomError) {
            console.error("Error fetching random topics:", randomError);
            // Fallback to mock data on error
            setUseMockData(true);
            const filteredMockTopics = mockTopics
              .filter(topic => topic.id !== currentTopicId)
              .slice(0, limit);
            setTopics(filteredMockTopics);
          }
          setIsLoading(false);
          return;
        }
        
        // Try to fetch topics with similar content or title based on tags
        const searchTerms = tags.join(' | ');
        console.log("Searching for topics with terms:", searchTerms);
        
        const { data: relatedTopics, error: relatedError } = await supabase
          .from('topics')
          .select('*') // Select all columns to avoid specifying problematic ones
          .neq('id', currentTopicId)
          .or(`content.ilike.%${searchTerms}%,title.ilike.%${searchTerms}%`)
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (!relatedError && relatedTopics && relatedTopics.length > 0) {
          console.log("Found related topics by content:", relatedTopics);
          setTopics(relatedTopics);
        } else {
          // If no results or error, fetch most recent topics as fallback
          console.log("No related topics found or error occurred, fetching recent topics");
          const { data: recentTopics, error: recentError } = await supabase
            .from('topics')
            .select('*') // Select all columns to avoid specifying problematic ones
            .neq('id', currentTopicId)
            .order('created_at', { ascending: false })
            .limit(limit);
          
          if (!recentError && recentTopics && recentTopics.length > 0) {
            console.log("Found recent topics:", recentTopics);
            setTopics(recentTopics);
          } else {
            console.error("Error fetching recent topics or no topics found:", recentError);
            // Fallback to mock data on error or no results
            setUseMockData(true);
            const filteredMockTopics = mockTopics
              .filter(topic => topic.id !== currentTopicId)
              .slice(0, limit);
            setTopics(filteredMockTopics);
          }
        }
      } catch (error) {
        console.error('Error fetching related topics:', error);
        // Fallback to mock data on any error
        setUseMockData(true);
        const filteredMockTopics = mockTopics
          .filter(topic => topic.id !== currentTopicId)
          .slice(0, limit);
        setTopics(filteredMockTopics);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelatedTopics();
  }, [currentTopicId, categoryId, tags, limit, supabase, useMockData]);
  
  // Force using mock data for testing purposes (can be controlled via a button in development)
  const toggleMockData = () => {
    setUseMockData(!useMockData);
  };
  
  if (isLoading) {
    return (
      <section 
        aria-labelledby="related-topics-heading" 
        className="mt-4 mb-6 px-2 sm:px-0 rounded-xl p-4 sm:p-5 border border-border/30 bg-card shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/20">
          <div className="bg-primary/15 p-1.5 rounded-lg">
            <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-primary/70" />
          </div>
          <h2 id="related-topics-heading" className="text-lg sm:text-xl font-bold text-foreground">İlgili Konular</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden bg-muted/20 border border-border/20 animate-pulse">
              <div className="p-3 h-full flex flex-col">
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-5 w-1/3 mb-3" />
                
                <div className="mt-auto flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (topics.length === 0) {
    return null;
  }
  
  return (
    <section 
      aria-labelledby="related-topics-heading" 
      className="mt-4 mb-6 px-2 sm:px-0 rounded-xl p-4 sm:p-5 border border-border/30 bg-card shadow-sm"
      itemScope itemType="https://schema.org/ItemList"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <div className="bg-primary/15 p-1.5 rounded-lg">
            <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 id="related-topics-heading" className="text-lg sm:text-xl font-bold text-foreground" itemProp="name">
            İlgili Konular
          </h2>
        </div>
        
        {/* Development only toggle for mock data */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={toggleMockData}
            className="text-xs px-2 py-1 rounded-md bg-muted/50 hover:bg-primary/10 transition-colors duration-200 border border-border/40 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label={useMockData ? "Gerçek veri kullan" : "Mock veri kullan"}
          >
            {useMockData ? "Gerçek veri" : "Mock veri"}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-3" role="list">
        {topics.map((topic, index) => (
          <div 
            key={topic.id}
            className="rounded-lg overflow-hidden bg-muted/20 hover:bg-muted/30 transition-colors border border-border/20 hover:border-border/30"
            itemScope itemType="https://schema.org/ListItem"
            itemProp="itemListElement"
            role="listitem"
          >
            <meta itemProp="position" content={`${index + 1}`} />
            <Link 
              href={`/topics/${topic.id}`} 
              className="block h-full group"
              title={topic.title}
              itemProp="url"
            >
              <div className="p-3 h-full flex flex-col">              
                <div className="mb-2">
                  <h3 
                    className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors duration-200"
                    itemProp="name"
                  >
                    {truncate(topic.title, 60)}
                  </h3>
                  
                  {topic.category && (
                    <div className="mt-1.5 flex items-center">
                      <Badge 
                        variant="outline" 
                        className="text-xs inline-flex border-primary/20 group-hover:border-primary/40 transition-colors px-1.5 py-0 h-5" 
                        itemProp="keywords"
                      >
                        <Tag className="h-2.5 w-2.5 mr-1 text-primary/80" />
                        {topic.category}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0 text-primary/70" />
                    <time dateTime={topic.created_at} itemProp="datePublished">{formatDateAsDays(topic.created_at)}</time>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1 flex-shrink-0 text-primary/70" />
                      <span itemProp="commentCount">{topic.comments_count || 0}</span>
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1 flex-shrink-0 text-primary/70" />
                      <span itemProp="interactionStatistic">{topic.likes_count || 0}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
} 