"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { EditRecipeForm } from "@/components/edit-recipe-form"
import { Loader2 } from "lucide-react"
import { notFound } from "next/navigation"

export default function EditRecipePage() {
  const [user, setUser] = useState<any>(null)
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    async function loadRecipeForEdit() {
      try {
        console.log('Edit Recipe - Loading recipe with ID:', id)
        const supabase = createClient()

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
          console.error('Auth error in edit recipe:', authError)
          router.push('/')
          return
        }

        setUser(user)

        // Fetch the recipe and verify ownership
        const { data: recipe, error: recipeError } = await supabase
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
          .maybeSingle() // Use maybeSingle instead of single

        console.log('Recipe fetch result:', { recipe, recipeError })

        if (recipeError) {
          console.error('Recipe fetch error:', recipeError)
          setError('Failed to load recipe')
          return
        }

        if (!recipe) {
          console.log('Recipe not found or not owned by user')
          router.push('/my-recipes')
          return
        }

        setRecipe(recipe)

      } catch (error) {
        console.error('Edit recipe page error:', error)
        setError('Failed to load recipe')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadRecipeForEdit()
    }
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!user || !recipe) {
    return null
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <EditRecipeForm recipe={recipe} />
      </div>
    </div>
  )
}