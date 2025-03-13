const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Mock users for topics
const mockUsers = [
  {
    id: "user1",
    email: "pilot@example.com",
    displayName: "Pilot User",
    photoURL: null,
  },
  {
    id: "user2",
    email: "cabin@example.com",
    displayName: "Cabin Crew",
    photoURL: null,
  },
  {
    id: "user3",
    email: "tech@example.com",
    displayName: "Tech Expert",
    photoURL: null,
  },
];

// Mock topics data
const topics = [
  {
    id: "topic1",
    title: "Pilot Eğitimi Hakkında",
    content: "Pilot eğitimi sürecinde dikkat edilmesi gerekenler...",
    categoryId: "havacilik",
    subcategoryId: "pilotaj",
    authorId: "user1",
    status: "published",
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    tags: ["pilot", "eğitim", "kariyer"],
  },
  {
    id: "topic2",
    title: "Kabin Memurluğu Deneyimleri",
    content: "Kabin memurluğu mesleğinde yaşanan deneyimler...",
    categoryId: "havacilik",
    subcategoryId: "kabin",
    authorId: "user2",
    status: "published",
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    tags: ["kabin", "deneyim", "meslek"],
  },
  {
    id: "topic3",
    title: "Uçak Bakım Süreçleri",
    content: "Uçak bakım süreçlerinde dikkat edilmesi gerekenler...",
    categoryId: "havacilik",
    subcategoryId: "teknik",
    authorId: "user3",
    status: "published",
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    tags: ["bakım", "teknik", "güvenlik"],
  },
  {
    id: "topic4",
    title: "İstanbul Seyahat Rehberi",
    content: "İstanbul'da gezilecek yerler ve öneriler...",
    categoryId: "seyahat",
    subcategoryId: "deneyimler",
    authorId: "user1",
    status: "published",
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    tags: ["istanbul", "seyahat", "gezi"],
  },
  {
    id: "topic5",
    title: "Miles & Smiles Puan Kazanma İpuçları",
    content: "Miles & Smiles programında puan kazanmanın yolları...",
    categoryId: "miles",
    subcategoryId: "puanlar",
    authorId: "user2",
    status: "published",
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    tags: ["miles", "puan", "ipuçları"],
  },
];

async function seedTopics() {
  try {
    console.log("Konular yükleniyor...");

    // First, delete existing topics
    const { error: deleteError } = await supabase
      .from("topics")
      .delete()
      .neq("id", "dummy");

    if (deleteError) throw deleteError;

    // Add mock users first
    for (const user of mockUsers) {
      const { error: userError } = await supabase.from("users").upsert(
        [
          {
            ...user,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: "id",
        }
      );

      if (userError) throw userError;
      console.log(`${user.displayName} kullanıcısı hazırlandı.`);
    }

    // Add topics
    for (const topic of topics) {
      const { error: topicError } = await supabase.from("topics").insert([
        {
          ...topic,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (topicError) throw topicError;
      console.log(`${topic.title} konusu hazırlandı.`);
    }

    console.log("Tüm konular başarıyla yüklendi!");
    process.exit(0);
  } catch (error) {
    console.error("Konular yüklenirken hata:", error);
    process.exit(1);
  }
}

// Start topic seeding
seedTopics();
