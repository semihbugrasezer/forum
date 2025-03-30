# Supabase Setup Guide for THY Forum

This guide explains how to set up the Supabase database for the THY Forum application.

## Database Setup

### Option 1: Using the SQL Editor in Supabase Dashboard

1. Log in to your Supabase dashboard
2. Select your project
3. Go to the SQL Editor
4. Copy the contents of `init.sql` from this directory
5. Paste it into a new SQL query
6. Run the query

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db reset
```

This will apply all migrations and seed data.

## What Gets Created

The SQL script creates the following:

1. **Tables**:

   - `profiles`: User profiles linked to auth.users
   - `categories`: Forum categories
   - `topics`: Forum topics/posts
   - `comments`: Responses to topics
   - `likes`: User likes on topics

2. **Sample Data**:

   - Basic categories
   - A few sample topics

3. **Functions**:

   - `increment_comment_count`: Updates comment count for a topic
   - `increment_view_count`: Updates view count for a topic
   - `update_modified_column`: Updates timestamps on record changes

4. **Security Policies**:
   - Row Level Security (RLS) for all tables
   - Public read access
   - Authenticated user insert/update policies

## Auth Setup

Make sure to set up Auth in your Supabase project:

1. Go to Authentication > Settings
2. Enable the Email provider (or other providers as needed)
3. Configure your site URL and redirect URLs

## Environment Variables

Update your `.env.local` file with your Supabase URL and anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

- If you encounter foreign key constraint errors, make sure you run the script in the correct order
- For permission issues, check that RLS policies are correctly set up
- Verify that the auth.users reference in the profiles table works properly
