import { redirect } from "next/navigation"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { MyRecipesList } from "@/components/my-recipes-list"

export default async function MyRecipesPage() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Recipes</h1>
        <p className="text-muted-foreground">
          Manage and view all your shared recipes
        </p>
      </div>

      <MyRecipesList userId={user.id} />
    </div>
  )
}

export const metadata = {
  title: "My Recipes - RecipeVibe",
  description: "Manage and view all your shared recipes",
}