import { Metadata } from 'next';
import { MessageSquare, Tag, Eye, Calendar, Share2, Flag, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { addComment, getCommentsByTopicId } from '@/lib/actions/comments';
import { CommentForm } from '@/components/comment-form';
import Script from 'next/script';
import RelatedTopics from '@/components/RelatedTopics';

// Base mock topic template
const baseMockTopic = {
  created_at: new Date().toISOString(),
  updated_at: null,
  user_id: 'sample-user',
  votes: 5,
  view_count: 10,
  comment_count: 2,
  category_id: 'general',
  author: {
    name: 'Test User',
    avatar_url: null,
    bio: 'This is a test user profile with expertise in forum topics and community engagement'
  },
  category: {
    name: 'General',
    slug: 'general'
  },
  tags: ['test', 'development']
};

// Updated mock topic database with THY forum topics
const mockTopicsDb: {
  [key: string]: {
    id: string;
    title: string;
    content: string;
    slug: string;
    tags: string[];
    author: {
      name: string;
      avatar_url: string | null;
      bio?: string;
    };
    category: {
      name: string;
      slug: string;
    };
    created_at: string;
    updated_at?: string | null;
    view_count: number;
    comment_count: number;
    is_popular?: boolean;
  }
} = {
  'miles-smiles-puan-sorgulama': {
    id: '1',
    title: 'Miles&Smiles puan sorgulama',
    content: 'Miles&Smiles programında biriken puanlarımı nasıl sorgulayabilirim? Web sitesinde bazı problemler yaşıyorum ve mobil uygulama bazen güncel bilgileri göstermiyor. En doğru şekilde puan bakiyemi nasıl öğrenebilirim?',
    slug: 'miles-smiles-puan-sorgulama',
    tags: ['miles&smiles', 'puan sorgulama', 'thy'],
    author: {
      name: 'Ahmet Y.',
      avatar_url: null,
      bio: 'Ahmet Y.'
    },
    category: {
      name: 'Miles&Smiles',
      slug: 'miles-smiles'
    },
    created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString(), // 3 gün önce
    view_count: 345,
    comment_count: 12,
    is_popular: true
  },
  'avrupaya-en-uygun-fiyatli-biletler': {
    id: '2',
    title: 'Avrupa\'ya en uygun fiyatlı biletler',
    content: 'Önümüzdeki yaz tatili için Avrupa\'ya uçmayı planlıyorum ve en uygun fiyatlı biletleri arıyorum. Özellikle Paris, Barselona ve Roma rotalarına ilgim var. Bu rotalara en uygun fiyatla bilet almak için önerileriniz nelerdir? Hangi aylar daha uygun oluyor ve ne kadar önceden rezervasyon yapmak gerekir?',
    slug: 'avrupaya-en-uygun-fiyatli-biletler',
    tags: ['avrupa', 'ekonomi bilet', 'seyahat planlama'],
    author: {
      name: 'Mehmet S.',
      avatar_url: null,
      bio: 'Mehmet S.'
    },
    category: {
      name: 'Yurt Dışı Uçuşlar',
      slug: 'yurt-disi-ucuslar'
    },
    created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString(), // 5 gün önce
    view_count: 210,
    comment_count: 7,
    is_popular: true
  },
  'business-class-deneyimi': {
    id: '3',
    title: 'Business Class deneyimi',
    content: 'Geçen hafta THY ile İstanbul-Londra rotasında ilk defa Business Class deneyimim oldu ve gerçekten çok etkilendim. Koltuklar son derece rahat, ikramlar mükemmeldi ve özellikle uçak içi eğlence sistemi çok kaliteliydi. Yeni business class koltuklarının yatağa dönüşümü kusursuz. Benim gibi business classı ilk kez deneyecek olanlar için tüyolarım var...',
    slug: 'business-class-deneyimi',
    tags: ['business class', 'uçuş deneyimi', 'kabin'],
    author: {
      name: 'Fatma K.',
      avatar_url: null,
      bio: 'Fatma K.'
    },
    category: {
      name: 'Kabin Deneyimi',
      slug: 'kabin-deneyimi'
    },
    created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString(), // 1 hafta önce
    view_count: 560,
    comment_count: 25,
    is_popular: true
  },
  'uygulama-uzerinden-check-in-yapamiyorum': {
    id: '4',
    title: 'Uygulama üzerinden check-in yapamıyorum',
    content: 'THY mobil uygulamasını kullanarak check-in yapmaya çalışıyorum ancak sürekli hata alıyorum. Yarın sabah erken bir uçuşum var ve online check-in yapmak istiyorum. Uygulama son sürüm ve telefonum güncel. Hata mesajı: "İşleminiz şu anda gerçekleştirilemiyor. Lütfen daha sonra tekrar deneyin." Bu sorunu yaşayan ve çözüm bulan var mı?',
    slug: 'uygulama-uzerinden-check-in-yapamiyorum',
    tags: ['mobil uygulama', 'check-in', 'teknik sorun'],
    author: {
      name: 'Zeynep A.',
      avatar_url: null,
      bio: 'Zeynep A.'
    },
    category: {
      name: 'THY Mobil Uygulama',
      slug: 'thy-mobil-uygulama'
    },
    created_at: new Date(Date.now() - 14*24*60*60*1000).toISOString(), // 2 hafta önce
    view_count: 120,
    comment_count: 5
  },
  'bilet-degisikligi-nasil-yapilir': {
    id: '5',
    title: 'Bilet değişikliği nasıl yapılır?',
    content: 'İki hafta sonrası için almış olduğum İzmir-İstanbul uçuşumu tarih değişikliği yapmam gerekiyor. Web sitesi üzerinden değişiklik yapmaya çalıştığımda ücret farkı çok yüksek çıkıyor. Bilet değişikliği için en uygun yol hangisidir? Çağrı merkezini aramak daha mı avantajlı olur yoksa havalimanındaki ofise gitmeli miyim? Deneyimi olan var mı?',
    slug: 'bilet-degisikligi-nasil-yapilir',
    tags: ['bilet değişikliği', 'rezervasyon', 'ücret farkı'],
    author: {
      name: 'Ali B.',
      avatar_url: null,
      bio: 'Ali B.'
    },
    category: {
      name: 'Bilet İşlemleri',
      slug: 'bilet-islemleri'
    },
    created_at: new Date(Date.now() - 21*24*60*60*1000).toISOString(), // 3 hafta önce
    view_count: 430,
    comment_count: 18
  },
  'istanbul-havalimani-uygun-yiyecek-onerileri': {
    id: '6',
    title: 'İstanbul Havalimanı\'nda uygun yiyecek önerileri',
    content: 'İstanbul Havalimanı\'nda uzun aktarmam var ve fiyatlar oldukça yüksek. Havalimanında makul fiyatlı yeme-içme önerileri olan var mı? Özellikle terminal içinde daha uygun fiyatlı restoranlar veya kafeler arıyorum. Bir de duty free\'den alışveriş yapmayı düşünüyorum, avantajlı mı sizce? Teşekkürler.',
    slug: 'istanbul-havalimani-uygun-yiyecek-onerileri',
    tags: ['istanbul havalimanı', 'yeme içme', 'ekonomik'],
    author: {
      name: 'Merve D.',
      avatar_url: null,
      bio: 'Merve D.'
    },
    category: {
      name: 'Seyahat İpuçları',
      slug: 'seyahat-ipuclari'
    },
    created_at: new Date(Date.now() - 30*24*60*60*1000).toISOString(), // 1 ay önce
    view_count: 430,
    comment_count: 18,
    is_popular: true
  },
};

// Create a lookup by ID for efficient access
const topicsById: {[key: string]: any} = {};
Object.values(mockTopicsDb).forEach(topic => {
  topicsById[topic.id] = topic;
});

// Group topics by category for category pages
const topicsByCategory: {[key: string]: any[]} = {};
Object.values(mockTopicsDb).forEach(topic => {
  const categorySlug = topic.category.slug;
  if (!topicsByCategory[categorySlug]) {
    topicsByCategory[categorySlug] = [];
  }
  topicsByCategory[categorySlug].push(topic);
});

// Function to get topic by slug or ID
function getTopicBySlug(slug: string) {
  // Try to find the topic in our mock database
  const topicData = mockTopicsDb[slug];
  if (!topicData) {
    // If not found by slug, check if this is a numeric ID
    // and try to find a topic with that ID
    if (!isNaN(Number(slug))) {
      const topicById = Object.values(mockTopicsDb).find(topic => topic.id === slug);
      if (topicById) return topicById;
    }
    
    // If still not found, return the first topic as fallback
    return Object.values(mockTopicsDb)[0];
  }
  return topicData;
}

// Generate structured data for better SEO
function generateStructuredData(topic: ReturnType<typeof getTopicBySlug>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    'headline': topic.title,
    'dateCreated': topic.created_at,
    'dateModified': topic.updated_at || topic.created_at,
    'author': {
      '@type': 'Person',
      'name': topic.author.name
    },
    'interactionStatistic': [
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/ViewAction',
        'userInteractionCount': topic.view_count
      },
      {
        '@type': 'InteractionCounter',
        'interactionType': 'https://schema.org/CommentAction',
        'userInteractionCount': topic.comment_count
      }
    ],
    'keywords': topic.tags.join(',')
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // In Next.js 13+, await params
  const { slug } = await params;
  console.log('Generating metadata for slug:', slug);
  
  // Get topic data based on slug
  const topic = getTopicBySlug(slug);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://thy-forum.vercel.app';
  const canonicalUrl = `${baseUrl}/topics/${topic.id}`; // Use ID for canonical URL
  return {
    title: `${topic.title} | THY Forum`,
    description: topic.content.substring(0, 160),
    keywords: topic.tags?.join(', '),
    alternates: {
      canonical: canonicalUrl
    },
    authors: [
      {
        name: topic.author?.name,
        url: `/users/${topic.author?.name?.toLowerCase().replace(/\s+/g, '-') || 'anonymous'}`
      }
    ],
    openGraph: {
      title: topic.title,
      description: topic.content.substring(0, 160),
      url: canonicalUrl,
      type: 'article',
      publishedTime: topic.created_at,
      modifiedTime: topic.updated_at || topic.created_at,
      authors: [topic.author?.name],
      tags: topic.tags
    },
    twitter: {
      card: 'summary_large_image',
      title: topic.title,
      description: topic.content.substring(0, 160),
      creator: topic.author?.name
    }
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
}

export default async function TopicPage({ params }: { params: { slug: string } }) {
  // In Next.js app router, use await for params in async components
  const { slug } = await params;
  
  try {
    const topic = getTopicBySlug(slug);
    const { comments } = await getCommentsByTopicId(topic.id);

    // Format the creation date
    const timeAgo = getTimeAgo(new Date(topic.created_at));

    // Yeni meta veri eklemeleri
    const seoDescription = `${topic.content.substring(0, 150)}... Daha fazlasını okuyun ve yorum yapın!`;
    const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/forum/topics/${topic.slug}`;

    return (
      <>
        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify({
            ...generateStructuredData(topic),
            author: {
              "@type": "Person",
              "name": topic.author.name,
              "url": canonicalUrl
            }
          })}
        </Script>
        
        <main className="container max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {/* Mobil için optimize edilmiş başlık */}
          <h1 className="text-2xl font-bold md:hidden mb-4 text-foreground/90">{topic.title}</h1>
          
          <article className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            {/* Updated Breadcrumbs with dynamic topic title and category */}
            <nav aria-label="Breadcrumbs" className="col-span-1 md:col-span-4 mb-2 text-sm bg-muted/50 p-2 rounded-lg">
              <ol className="flex flex-wrap items-center text-gray-500 dark:text-gray-400">
                <li><Link href="/" className="hover:underline">Ana Sayfa</Link></li>
                <li><span className="mx-2">/</span></li>
                <li><Link href="/forum" className="hover:underline">Forum</Link></li>
                <li><span className="mx-2">/</span></li>
                <li>
                  <Link href={`/forum/categories/${topic.category.slug}`} className="hover:underline">
                    {topic.category?.name}
                  </Link>
                </li>
                <li><span className="mx-2">/</span></li>
                <li aria-current="page" className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                  {topic.title}
                </li>
              </ol>
            </nav>

            {/* Main content section - improved responsive layout */}
            <section className="col-span-1 md:col-span-3 space-y-4 md:space-y-6">
              <div className="bg-card rounded-xl shadow-sm border border-border/40 overflow-hidden">
                {/* Mobil için optimize edilmiş başlık ve metadata */}
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                    {/* Voting buttons - stacked horizontally on mobile */}
                    <div className="flex sm:flex-col items-center sm:items-center space-x-4 sm:space-x-0 sm:space-y-2 mb-4 sm:mb-0 bg-accent/20 rounded-lg p-2">
                      <button 
                        aria-label="Upvote"
                        className="text-green-500 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 p-1 rounded hover:bg-accent"
                      >  
                        ▲
                      </button>
                      <span className="font-medium text-foreground/90">{topic.comment_count}</span>
                      <button 
                        aria-label="Downvote"
                        className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 p-1 rounded hover:bg-accent"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex-1">
                      <header>
                        {/* Topic metadata badge group */}
                        <div className="flex flex-wrap items-center gap-2 text-xs mb-3 bg-muted/30 p-2 rounded-lg">
                          <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 border-primary/20">
                            <Tag className="w-3 h-3 mr-1" />
                            <span>{topic.category?.name}</span>
                          </Badge>
                          
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            <span>{formatNumber(topic.view_count || 0)} görüntülenme</span>
                          </span>
                          
                          <time dateTime={topic.created_at} className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{timeAgo}</span>
                          </time>

                          {topic.is_popular && (
                            <Badge variant="default" className="bg-orange-500">
                              Popüler
                            </Badge>
                          )}
                        </div>
                        
                        {/* Masaüstü için gizlenmiş başlık */}
                        <h1 className="hidden md:block text-2xl md:text-3xl font-bold mb-4 text-foreground/90">{topic.title}</h1>
                      </header>

                      {/* Okunabilir içerik alanı */}
                      <div className="prose prose-sm sm:prose dark:prose-invert max-w-none mb-6 bg-card p-3 rounded-lg border border-border/20">
                        {topic.content.split('\n').map((line, index) => (
                          <p key={index} className="mb-3">{line}</p>
                        ))}
                      </div>
                      
                      {/* Etiketler - Mobil için kaydırılabilir */}
                      {topic.tags?.length > 0 && (
                        <div className="flex overflow-x-auto py-2 px-1 mb-4 gap-2 md:flex-wrap">
                          {topic.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="whitespace-nowrap hover:bg-secondary/80 transition-colors">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Yazar bilgisi - Mobil için kompakt */}
                      <div className="flex items-center p-4 bg-muted/30 rounded-xl border border-border/30">
                        <Avatar className="h-10 w-10 mr-3 border-2 border-primary/20 ring-2 ring-background">
                          <AvatarImage src={topic.author?.avatar_url ?? undefined} alt={topic.author?.name || 'User'} />
                          <AvatarFallback>{topic.author?.name?.substring(0, 2) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{topic.author?.name || 'Anonymous'}</div>
                          <div className="text-xs text-muted-foreground">
                            THY Forum Üyesi
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Yorum formu - Mobil için optimize */}
                <div className="p-4 md:p-5 bg-muted/20 border-t border-border/20">
                  <h3 className="font-semibold text-base mb-3 text-foreground/90">Yanıtla</h3>
                  <CommentForm topicId={topic.id} />
                </div>

                {/* Yorumlar bölümü */}
                <div className="p-4 md:p-5 space-y-4 border-t border-border/20">
                  <h3 className="font-semibold text-lg flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary/70" />
                    <span>{comments?.length || 0} Yorum</span>
                  </h3>
                  
                  {/* Comment list with improved styling */}
                  <div className="space-y-3">
                    {comments?.map((comment) => (
                      <div key={comment.id} className="p-3 md:p-4 bg-card rounded-lg border border-border/30 hover:border-border/60 transition-colors">
                        <div className="flex items-center mb-2">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={comment.user_avatar ?? undefined} />
                            <AvatarFallback>{comment.user_name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{comment.user_name}</span>
                          <span className="mx-2 text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90">{comment.content}</p>
                      </div>
                    ))}
                    
                    {/* Empty state for no comments */}
                    {(!comments || comments.length === 0) && (
                      <div className="text-center py-6 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p>Henüz yorum yapılmamış. İlk yorumu yapan sen ol!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Sidebar with RelatedTopics - improved mobile visibility */}
            <aside className="col-span-1 md:col-span-1 order-first md:order-last">
              <div className="hidden md:block sticky top-4">
                <RelatedTopics 
                  currentTopicId={topic.id}
                  categoryId={topic.category.slug}
                  tags={topic.tags}
                  limit={4}
                />
              </div>
            </aside>
          </article>
        </main>

        {/* Add RelatedTopics for mobile at the end of the main content */}
        <div className="mt-6 md:hidden">
          <RelatedTopics 
            currentTopicId={topic.id}
            categoryId={topic.category.slug}
            tags={topic.tags}
            limit={3}
          />
        </div>
      </>
    );
  } catch (error) {
    console.error('Error in topic page:', error);
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Konu Bulunamadı</h1>
        <p className="mb-6">Aradığınız konu bulunamadı veya ulaşılamıyor.</p>
        <Link 
          href="/forum" 
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          Forum Ana Sayfa
        </Link>
      </div>
    );
  }
}

function getTimeAgo(date: Date): string {
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
  
  // Within 4 weeks, show as "X hafta önce"
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} hafta önce`;
  }
  
  // Within 12 months, show as "X ay önce"
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ay önce`;
  }
  
  // Older than a year, show as "X yıl önce"
  const years = Math.floor(diffDays / 365);
  return `${years} yıl önce`;
}
