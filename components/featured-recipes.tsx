"use client"

import { useEffect, useState } from "react"
import { RecipeCard } from "./recipe-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { ArrowRight, TrendingUp } from "lucide-react"

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

export function FeaturedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecipes() {
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
            created_at,
            users!inner(username, avatar_url),
            ratings(rating)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) {
          console.error('Recipe fetch error:', error.message || error)
          throw new Error(error.message || 'Failed to fetch recipes')
        }

        // Calculate average ratings for each recipe
        const recipesWithRatings = (data as unknown as Recipe[]).map(recipe => {
          const averageRating = recipe.ratings && recipe.ratings.length > 0
            ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length
            : 0

          return {
            ...recipe,
            average_rating: averageRating,
            rating_count: recipe.ratings?.length || 0,
            like_count: 0 // Will be populated once likes table is set up
          }
        })

        setRecipes(recipesWithRatings || [])
      } catch (error) {
        console.error('Error fetching recipes:', error)
        setError(error instanceof Error ? error.message : 'Failed to load recipes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Featured Recipes</h2>
          </div>
          <Button variant="outline" className="group">
            View All Recipes
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
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
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Recipe Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
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
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground mb-4">No recipes found</p>
                <Button>
                  Be the first to share a recipe!
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && !error && recipes.length > 0 && (
          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              Load More Recipes
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}