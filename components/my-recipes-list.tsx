"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecipeCard } from "./recipe-card"
import { createClient } from "@/lib/supabase"
import { ChefHat, Plus, Eye, EyeOff, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Recipe {
  id: string
  title: string
  description: string | null
  image_urls: string[]
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  servings: number | null
  difficulty: "easy" | "medium" | "hard"
  cuisine_type: string | null
  dietary_tags: string[]
  is_public: boolean
  created_at: string
  average_rating?: number
  rating_count?: number
  like_count?: number
}

interface MyRecipesListProps {
  userId: string
}

export function MyRecipesList({ userId }: MyRecipesListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchMyRecipes() {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('recipes')
          .select(`
            id,
            title,
            description,
            image_urls,
            prep_time_minutes,
            cook_time_minutes,
            servings,
            difficulty,
            cuisine_type,
            dietary_tags,
            is_public,
            created_at,
            ratings(rating)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('My recipes fetch error:', error.message || error)
          throw new Error(error.message || 'Failed to fetch recipes')
        }

        // Calculate average ratings for each recipe
        const recipesWithRatings = (data as unknown as Recipe[]).map(recipe => {
          const ratings = (recipe as any).ratings || []
          const averageRating = ratings.length > 0
            ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
            : 0

          return {
            ...recipe,
            average_rating: averageRating,
            rating_count: ratings.length,
            like_count: 0 // Will be fetched from likes table once implemented
          }
        })

        setRecipes(recipesWithRatings || [])
      } catch (error) {
        console.error('Error fetching my recipes:', error)
        setError(error instanceof Error ? error.message : 'Failed to load recipes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyRecipes()
  }, [userId])

  const toggleVisibility = async (recipeId: string, currentVisibility: boolean) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('recipes')
        .update({ is_public: !currentVisibility })
        .eq('id', recipeId)
        .eq('user_id', userId)

      if (error) {
        console.error('Toggle visibility error:', error.message || error)
        throw new Error(error.message || 'Failed to update recipe visibility')
      }

      // Update local state
      setRecipes(prev => prev.map(recipe =>
        recipe.id === recipeId
          ? { ...recipe, is_public: !currentVisibility }
          : recipe
      ))

      toast.success(`Recipe ${!currentVisibility ? 'published' : 'made private'}`)
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update recipe')
    }
  }

  const deleteRecipe = async (recipeId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('user_id', userId)

      if (error) {
        console.error('Delete recipe error:', error.message || error)
        throw new Error(error.message || 'Failed to delete recipe')
      }

      // Update local state
      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
      toast.success('Recipe deleted successfully')
    } catch (error) {
      console.error('Error deleting recipe:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete recipe')
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted h-48 rounded-lg mb-4"></div>
            <div className="bg-muted h-4 rounded mb-2"></div>
            <div className="bg-muted h-3 rounded w-3/4 mb-4"></div>
            <div className="flex gap-2">
              <div className="bg-muted h-6 rounded w-16"></div>
              <div className="bg-muted h-6 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Recipes Yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven&apos;t shared any recipes yet. Start sharing your culinary creations!
        </p>
        <Button asChild>
          <Link href="/share">
            <Plus className="h-4 w-4 mr-2" />
            Share Your First Recipe
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public Recipes</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recipes.filter(r => r.is_public).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recipes.reduce((sum, r) => sum + (r.rating_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Recipe Button */}
      <div className="flex justify-end mb-6">
        <Button asChild>
          <Link href="/share">
            <Plus className="h-4 w-4 mr-2" />
            Add New Recipe
          </Link>
        </Button>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="relative group">
            <RecipeCard
              id={recipe.id}
              title={recipe.title}
              description={recipe.description || ""}
              imageUrl={recipe.image_urls[0] || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
              author={{
                name: "You",
                avatar: undefined
              }}
              prepTime={recipe.prep_time_minutes || 0}
              cookTime={recipe.cook_time_minutes || 0}
              servings={recipe.servings || 1}
              rating={recipe.average_rating || 0}
              difficulty={recipe.difficulty}
              cuisine={recipe.cuisine_type || undefined}
              dietaryTags={recipe.dietary_tags}
            />

            {/* Recipe Management Overlay */}
            <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={recipe.is_public ? "default" : "secondary"}
                  onClick={(e) => {
                    e.preventDefault()
                    toggleVisibility(recipe.id, recipe.is_public)
                  }}
                  title={recipe.is_public ? "Make private" : "Make public"}
                >
                  {recipe.is_public ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(`/edit-recipe/${recipe.id}`)
                  }}
                  title="Edit recipe"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault()
                    deleteRecipe(recipe.id, recipe.title)
                  }}
                  title="Delete recipe"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Visibility Indicator */}
            <div className="absolute top-2 left-2">
              {!recipe.is_public && (
                <div className="bg-yellow-500 text-yellow-50 px-2 py-1 rounded text-xs font-medium">
                  Private
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}