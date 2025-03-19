-- Create comment_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- Add likes column to comments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'comments' AND column_name = 'likes'
  ) THEN
    ALTER TABLE comments ADD COLUMN likes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to increment topic votes
CREATE OR REPLACE FUNCTION increment_topic_votes(topic_id UUID, amount INT DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE topics
  SET votes = votes + amount
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrement topic votes
CREATE OR REPLACE FUNCTION decrement_topic_votes(topic_id UUID, amount INT DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE topics
  SET votes = votes - amount
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment comment count
CREATE OR REPLACE FUNCTION increment_comment_count(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE topics
  SET comment_count = comment_count + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrement comment count
CREATE OR REPLACE FUNCTION decrement_comment_count(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE topics
  SET comment_count = GREATEST(0, comment_count - 1)
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment comment likes
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comments
  SET likes = likes + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrement comment likes
CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE comments
  SET likes = GREATEST(0, likes - 1)
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for comment_likes table
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comment likes are viewable by everyone" 
  ON comment_likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own comment likes" 
  ON comment_likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" 
  ON comment_likes FOR DELETE 
  USING (auth.uid() = user_id); 