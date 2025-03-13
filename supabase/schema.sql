-- Forum için gerekli tabloları oluşturma

-- Kullanıcılar tablosu (Supabase Auth ile entegre)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Konular tablosu
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Yorumlar tablosu
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Beğeniler tablosu (konular için)
CREATE TABLE IF NOT EXISTS public.topic_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, topic_id)
);

-- Beğeniler tablosu (yorumlar için)
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, comment_id)
);

-- Etiketler tablosu
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Konu-Etiket ilişki tablosu
CREATE TABLE IF NOT EXISTS public.topic_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(topic_id, tag_id)
);

-- Bildirimler tablosu
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Görünümler için fonksiyonlar ve tetikleyiciler

-- Yeni kullanıcı oluşturulduğunda profil oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Konu görüntüleme sayısını artırmak için fonksiyon
CREATE OR REPLACE FUNCTION public.increment_topic_view_count(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.topics
  SET view_count = view_count + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Politikaları

-- Profiller için güvenlik politikaları
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profilleri herkes görebilir"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini düzenleyebilir"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Konular için güvenlik politikaları
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Konuları herkes görebilir"
  ON public.topics FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar kendi konularını oluşturabilir"
  ON public.topics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi konularını düzenleyebilir"
  ON public.topics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi konularını silebilir"
  ON public.topics FOR DELETE
  USING (auth.uid() = user_id);

-- Yorumlar için güvenlik politikaları
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Yorumları herkes görebilir"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar yorum yapabilir"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi yorumlarını düzenleyebilir"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi yorumlarını silebilir"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Beğeniler için güvenlik politikaları
ALTER TABLE public.topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beğenileri herkes görebilir"
  ON public.topic_likes FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar beğeni yapabilir"
  ON public.topic_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi beğenilerini kaldırabilir"
  ON public.topic_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Yorum beğenilerini herkes görebilir"
  ON public.comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar yorum beğenisi yapabilir"
  ON public.comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi yorum beğenilerini kaldırabilir"
  ON public.comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Bildirimler için güvenlik politikaları
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi bildirimlerini güncelleyebilir"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Görünümler (Views)

-- Konu detayları görünümü
CREATE OR REPLACE VIEW public.topic_details AS
SELECT 
  t.id,
  t.title,
  t.content,
  t.user_id,
  t.category_id,
  t.is_pinned,
  t.is_locked,
  t.view_count,
  t.created_at,
  t.updated_at,
  p.name as user_name,
  p.avatar_url as user_avatar,
  c.name as category_name,
  c.slug as category_slug,
  (SELECT COUNT(*) FROM public.comments WHERE topic_id = t.id) as comment_count,
  (SELECT COUNT(*) FROM public.topic_likes WHERE topic_id = t.id) as like_count
FROM 
  public.topics t
  JOIN public.profiles p ON t.user_id = p.id
  LEFT JOIN public.categories c ON t.category_id = c.id;

-- Yorum detayları görünümü
CREATE OR REPLACE VIEW public.comment_details AS
SELECT 
  c.id,
  c.content,
  c.user_id,
  c.topic_id,
  c.parent_id,
  c.created_at,
  c.updated_at,
  p.name as user_name,
  p.avatar_url as user_avatar,
  t.title as topic_title,
  (SELECT COUNT(*) FROM public.comment_likes WHERE comment_id = c.id) as like_count
FROM 
  public.comments c
  JOIN public.profiles p ON c.user_id = p.id
  JOIN public.topics t ON c.topic_id = t.id; 