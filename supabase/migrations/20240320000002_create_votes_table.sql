-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON votes;
DROP POLICY IF EXISTS "Authenticated users can create votes" ON votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;

-- Drop table if exists
DROP TABLE IF EXISTS votes;

-- Create votes table
create table if not exists votes (
    id uuid primary key default uuid_generate_v4(),
    profile_id uuid references profiles(id) on delete cascade not null,
    topic_id uuid references topics(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(profile_id, topic_id)
);

-- Enable RLS
alter table votes enable row level security;

-- Create policies
create policy "Votes are viewable by everyone"
on votes for select
to authenticated
using (true);

create policy "Authenticated users can create votes"
on votes for insert
to authenticated
with check (auth.uid() = profile_id);

create policy "Users can update their own votes"
on votes for update
to authenticated
using (auth.uid() = profile_id)
with check (auth.uid() = profile_id);

create policy "Users can delete their own votes"
on votes for delete
to authenticated
using (auth.uid() = profile_id);
