-- Add likes table to support recipe likes/favorites
-- Run this SQL in your Supabase SQL Editor

-- Create likes table
CREATE TABLE public.recipe_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Create indexes for better performance
CREATE INDEX idx_recipe_likes_user_id ON public.recipe_likes(user_id);
CREATE INDEX idx_recipe_likes_recipe_id ON public.recipe_likes(recipe_id);
CREATE INDEX idx_recipe_likes_created_at ON public.recipe_likes(created_at DESC);

-- Create function to get recipe like count
CREATE OR REPLACE FUNCTION get_recipe_like_count(recipe_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.recipe_likes
    WHERE recipe_id = recipe_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create view for recipes with like counts
CREATE OR REPLACE VIEW public.recipes_with_likes AS
SELECT
  r.*,
  COALESCE(like_counts.like_count, 0) as like_count
FROM public.recipes r
LEFT JOIN (
  SELECT
    recipe_id,
    COUNT(*) as like_count
  FROM public.recipe_likes
  GROUP BY recipe_id
) like_counts ON r.id = like_counts.recipe_id;

-- Enable Row Level Security
ALTER TABLE public.recipe_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_likes
CREATE POLICY "Users can view all recipe likes" ON public.recipe_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" ON public.recipe_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON public.recipe_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.recipe_likes TO authenticated;
GRANT ALL ON public.recipes_with_likes TO authenticated;