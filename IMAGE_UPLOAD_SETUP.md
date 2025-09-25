# 📸 Image Upload Setup Guide

## Step 1: Set up Supabase Storage

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run the storage setup SQL** (from `supabase-storage-setup.sql`):

```sql
-- Create a storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true);

-- Set up RLS policies for the recipe-images bucket
CREATE POLICY "Anyone can view recipe images" ON storage.objects
FOR SELECT USING (bucket_id = 'recipe-images');

CREATE POLICY "Authenticated users can upload recipe images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'recipe-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own recipe images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'recipe-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own recipe images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'recipe-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Step 2: Test Image Upload

1. **Visit** `http://localhost:3000/share`
2. **Sign in** to your account
3. **Scroll down** to the "Recipe Images" section
4. **Upload images** by:
   - Clicking the upload area
   - Dragging and dropping images
   - Using the "Add More Images" button

## Features:

### ✅ **What's Included:**
- **Drag & Drop** - Drag images directly onto the upload area
- **Multiple Images** - Upload up to 5 images per recipe
- **Image Preview** - See thumbnails of uploaded images
- **Remove Images** - Click the X to remove individual images
- **File Validation** - Only allows image files (PNG, JPG, GIF)
- **Size Limits** - Max 5MB per image
- **Progress Indicators** - Shows upload progress
- **Error Handling** - Clear error messages for failed uploads

### 🎯 **How It Works:**
1. **Images are uploaded** to Supabase Storage
2. **Public URLs are generated** for each image
3. **URLs are stored** in the recipe's `image_urls` field
4. **Images display** on the homepage and recipe cards

### 🔒 **Security:**
- **Authenticated users only** can upload images
- **RLS policies** protect image access
- **File type validation** prevents non-image uploads
- **Size limits** prevent large file uploads

## Next Steps:

Once you've set up storage and tested image upload, your recipes will display with real photos instead of placeholder images!

**Try uploading some food photos and see how they look on your homepage!** 📸✨
