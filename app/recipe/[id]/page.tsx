import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { RecipeDetail } from "@/components/recipe-detail"

interface RecipePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RecipePage({ params }: RecipePageProps) {
  try {
    const supabase = await createServerSupabaseClient()
    const resolvedParams = await params

    console.log('Fetching recipe with ID:', resolvedParams.id)

    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        users!recipes_user_id_fkey(username, avatar_url, created_at)
      `)
      .eq('id', resolvedParams.id)
      .eq('is_public', true)
      .maybeSingle() // Use maybeSingle instead of single

    console.log('Recipe fetch result:', { recipe, error })

    if (error) {
      console.error('Recipe fetch error:', error)
      notFound()
    }

    if (!recipe) {
      console.log('Recipe not found or not public')
      notFound()
    }

    return <RecipeDetail recipe={recipe} />
  } catch (error) {
    console.error('Recipe page error:', error)
    notFound()
  }
}

export async function generateMetadata({ params }: RecipePageProps) {
  try {
    const supabase = await createServerSupabaseClient()
    const resolvedParams = await params

    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('title, description')
      .eq('id', resolvedParams.id)
      .eq('is_public', true)
      .maybeSingle() // Use maybeSingle instead of single

    if (error || !recipe) {
      return {
        title: "Recipe Not Found - RecipeVibe",
      }
    }

    return {
      title: `${recipe.title} - RecipeVibe`,
      description: recipe.description || `Delicious ${recipe.title} recipe`,
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    return {
      title: "Recipe Not Found - RecipeVibe",
    }
  }
}
