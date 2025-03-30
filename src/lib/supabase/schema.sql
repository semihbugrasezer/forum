-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  topics_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create topics table
create table public.topics (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  likes_count integer default 0 not null,
  comments_count integer default 0 not null,
  views integer default 0 not null,
  is_pinned boolean default false not null,
  is_locked boolean default false not null,
  last_activity_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  user_id uuid references auth.users on delete cascade not null,
  topic_id uuid references public.topics on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_solution boolean default false not null
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- Create likes table
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  topic_id uuid references public.topics on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, topic_id)
);

-- Add indexes
create index topics_user_id_idx on public.topics(user_id);
create index topics_category_idx on public.topics(category);
create index topics_created_at_idx on public.topics(created_at desc);
create index topics_last_activity_at_idx on public.topics(last_activity_at desc);
create index comments_topic_id_idx on public.comments(topic_id);
create index comments_user_id_idx on public.comments(user_id);
create index likes_topic_id_idx on public.likes(topic_id);
create index likes_user_id_idx on public.likes(user_id);
CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS comment_likes_user_id_idx ON public.comment_likes(user_id);

-- Enable RLS policies
alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.categories enable row level security;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- RLS policies for topics
create policy "Topics are viewable by everyone"
  on public.topics for select
  using ( true );

create policy "Authenticated users can create topics"
  on public.topics for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own topics"
  on public.topics for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own topics"
  on public.topics for delete
  using ( auth.uid() = user_id );

-- RLS policies for comments
create policy "Comments are viewable by everyone"
  on public.comments for select
  using ( true );

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own comments"
  on public.comments for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own comments"
  on public.comments for delete
  using ( auth.uid() = user_id );

-- RLS policies for likes
create policy "Likes are viewable by everyone"
  on public.likes for select
  using ( true );

create policy "Authenticated users can create likes"
  on public.likes for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can delete their own likes"
  on public.likes for delete
  using ( auth.uid() = user_id );

-- RLS policies for categories
create policy "Categories are viewable by everyone"
  on public.categories for select
  using ( true );

create policy "Only admins can manage categories"
  on public.categories for all
  using ( auth.jwt()->>'role' = 'admin' );

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update topics counts
create or replace function public.update_topic_counts()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.categories
    set topics_count = topics_count + 1
    where name = NEW.category;
  elsif (TG_OP = 'DELETE') then
    update public.categories
    set topics_count = topics_count - 1
    where name = OLD.category;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for topic counts
create trigger update_category_topic_count
  after insert or delete on public.topics
  for each row execute procedure public.update_topic_counts();