import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { FavoriteRecipes } from '@/components/favorite-recipes'

export const metadata = {
  title: 'My Favorites | RecipeVibe',
  description: 'View and manage your favorite recipes on RecipeVibe.',
}

export default async function FavoritesPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            Recipes you&apos;ve saved for later
          </p>
        </div>
        <FavoriteRecipes userId={session.user.id} />
      </div>
    </div>
  )
}