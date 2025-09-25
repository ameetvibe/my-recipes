import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { RecipeDetail } from "@/components/recipe-detail"

interface RecipePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RecipePage({ params }: RecipePageProps) {
  
  const supabase = await createServerSupabaseClient()
  const resolvedParams = await params
  
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      users!recipes_user_id_fkey(username, avatar_url, created_at)
    `)
    .eq('id', resolvedParams.id)
    .eq('is_public', true)
    .single()

  if (error || !recipe) {
    notFound()
  }

  return <RecipeDetail recipe={recipe} />
}

export async function generateMetadata({ params }: RecipePageProps) {
  
  const supabase = await createServerSupabaseClient()
  const resolvedParams = await params
  
  const { data: recipe } = await supabase
    .from('recipes')
    .select('title, description')
    .eq('id', resolvedParams.id)
    .eq('is_public', true)
    .single()

  if (!recipe) {
    return {
      title: "Recipe Not Found",
    }
  }

  return {
    title: `${recipe.title} - RecipeVibe`,
    description: recipe.description || `Delicious ${recipe.title} recipe`,
  }
}
