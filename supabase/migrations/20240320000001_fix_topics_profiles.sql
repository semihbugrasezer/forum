-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Topics are viewable by everyone" ON topics;
DROP POLICY IF EXISTS "Authenticated users can create topics" ON topics;
DROP POLICY IF EXISTS "Users can update their own topics" ON topics;
DROP POLICY IF EXISTS "Users can delete their own topics" ON topics;
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON votes;
DROP POLICY IF EXISTS "Authenticated users can vote" ON votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Topics are viewable by everyone" ON topics
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create topics" ON topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" ON topics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" ON topics
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Votes are viewable by everyone" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE USING (auth.uid() = user_id);

-- Insert sample data if tables are empty
DO $$
DECLARE
    dummy_user_1 UUID := '00000000-0000-0000-0000-000000000001';
    dummy_user_2 UUID := '00000000-0000-0000-0000-000000000002';
    dummy_user_3 UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
    -- Insert dummy users if they don't exist
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES 
        (dummy_user_1, 'dummy1@example.com', jsonb_build_object('name', 'Dummy User 1')),
        (dummy_user_2, 'dummy2@example.com', jsonb_build_object('name', 'Dummy User 2')),
        (dummy_user_3, 'dummy3@example.com', jsonb_build_object('name', 'Dummy User 3'))
    ON CONFLICT (id) DO NOTHING;

    -- Insert categories if none exist
    IF NOT EXISTS (SELECT 1 FROM categories LIMIT 1) THEN
        INSERT INTO categories (id, name, slug) VALUES
            ('c1', 'Genel Konular', 'genel-konular'),
            ('c2', 'Uçuşlar', 'ucuslar'),
            ('c3', 'Miles&Smiles', 'miles-smiles'),
            ('c4', 'Destinasyonlar', 'destinasyonlar');
    END IF;

    -- Insert topics if none exist
    IF NOT EXISTS (SELECT 1 FROM topics LIMIT 1) THEN
        INSERT INTO topics (title, content, slug, created_at, user_id, category_id, votes, comment_count) VALUES
            ('İstanbul - New York uçuş deneyimim', 'İçerik 1', 'istanbul-new-york-ucus-deneyimim', NOW() - INTERVAL '2 days', dummy_user_1, 'c2', 15, 8),
            ('Miles&Smiles ile Business Class upgrade deneyimi', 'İçerik 2', 'miles-smiles-business-class-upgrade', NOW() - INTERVAL '5 days', dummy_user_2, 'c3', 23, 12),
            ('Bangkok''ta Gezilecek Yerler', 'İçerik 3', 'bangkok-gezilecek-yerler', NOW() - INTERVAL '1 day', dummy_user_3, 'c4', 8, 15);
    END IF;

    -- Insert votes if none exist
    IF NOT EXISTS (SELECT 1 FROM votes LIMIT 1) THEN
        WITH inserted_topics AS (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
            FROM topics
            LIMIT 2
        )
        INSERT INTO votes (user_id, topic_id, vote_type, created_at)
        SELECT 
            dummy_user_1,
            id,
            'up',
            NOW() - INTERVAL '1 day'
        FROM inserted_topics
        WHERE rn = 1
        UNION ALL
        SELECT 
            dummy_user_2,
            id,
            'up',
            NOW() - INTERVAL '2 days'
        FROM inserted_topics
        WHERE rn = 2;
    END IF;
END $$;

-- Create foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'topics_user_id_fkey'
    ) THEN
        ALTER TABLE topics
        ADD CONSTRAINT topics_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'topics_category_id_fkey'
    ) THEN
        ALTER TABLE topics
        ADD CONSTRAINT topics_category_id_fkey FOREIGN KEY (category_id)
        REFERENCES categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topics_user_id ON topics(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_category_id ON topics(category_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_topic_id ON votes(topic_id);
