import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { EditRecipeForm } from "@/components/edit-recipe-form"
import type { Database } from '@/lib/supabase'

interface EditRecipePageProps {
  params: Promise<{ id: string }>
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params
  

  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the recipe and verify ownership
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      id,
      title,
      description,
      ingredients,
      instructions,
      prep_time_minutes,
      cook_time_minutes,
      servings,
      difficulty,
      cuisine_type,
      dietary_tags,
      image_urls,
      is_public,
      user_id
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !recipe) {
    redirect('/my-recipes')
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <EditRecipeForm recipe={recipe} />
      </div>
    </div>
  )
}