-- Create necessary tables and functions for THY Forum

-- Profiles table for user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories table for topic organization
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  topics_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Topics table for forum posts
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  category TEXT REFERENCES public.categories(slug),
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comments table for responses to topics
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  is_solution BOOLEAN DEFAULT false
);

-- Likes table for topic likes
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert sample data into categories
INSERT INTO public.categories(name, slug, description)
VALUES 
  ('Genel', 'genel', 'Genel konular ve sorular'),
  ('Miles&Smiles', 'miles-smiles', 'Miles&Smiles programı hakkında bilgiler ve sorular'),
  ('Uçuş Deneyimi', 'ucus-deneyimi', 'Uçuş ile ilgili deneyim ve görüşler'),
  ('Bilet İşlemleri', 'bilet-islemleri', 'Bilet rezervasyonu, değişikliği ve iptali'),
  ('Bagaj', 'bagaj', 'Bagaj kuralları, sınırlamaları ve öneriler')
ON CONFLICT (slug) DO NOTHING;

-- Sample topic data (will be shown if no data exists in the database)
INSERT INTO public.topics(title, content, slug, category, tags, views, comments_count)
VALUES 
  ('Miles&Smiles puan sorgulama', 'Miles&Smiles programında biriken puanlarımı nasıl sorgulayabilirim?', 'miles-smiles-puan-sorgulama', 'miles-smiles', ARRAY['miles&smiles', 'puan', 'sorgulama'], 15, 2),
  ('İstanbul - New York uçuşu için en iyi koltuk önerileri', 'THY''nin İstanbul-New York rotasında A330-300 uçağında en rahat koltuklar hangileri?', 'istanbul-new-york-koltuk-onerileri', 'ucus-deneyimi', ARRAY['koltuk', 'new york', 'uzun uçuş'], 32, 5),
  ('Business Class deneyimi', 'Geçen hafta THY ile Business Class deneyimim oldu ve çok etkilendim.', 'business-class-deneyimi', 'ucus-deneyimi', ARRAY['business class', 'kabin'], 78, 10)
ON CONFLICT (slug) DO NOTHING;

-- Create function to increment comment count
CREATE OR REPLACE FUNCTION public.increment_comment_count(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.topics
  SET comments_count = comments_count + 1,
      last_activity_at = NOW()
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.topics
  SET views = views + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public reading
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.categories FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to insert" ON public.topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to update their own topics" ON public.topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to insert likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable anonymous inserts for comments (with author_name)
CREATE POLICY "Allow anonymous comments" ON public.comments FOR INSERT WITH CHECK (author_name IS NOT NULL);

-- Create or replace trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.topics
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 