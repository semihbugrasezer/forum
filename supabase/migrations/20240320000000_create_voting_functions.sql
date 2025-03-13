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

-- Create RLS policies for votes table
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 