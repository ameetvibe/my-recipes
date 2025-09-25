"use client"

import { useState, useEffect } from "react"
import { RecipeCard } from "./recipe-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { Loader2, Heart, BookOpen } from "lucide-react"
import Link from "next/link"

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
  created_at: string
  users: {
    username: string
    avatar_url: string | null
  } | null
  ratings: { rating: number }[]
  average_rating?: number
  rating_count?: number
  like_count?: number
}

interface FavoriteRecipesProps {
  userId: string
}

export function FavoriteRecipes({ userId }: FavoriteRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFavoriteRecipes()
  }, [userId])

  const fetchFavoriteRecipes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      console.log('Fetching favorite recipes...')

      // Fetch favorite recipes through the recipe_likes join
      const { data, error } = await supabase
        .from('recipe_likes')
        .select(`
          recipe_id,
          recipes!inner(
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
            created_at,
            users!inner(username, avatar_url),
            ratings(rating)
          )
        `)
        .eq('user_id', userId)
        .eq('recipes.is_public', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Favorite recipes fetch error:', error.message || error)
        throw new Error(error.message || 'Failed to fetch favorite recipes')
      }

      // Transform the data to match our Recipe interface
      const favoriteRecipes = (data || []).map(item => {
        const recipe = item.recipes as any
        const averageRating = recipe.ratings && recipe.ratings.length > 0
          ? recipe.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / recipe.ratings.length
          : 0

        return {
          ...recipe,
          average_rating: averageRating,
          rating_count: recipe.ratings?.length || 0,
          like_count: 0 // We'll fetch this separately if needed
        }
      })

      setRecipes(favoriteRecipes)
    } catch (error) {
      console.error('Error fetching favorite recipes:', error)
      setError(error instanceof Error ? error.message : 'Failed to load favorite recipes')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => fetchFavoriteRecipes()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Favorite Recipes Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start exploring recipes and click the heart icon to save them to your favorites.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link href="/search">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Recipes
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/categories">
              View Categories
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {recipes.length} favorite {recipes.length === 1 ? 'recipe' : 'recipes'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            description={recipe.description || ""}
            imageUrl={recipe.image_urls[0] || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
            author={{
              name: recipe.users?.username || "Unknown",
              avatar: recipe.users?.avatar_url || undefined
            }}
            prepTime={recipe.prep_time_minutes || 0}
            cookTime={recipe.cook_time_minutes || 0}
            servings={recipe.servings || 1}
            rating={recipe.average_rating || 0}
            difficulty={recipe.difficulty}
            cuisine={recipe.cuisine_type || undefined}
            dietaryTags={recipe.dietary_tags}
            likeCount={recipe.like_count}
          />
        ))}
      </div>
    </div>
  )
}