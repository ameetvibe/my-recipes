-- Sample Data for RecipeVibe
-- Run this SQL in your Supabase SQL Editor AFTER running the schema and RLS policies
-- Note: This will only work after you have created some users through authentication

-- Sample recipes (you'll need to replace the user_id with actual user IDs from your auth.users table)
-- First, let's create some sample users (these will be created automatically when users sign up)

-- Sample recipes data
INSERT INTO public.recipes (
  user_id,
  title,
  description,
  ingredients,
  instructions,
  prep_time_minutes,
  cook_time_minutes,
  servings,
  difficulty,
  cuisine_type,
  dietary_tags,
  image_urls,
  is_public
) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
  'Classic Margherita Pizza',
  'Authentic Italian pizza with fresh basil, mozzarella, and San Marzano tomatoes',
  '[
    {"name": "Pizza dough", "amount": "1", "unit": "ball"},
    {"name": "San Marzano tomatoes", "amount": "400", "unit": "g"},
    {"name": "Fresh mozzarella", "amount": "200", "unit": "g"},
    {"name": "Fresh basil leaves", "amount": "20", "unit": "leaves"},
    {"name": "Extra virgin olive oil", "amount": "2", "unit": "tbsp"},
    {"name": "Salt", "amount": "1", "unit": "tsp"}
  ]',
  '[
    {"step": 1, "instruction": "Preheat oven to 500°F (260°C)"},
    {"step": 2, "instruction": "Roll out pizza dough on a floured surface"},
    {"step": 3, "instruction": "Crush tomatoes and spread over dough"},
    {"step": 4, "instruction": "Tear mozzarella and distribute evenly"},
    {"step": 5, "instruction": "Drizzle with olive oil and sprinkle salt"},
    {"step": 6, "instruction": "Bake for 10-12 minutes until crust is golden"},
    {"step": 7, "instruction": "Remove from oven and top with fresh basil"}
  ]',
  30,
  15,
  4,
  'medium',
  'Italian',
  ARRAY['Vegetarian'],
  ARRAY['https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'],
  true
),
(
  (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
  'Chocolate Chip Cookies',
  'Soft and chewy cookies with the perfect balance of sweetness and chocolate',
  '[
    {"name": "All-purpose flour", "amount": "2.25", "unit": "cups"},
    {"name": "Baking soda", "amount": "1", "unit": "tsp"},
    {"name": "Salt", "amount": "1", "unit": "tsp"},
    {"name": "Butter", "amount": "1", "unit": "cup"},
    {"name": "Brown sugar", "amount": "0.75", "unit": "cup"},
    {"name": "White sugar", "amount": "0.5", "unit": "cup"},
    {"name": "Vanilla extract", "amount": "2", "unit": "tsp"},
    {"name": "Eggs", "amount": "2", "unit": "large"},
    {"name": "Chocolate chips", "amount": "2", "unit": "cups"}
  ]',
  '[
    {"step": 1, "instruction": "Preheat oven to 375°F (190°C)"},
    {"step": 2, "instruction": "Mix flour, baking soda, and salt in a bowl"},
    {"step": 3, "instruction": "Cream butter and sugars until fluffy"},
    {"step": 4, "instruction": "Beat in vanilla and eggs"},
    {"step": 5, "instruction": "Gradually mix in flour mixture"},
    {"step": 6, "instruction": "Stir in chocolate chips"},
    {"step": 7, "instruction": "Drop rounded tablespoons onto ungreased baking sheets"},
    {"step": 8, "instruction": "Bake 9-11 minutes until golden brown"}
  ]',
  15,
  12,
  24,
  'easy',
  'American',
  ARRAY['Vegetarian', 'Dairy'],
  ARRAY['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'],
  true
),
(
  (SELECT id FROM auth.users LIMIT 1), -- Replace with actual user ID
  'Thai Green Curry',
  'Aromatic and spicy curry with coconut milk, fresh vegetables, and fragrant herbs',
  '[
    {"name": "Coconut milk", "amount": "400", "unit": "ml"},
    {"name": "Green curry paste", "amount": "3", "unit": "tbsp"},
    {"name": "Chicken breast", "amount": "500", "unit": "g"},
    {"name": "Eggplant", "amount": "1", "unit": "medium"},
    {"name": "Bell peppers", "amount": "2", "unit": "pieces"},
    {"name": "Thai basil", "amount": "1", "unit": "cup"},
    {"name": "Fish sauce", "amount": "2", "unit": "tbsp"},
    {"name": "Palm sugar", "amount": "1", "unit": "tbsp"},
    {"name": "Lime leaves", "amount": "4", "unit": "leaves"}
  ]',
  '[
    {"step": 1, "instruction": "Heat half the coconut milk in a large pot"},
    {"step": 2, "instruction": "Add curry paste and cook until fragrant"},
    {"step": 3, "instruction": "Add chicken and cook until sealed"},
    {"step": 4, "instruction": "Add remaining coconut milk and bring to boil"},
    {"step": 5, "instruction": "Add vegetables and simmer for 10 minutes"},
    {"step": 6, "instruction": "Season with fish sauce and palm sugar"},
    {"step": 7, "instruction": "Garnish with Thai basil and lime leaves"}
  ]',
  20,
  25,
  4,
  'medium',
  'Thai',
  ARRAY['Vegan', 'Gluten-Free'],
  ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'],
  true
);

-- Sample ratings (you'll need actual user IDs)
INSERT INTO public.ratings (user_id, recipe_id, rating) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.recipes WHERE title = 'Classic Margherita Pizza' LIMIT 1),
  5
),
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.recipes WHERE title = 'Chocolate Chip Cookies' LIMIT 1),
  4
),
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.recipes WHERE title = 'Thai Green Curry' LIMIT 1),
  5
);

-- Sample comments
INSERT INTO public.comments (user_id, recipe_id, content) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.recipes WHERE title = 'Classic Margherita Pizza' LIMIT 1),
  'This recipe is amazing! The crust came out perfectly crispy.'
),
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.recipes WHERE title = 'Chocolate Chip Cookies' LIMIT 1),
  'My kids loved these cookies! Will definitely make again.'
),
(
  (SELECT id FROM auth.users LIMIT 1),
  (SELECT id FROM public.recipes WHERE title = 'Thai Green Curry' LIMIT 1),
  'Perfect spice level and the vegetables were cooked just right.'
);

-- Sample collections
INSERT INTO public.collections (user_id, name, description, is_public) VALUES
(
  (SELECT id FROM auth.users LIMIT 1),
  'My Favorites',
  'My go-to recipes for special occasions',
  true
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'Quick Weeknight Meals',
  'Fast and easy recipes for busy weeknights',
  true
);

-- Add recipes to collections
INSERT INTO public.collection_recipes (collection_id, recipe_id) VALUES
(
  (SELECT id FROM public.collections WHERE name = 'My Favorites' LIMIT 1),
  (SELECT id FROM public.recipes WHERE title = 'Classic Margherita Pizza' LIMIT 1)
),
(
  (SELECT id FROM public.collections WHERE name = 'Quick Weeknight Meals' LIMIT 1),
  (SELECT id FROM public.recipes WHERE title = 'Thai Green Curry' LIMIT 1)
);
