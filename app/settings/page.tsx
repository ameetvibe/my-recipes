import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { UserSettings } from '@/components/user-settings'

export const metadata = {
  title: 'Settings | RecipeVibe',
  description: 'Manage your account settings and preferences on RecipeVibe.',
}

export default async function SettingsPage() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Auth error in settings page:', sessionError)
      redirect('/')
    }

    if (!session) {
      redirect('/')
    }

    // Fetch user data (only columns that exist)
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username, full_name, bio, avatar_url, created_at')
      .eq('id', session.user.id)
      .limit(1)

    if (userError) {
      console.error('User data fetch error:', userError)
    }

    const userData = users && users.length > 0 ? users[0] : null

    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <UserSettings user={session.user} userData={userData} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Settings page error:', error)
    redirect('/')
  }
}