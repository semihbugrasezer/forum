-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS topics_user_id_idx ON public.topics(user_id);
CREATE INDEX IF NOT EXISTS topics_category_id_idx ON public.topics(category_id);
CREATE INDEX IF NOT EXISTS topics_created_at_idx ON public.topics(created_at DESC);
CREATE INDEX IF NOT EXISTS topics_last_activity_at_idx ON public.topics(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS comments_topic_id_idx ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS likes_topic_id_idx ON public.likes(topic_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS comment_likes_user_id_idx ON public.comment_likes(user_id);

-- Add RLS policies
CREATE POLICY "Public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);

-- User management policies
CREATE POLICY "Users manage own profile" ON public.profiles 
    FOR ALL USING (auth.uid() = id);

-- Topic management policies
CREATE POLICY "Users manage own topics" ON public.topics 
    FOR ALL USING (auth.uid() = user_id);

-- Comment management policies
CREATE POLICY "Users manage own comments" ON public.comments 
    FOR ALL USING (auth.uid() = user_id);
