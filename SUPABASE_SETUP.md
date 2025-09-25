# RecipeVibe Supabase Setup Guide

## 🚀 Quick Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy your:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **Service Role Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Create Environment Variables

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following files in order:

   **Step 1:** Run `supabase-schema.sql`
   - This creates all tables, indexes, triggers, and functions

   **Step 2:** Run `supabase-rls-policies.sql`
   - This sets up Row Level Security policies

   **Step 3:** Run `supabase-sample-data.sql` (optional)
   - This adds sample recipes and data for testing

### 4. Verify Setup

After running the SQL files, you should see these tables in your **Table Editor**:

- ✅ `users` - User profiles
- ✅ `recipes` - Recipe data
- ✅ `ratings` - Recipe ratings
- ✅ `comments` - Recipe comments
- ✅ `collections` - User recipe collections
- ✅ `collection_recipes` - Junction table
- ✅ `follows` - User following relationships

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User profiles | Extends Supabase auth, cooking level |
| `recipes` | Recipe data | JSONB ingredients/instructions, dietary tags |
| `ratings` | Recipe ratings | 1-5 star ratings, unique per user/recipe |
| `comments` | Recipe comments | Threaded comments support |
| `collections` | Recipe collections | Public/private collections |
| `follows` | User relationships | Follow/follower system |

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensure users can only access appropriate data
- **Automatic user creation** when users sign up
- **Data validation** with constraints and triggers

### Performance Optimizations

- **Indexes** on frequently queried columns
- **Views** for complex queries (recipe stats, user stats)
- **Triggers** for automatic timestamp updates

## 🔧 Next Steps

1. **Test Authentication**: Create a test user account
2. **Verify Data**: Check that sample data was inserted correctly
3. **Update Types**: Generate TypeScript types from your schema
4. **Connect Frontend**: Use the Supabase client in your Next.js app

## 🛠️ Useful Queries

### Get Recipe with Stats
```sql
SELECT r.*, rs.average_rating, rs.rating_count, rs.comment_count
FROM public.recipes r
LEFT JOIN public.recipe_stats rs ON r.id = rs.id
WHERE r.is_public = true
ORDER BY r.created_at DESC;
```

### Get User Profile with Stats
```sql
SELECT u.*, us.recipe_count, us.follower_count, us.following_count
FROM public.users u
LEFT JOIN public.user_stats us ON u.id = us.id
WHERE u.id = 'user-id-here';
```

### Get Recipe Comments with User Info
```sql
SELECT c.*, u.username, u.avatar_url
FROM public.comments c
JOIN public.users u ON c.user_id = u.id
WHERE c.recipe_id = 'recipe-id-here'
ORDER BY c.created_at ASC;
```

## 🚨 Important Notes

- **Replace user IDs** in sample data with actual user IDs from your auth.users table
- **Test RLS policies** by trying to access data with different user accounts
- **Monitor performance** as your data grows
- **Backup regularly** using Supabase's built-in backup features

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Supabase Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
