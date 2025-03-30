'use server';

import { createClient } from '@/lib/supabase/server';

interface SeedTopic {
  title: string;
  content: string;
  tags: string[];
  category_id?: string;
}

const sampleTopics: SeedTopic[] = [
  {
    title: "Miles&Smiles puan sorgulama",
    content: "Puanlarımı Miles&Smiles uygulamasında göremiyorum. Nasıl sorgulayabilirim? Son uçuşumdan sonra puanlarım hesabıma işlenmedi.",
    tags: ["Miles&Smiles", "Puan", "Sorgulama"]
  },
  {
    title: "Avrupa'ya en uygun fiyatlı biletler",
    content: "Bu yaz Paris, Roma ve Barselona'ya seyahat etmek istiyorum. En uygun fiyatlı biletleri bulmak için önerileriniz neler? Hangi dönemde rezervasyon yapmalıyım?",
    tags: ["Avrupa", "Uçak Bileti", "Fiyat"]
  },
  {
    title: "Business Class deneyimi",
    content: "İstanbul-Londra uçuşunda Business Class deneyimimi paylaşmak istiyorum. Yeni koltuklar ve ikramlar hakkında detaylı bilgi verebilirim. Sorularınızı yanıtlamaktan memnuniyet duyarım.",
    tags: ["Business Class", "Uçuş Deneyimi", "Londra"]
  },
  {
    title: "Uygulama üzerinden check-in yapamıyorum",
    content: "THY mobil uygulaması üzerinden check-in yapmaya çalışıyorum ancak sürekli hata alıyorum. Uygulama en son sürüm ve internet bağlantımda sorun yok. Benzer sorun yaşayan var mı?",
    tags: ["Mobil Uygulama", "Check-in", "Teknik Sorun"]
  },
  {
    title: "Bilet değişikliği nasıl yapılır?",
    content: "Acil bir durum nedeniyle uçuş tarihimi değiştirmem gerekiyor. Web sitesi üzerinden nasıl değişiklik yapabilirim? Ek ücret ödemem gerekir mi?",
    tags: ["Bilet Değişikliği", "Rezervasyon", "İptal"]
  }
];

/**
 * Veritabanına örnek konular ekler
 */
export async function seedTopics(adminEmail: string) {
  try {
    if (!adminEmail || !adminEmail.endsWith('@thy.com')) {
      return { error: 'Yetkilendirme hatası: Sadece THY çalışanları örnek veri ekleyebilir' };
    }

    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return { error: 'Kullanıcı bulunamadı' };
    }

    // Check if user is admin or has thy.com email
    if (!adminEmail.endsWith('@thy.com') && userData.user.email !== adminEmail) {
      return { error: 'Yetkilendirme hatası: E-posta adresi eşleşmiyor' };
    }

    // Check for existing topics to avoid duplicates
    const { data: existingTopics } = await supabase
      .from('topics')
      .select('title')
      .limit(1);

    if (existingTopics && existingTopics.length > 0) {
      return { 
        message: 'Veritabanında zaten konular bulunuyor',
        status: 'info',
        count: existingTopics.length
      };
    }

    // Get or create a general category
    let categoryId: string | undefined;
    
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Genel')
      .single();
    
    if (categoryError) {
      // Create general category
      const { data: newCategory, error: newCategoryError } = await supabase
        .from('categories')
        .insert({
          name: 'Genel',
          slug: 'genel',
          description: 'Genel konular',
          topic_count: 0
        })
        .select()
        .single();
      
      if (newCategoryError) {
        console.error('Kategori oluşturma hatası:', newCategoryError);
      } else {
        categoryId = newCategory.id;
      }
    } else {
      categoryId = category.id;
    }

    // Insert sample topics
    const results = [];
    
    for (const topic of sampleTopics) {
      const slug = topic.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const { data, error } = await supabase
        .from('topics')
        .insert({
          title: topic.title,
          content: topic.content,
          slug,
          tags: topic.tags,
          category_id: categoryId,
          author_id: userData.user.id,
          created_at: new Date().toISOString(),
          comment_count: 0,
          view_count: Math.floor(Math.random() * 100),
          like_count: Math.floor(Math.random() * 20)
        })
        .select();
      
      if (error) {
        console.error('Konu ekleme hatası:', error);
        results.push({ title: topic.title, success: false, error: error.message });
      } else {
        results.push({ title: topic.title, success: true, id: data[0].id });
        
        // Increment category topic count
        if (categoryId) {
          await supabase.rpc('increment_topic_count', { category_id: categoryId });
        }
      }
    }

    return { 
      success: true, 
      message: 'Örnek konular başarıyla eklendi', 
      results,
      count: results.filter(r => r.success).length
    };
  } catch (error) {
    console.error('Örnek veri eklenirken hata oluştu:', error);
    return { error: 'Beklenmeyen bir hata oluştu' };
  }
} 