-- Update Prawns Masala Fry Recipe Image
-- Run this SQL in your Supabase SQL Editor

-- Update the image for the Prawns Masala Fry recipe
-- Using a high-quality prawns curry image from Unsplash
UPDATE public.recipes 
SET image_urls = ARRAY['https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
WHERE title = 'Prawns Masala Fry';

-- Alternative image option (uncomment to use instead):
-- UPDATE public.recipes 
-- SET image_urls = ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80']
-- WHERE title = 'Prawns Masala Fry';

-- Verify the update
SELECT id, title, image_urls 
FROM public.recipes 
WHERE title = 'Prawns Masala Fry';
