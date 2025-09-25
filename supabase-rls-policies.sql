-- Row Level Security (RLS) Policies for RecipeVibe
-- Run this SQL in your Supabase SQL Editor AFTER running the schema

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all public profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Recipes table policies
CREATE POLICY "Anyone can view public recipes" ON public.recipes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own recipes" ON public.recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- Ratings table policies
CREATE POLICY "Anyone can view ratings" ON public.ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON public.ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Comments table policies
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Collections table policies
CREATE POLICY "Users can view public collections" ON public.collections
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own collections" ON public.collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create collections" ON public.collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON public.collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON public.collections
  FOR DELETE USING (auth.uid() = user_id);

-- Collection recipes table policies
CREATE POLICY "Users can view collection recipes for public collections" ON public.collection_recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections 
      WHERE id = collection_id AND is_public = true
    )
  );

CREATE POLICY "Users can view their own collection recipes" ON public.collection_recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections 
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add recipes to their own collections" ON public.collection_recipes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections 
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove recipes from their own collections" ON public.collection_recipes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.collections 
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

-- Follows table policies
CREATE POLICY "Users can view all follows" ON public.follows
  FOR SELECT USING (true);

CREATE POLICY "Users can create follows" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Create a view for recipe statistics
CREATE VIEW public.recipe_stats AS
SELECT 
  r.id,
  r.title,
  r.user_id,
  r.created_at,
  COALESCE(AVG(rt.rating), 0) as average_rating,
  COUNT(rt.id) as rating_count,
  COUNT(c.id) as comment_count
FROM public.recipes r
LEFT JOIN public.ratings rt ON r.id = rt.recipe_id
LEFT JOIN public.comments c ON r.id = c.recipe_id
WHERE r.is_public = true
GROUP BY r.id, r.title, r.user_id, r.created_at;

-- Enable RLS on the view
ALTER VIEW public.recipe_stats SET (security_invoker = true);

-- Create a view for user statistics
CREATE VIEW public.user_stats AS
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.avatar_url,
  COUNT(DISTINCT r.id) as recipe_count,
  COUNT(DISTINCT f.follower_id) as follower_count,
  COUNT(DISTINCT f2.following_id) as following_count
FROM public.users u
LEFT JOIN public.recipes r ON u.id = r.user_id AND r.is_public = true
LEFT JOIN public.follows f ON u.id = f.following_id
LEFT JOIN public.follows f2 ON u.id = f2.follower_id
GROUP BY u.id, u.username, u.full_name, u.avatar_url;

-- Enable RLS on the view
ALTER VIEW public.user_stats SET (security_invoker = true);
