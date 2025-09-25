import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { FavoriteRecipes } from '@/components/favorite-recipes'

export const metadata = {
  title: 'My Favorites | RecipeVibe',
  description: 'View and manage your favorite recipes on RecipeVibe.',
}

export default async function FavoritesPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

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
            Recipes you've saved for later
          </p>
        </div>
        <FavoriteRecipes userId={session.user.id} />
      </div>
    </div>
  )
}