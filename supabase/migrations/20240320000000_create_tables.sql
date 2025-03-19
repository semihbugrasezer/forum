-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    votes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, topic_id)
);

-- Create function to handle upvotes
CREATE OR REPLACE FUNCTION upvote_topic(topic_id UUID, user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO votes (topic_id, user_id, vote_type)
  VALUES (topic_id, user_id, 'up')
  ON CONFLICT (topic_id, user_id) 
  DO UPDATE SET 
    vote_type = 'up',
    created_at = TIMEZONE('utc'::text, NOW());

  -- Update topic votes count
  UPDATE topics
  SET votes = (
    SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - 
           COUNT(*) FILTER (WHERE vote_type = 'down')
    FROM votes
    WHERE topic_id = $1
  )
  WHERE id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle downvotes
CREATE OR REPLACE FUNCTION downvote_topic(topic_id UUID, user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO votes (topic_id, user_id, vote_type)
  VALUES (topic_id, user_id, 'down')
  ON CONFLICT (topic_id, user_id) 
  DO UPDATE SET 
    vote_type = 'down',
    created_at = TIMEZONE('utc'::text, NOW());

  -- Update topic votes count
  UPDATE topics
  SET votes = (
    SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - 
           COUNT(*) FILTER (WHERE vote_type = 'down')
    FROM votes
    WHERE topic_id = $1
  )
  WHERE id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

-- Create policies for topics
CREATE POLICY "Topics are viewable by everyone" ON topics
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own topics" ON topics
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topics" ON topics
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for votes
CREATE POLICY "Votes are viewable by everyone" ON votes
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON votes
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id);
