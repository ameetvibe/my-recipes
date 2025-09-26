import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './supabase'

export const createServerSupabaseClient = async () => {
  // Use hardcoded values for consistency with client
  const supabaseUrl = 'https://zgnxoygcmxwwrctrdwhd.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnbnhveWdjbXh3d3JjdHJkd2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MzM4OTIsImV4cCI6MjA3NDIwOTg5Mn0.Dj8nif252wQ0xhWyESFK3RYzHVwxlHhkeLwVwMdafnA'

  const cookieStore = await cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}