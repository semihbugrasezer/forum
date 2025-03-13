const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const categories = [
  {
    id: "havacilik",
    name: "Havacılık",
    description: "Havacılık ile ilgili tüm konular",
    icon: "✈️",
    order: 1,
    post_count: 0,
    subcategories: [
      {
        id: "pilotaj",
        name: "Pilotaj",
        description: "Pilot eğitimi ve pilotluk mesleği",
        order: 1,
        post_count: 0,
      },
      {
        id: "kabin",
        name: "Kabin Ekibi",
        description: "Kabin memurluğu ve hosteslik",
        order: 2,
        post_count: 0,
      },
      {
        id: "teknik",
        name: "Teknik Servis",
        description: "Uçak bakım ve teknik servis",
        order: 3,
        post_count: 0,
      },
    ],
  },
  {
    id: "seyahat",
    name: "Seyahat",
    description: "Seyahat deneyimleri ve öneriler",
    icon: "🌍",
    order: 2,
    post_count: 0,
    subcategories: [
      {
        id: "deneyimler",
        name: "Seyahat Deneyimleri",
        description: "Seyahat hikayeleri ve deneyimler",
        order: 1,
        post_count: 0,
      },
      {
        id: "rotalar",
        name: "Popüler Rotalar",
        description: "Popüler seyahat rotaları",
        order: 2,
        post_count: 0,
      },
      {
        id: "ipuclari",
        name: "Seyahat İpuçları",
        description: "Seyahat önerileri ve ipuçları",
        order: 3,
        post_count: 0,
      },
    ],
  },
  {
    id: "miles",
    name: "Miles & Smiles",
    description: "Miles & Smiles programı hakkında her şey",
    icon: "🎯",
    order: 3,
    post_count: 0,
    subcategories: [
      {
        id: "puanlar",
        name: "Puan Kazanma",
        description: "Miles & Smiles puan kazanma yöntemleri",
        order: 1,
        post_count: 0,
      },
      {
        id: "kullanim",
        name: "Puan Kullanımı",
        description: "Miles & Smiles puanlarını kullanma",
        order: 2,
        post_count: 0,
      },
      {
        id: "elite",
        name: "Elite Üyelik",
        description: "Elite üyelik avantajları ve koşulları",
        order: 3,
        post_count: 0,
      },
    ],
  },
];

async function seedCategories() {
  try {
    console.log("Kategoriler yükleniyor...");

    // First, delete existing categories
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .neq("id", "dummy");

    if (deleteError) throw deleteError;

    // Add new categories
    for (const category of categories) {
      const { subcategories, ...categoryData } = category;

      // Add main category
      const { error: categoryError } = await supabase
        .from("categories")
        .insert([
          {
            ...categoryData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (categoryError) throw categoryError;
      console.log(`${category.name} kategorisi hazırlandı.`);

      // Add subcategories
      for (const subcategory of subcategories) {
        const { error: subcategoryError } = await supabase
          .from("subcategories")
          .insert([
            {
              ...subcategory,
              category_id: category.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);

        if (subcategoryError) throw subcategoryError;
        console.log(
          `${category.name} > ${subcategory.name} alt kategorisi hazırlandı.`
        );
      }
    }

    console.log("Tüm kategoriler başarıyla yüklendi!");
    process.exit(0);
  } catch (error) {
    console.error("Kategoriler yüklenirken hata:", error);
    process.exit(1);
  }
}

// Start category seeding
seedCategories();

// Cache service worker ekleyin
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}
