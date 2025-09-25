import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Singleton client instance to prevent multiple instances
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

// Client-side Supabase client (for use in client components)
export const createClient = () => {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance as ReturnType<typeof createSupabaseClient<Database>>
  }

  // Create new instance only if needed
  const supabaseUrl = 'https://zgnxoygcmxwwrctrdwhd.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnbnhveWdjbXh3d3JjdHJkd2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzM4OTIsImV4cCI6MjA3NDIwOTg5Mn0.Dj8nif252wQ0xhWyESFK3RYzHVwxlHhkeLwVwMdafnA'

  try {
    supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Prevent URL session detection issues
      },
    })
    return supabaseInstance
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
}

// Database types (will be generated after running the schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          cooking_level: 'beginner' | 'intermediate' | 'advanced'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          cooking_level?: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          cooking_level?: 'beginner' | 'intermediate' | 'advanced'
          created_at?: string
          updated_at?: string
        }
      }
      recipes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          ingredients: any
          instructions: any
          prep_time_minutes: number | null
          cook_time_minutes: number | null
          servings: number | null
          difficulty: 'easy' | 'medium' | 'hard'
          cuisine_type: string | null
          dietary_tags: string[]
          image_urls: string[]
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          ingredients?: any
          instructions?: any
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          servings?: number | null
          difficulty?: 'easy' | 'medium' | 'hard'
          cuisine_type?: string | null
          dietary_tags?: string[]
          image_urls?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          ingredients?: any
          instructions?: any
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          servings?: number | null
          difficulty?: 'easy' | 'medium' | 'hard'
          cuisine_type?: string | null
          dietary_tags?: string[]
          image_urls?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          rating: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          rating?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          parent_comment_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          parent_comment_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          parent_comment_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
        }
      }
      collection_recipes: {
        Row: {
          collection_id: string
          recipe_id: string
          added_at: string
        }
        Insert: {
          collection_id: string
          recipe_id: string
          added_at?: string
        }
        Update: {
          collection_id?: string
          recipe_id?: string
          added_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      recipe_likes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      recipe_stats: {
        Row: {
          id: string
          title: string
          user_id: string
          created_at: string
          average_rating: number
          rating_count: number
          comment_count: number
        }
      }
      user_stats: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          recipe_count: number
          follower_count: number
          following_count: number
        }
      }
    }
  }
}
