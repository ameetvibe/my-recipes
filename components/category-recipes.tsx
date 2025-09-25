"use client"

import { useState, useEffect } from "react"
import { RecipeCard } from "./recipe-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { Loader2, ArrowLeft } from "lucide-react"
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

interface CategoryRecipesProps {
  categoryName: string
}

export function CategoryRecipes({ categoryName }: CategoryRecipesProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const RECIPES_PER_PAGE = 12

  useEffect(() => {
    fetchRecipes()
  }, [categoryName])

  const fetchRecipes = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      const supabase = createClient()

      const from = (pageNum - 1) * RECIPES_PER_PAGE
      const to = from + RECIPES_PER_PAGE - 1

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
        .ilike('cuisine_type', `%${categoryName}%`)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) {
        console.error('Category recipes fetch error:', error.message || error)
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
          like_count: 0 // Placeholder until likes are implemented
        }
      })

      if (append) {
        setRecipes(prev => [...prev, ...recipesWithRatings])
      } else {
        setRecipes(recipesWithRatings || [])
      }

      setHasMore(recipesWithRatings.length === RECIPES_PER_PAGE)
      setPage(pageNum)
    } catch (error) {
      console.error('Error fetching category recipes:', error)
      setError(error instanceof Error ? error.message : 'Failed to load recipes')
    } finally {
      setIsLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchRecipes(page + 1, true)
    }
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/categories">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchRecipes()}>
            Try Again
          </Button>
        </div>
      )}

      {/* Recipes Grid */}
      {!isLoading && !error && (
        <>
          {recipes.length > 0 ? (
            <>
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

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    size="lg"
                    variant="outline"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading More...
                      </>
                    ) : (
                      'Load More Recipes'
                    )}
                  </Button>
                </div>
              )}

              {/* Recipe Count */}
              <div className="text-center text-sm text-muted-foreground">
                Showing {recipes.length} {categoryName} {recipes.length === 1 ? 'recipe' : 'recipes'}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No {categoryName} Recipes Found</h3>
              <p className="text-muted-foreground mb-4">
                We don't have any {categoryName.toLowerCase()} recipes yet. Be the first to share one!
              </p>
              <Button asChild>
                <Link href="/share">
                  Share a {categoryName} Recipe
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}