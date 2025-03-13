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

-- Recreate policies
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
BEGIN
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
        INSERT INTO topics (id, title, content, slug, created_at, user_id, category_id, votes, comment_count) VALUES
            (
                't1',
                'İstanbul - New York uçuş deneyimim',
                'Merhaba arkadaşlar, geçen hafta İstanbul''dan New York''a uçtum. Business Class deneyimimi paylaşmak istiyorum. Check-in süreci çok hızlıydı, lounge''da yaklaşık 2 saat kaldım. Uçakta yemekler harikaydı, özellikle ana yemek olarak seçtiğim biftek mükemmeldi. Yatak konforu da beklediğimden çok daha iyiydi. Genel olarak çok memnun kaldım.',
                'istanbul-new-york-ucus-deneyimim',
                NOW() - INTERVAL '2 days',
                'dummy-user-1',
                'c2',
                15,
                8
            ),
            (
                't2',
                'Miles&Smiles ile Business Class upgrade deneyimi',
                'Miles&Smiles üyeliğim sayesinde geçen ay İstanbul - Londra uçuşumda Business Class''a upgrade oldum. 25.000 mile karşılığında upgrade işlemi yaptım. Check-in sırasında upgrade onaylandı ve lounge''a davet edildim. Uçuş boyunca tüm Business Class ayrıcalıklarından faydalandım.',
                'miles-smiles-business-class-upgrade',
                NOW() - INTERVAL '5 days',
                'dummy-user-2',
                'c3',
                23,
                12
            ),
            (
                't3',
                'Bangkok''ta Gezilecek Yerler',
                'Bangkok''a ilk kez gideceğim. 5 günlük bir seyahat planlıyorum. Özellikle tapınaklar, floating market ve street food deneyimleri için önerilerinizi bekliyorum. Ayrıca hangi bölgede konaklamamı önerirsiniz?',
                'bangkok-gezilecek-yerler',
                NOW() - INTERVAL '1 day',
                'dummy-user-3',
                'c4',
                8,
                15
            ),
            (
                't4',
                'THY Lounge İstanbul Havalimanı Deneyimi',
                'İstanbul Havalimanı''ndaki THY Lounge''u ilk kez deneyimledim. Yemek çeşitleri oldukça fazlaydı, özellikle Türk mutfağından örnekler vardı. Spa hizmeti de aldım, çok rahatladım. Lounge''da yaklaşık 3 saat kaldım ve kesinlikle tekrar geleceğim.',
                'thy-lounge-istanbul-havalimani',
                NOW() - INTERVAL '3 days',
                'dummy-user-1',
                'c1',
                19,
                6
            ),
            (
                't5',
                'Miles&Smiles Puan Kazanma Stratejileri',
                'Miles&Smiles puanlarını en verimli şekilde nasıl kazanabiliriz? Kredi kartı kullanımı, uçuş seçimleri ve promosyonlardan faydalanma konusunda deneyimlerinizi paylaşır mısınız?',
                'miles-smiles-puan-kazanma',
                NOW() - INTERVAL '7 days',
                'dummy-user-2',
                'c3',
                45,
                25
            );
    END IF;

    -- Insert dummy users if they don't exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = 'dummy-user-1') THEN
        INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
            ('dummy-user-1', 'user1@example.com', '{"username": "AhmetY", "avatar_url": "https://i.pravatar.cc/150?u=1"}'),
            ('dummy-user-2', 'user2@example.com', '{"username": "AyseK", "avatar_url": "https://i.pravatar.cc/150?u=2"}'),
            ('dummy-user-3', 'user3@example.com', '{"username": "MehmetS", "avatar_url": "https://i.pravatar.cc/150?u=3"}');
    END IF;

    -- Insert votes if none exist
    IF NOT EXISTS (SELECT 1 FROM votes LIMIT 1) THEN
        INSERT INTO votes (id, user_id, topic_id, vote_type, created_at) VALUES
            ('v1', 'dummy-user-1', 't1', 'up', NOW() - INTERVAL '1 day'),
            ('v2', 'dummy-user-2', 't1', 'up', NOW() - INTERVAL '2 days'),
            ('v3', 'dummy-user-3', 't2', 'up', NOW() - INTERVAL '3 days'),
            ('v4', 'dummy-user-1', 't3', 'up', NOW() - INTERVAL '4 days'),
            ('v5', 'dummy-user-2', 't4', 'up', NOW() - INTERVAL '5 days'),
            ('v6', 'dummy-user-3', 't5', 'up', NOW() - INTERVAL '6 days');
    END IF;
END $$; 