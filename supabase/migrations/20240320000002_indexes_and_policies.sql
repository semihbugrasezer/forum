-- Add indexes
create index topics_user_id_idx on public.topics(user_id);
create index topics_category_idx on public.topics(category);
create index topics_created_at_idx on public.topics(created_at desc);
create index topics_last_activity_at_idx on public.topics(last_activity_at desc);
create index comments_topic_id_idx on public.comments(topic_id);
create index comments_user_id_idx on public.comments(user_id);
create index likes_topic_id_idx on public.likes(topic_id);
create index likes_user_id_idx on public.likes(user_id);
create index comment_likes_comment_id_idx on public.comment_likes(comment_id);
create index comment_likes_user_id_idx on public.comment_likes(user_id);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.categories enable row level security;
alter table public.comment_likes enable row level security;

-- ... rest of your existing RLS policies and functions ...
