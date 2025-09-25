import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { MyRecipesList } from "@/components/my-recipes-list"

export default async function MyRecipesPage() {
  
  const supabase = await createServerSupabaseClient()

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