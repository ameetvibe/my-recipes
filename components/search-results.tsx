"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { RecipeCard } from "./recipe-card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { SearchFilters } from "./search-filters"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"

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
}

interface SearchResultsProps {
  initialFilters?: SearchFilters
}

export function SearchResults({ initialFilters }: SearchResultsProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(initialFilters || {
    query: "",
    cuisine: [],
    difficulty: [],
    dietaryTags: [],
    maxPrepTime: null,
    maxCookTime: null
  })
  
  const searchParams = useSearchParams()

  const RECIPES_PER_PAGE = 12

  // Handle URL parameters on component mount
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      const filters = {
        ...currentFilters,
        query: query
      }
      setCurrentFilters(filters)
      searchRecipes(filters, 1)
    }
  }, [searchParams])

  const searchRecipes = async (filters: SearchFilters, page: number = 1) => {
    setIsLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const supabase = createClient()
      
      let query = supabase
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
        `, { count: 'exact' })
        .eq('is_public', true)

      // Text search
      if (filters.query.trim()) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`)
      }

      // Cuisine filter
      if (filters.cuisine.length > 0) {
        query = query.in('cuisine_type', filters.cuisine)
      }

      // Difficulty filter
      if (filters.difficulty.length > 0) {
        query = query.in('difficulty', filters.difficulty)
      }

      // Dietary tags filter
      if (filters.dietaryTags.length > 0) {
        query = query.overlaps('dietary_tags', filters.dietaryTags)
      }

      // Time filters
      if (filters.maxPrepTime) {
        query = query.lte('prep_time_minutes', filters.maxPrepTime)
      }

      if (filters.maxCookTime) {
        query = query.lte('cook_time_minutes', filters.maxCookTime)
      }

      // Pagination
      const from = (page - 1) * RECIPES_PER_PAGE
      const to = from + RECIPES_PER_PAGE - 1
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      const { data, error: searchError, count } = await query

      if (searchError) {
        throw searchError
      }

      // Calculate average ratings for each recipe
      const recipesWithRatings = (data as unknown as Recipe[]).map(recipe => {
        const averageRating = recipe.ratings && recipe.ratings.length > 0
          ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length
          : 0
        
        return {
          ...recipe,
          average_rating: averageRating,
          rating_count: recipe.ratings?.length || 0
        }
      })

      setRecipes(recipesWithRatings || [])
      setTotalCount(count || 0)
      setCurrentPage(page)
    } catch (error) {
      console.error('Search error:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (filters: SearchFilters) => {
    setCurrentFilters(filters)
    setCurrentPage(1)
    searchRecipes(filters, 1)
  }

  const handleClear = () => {
    setRecipes([])
    setTotalCount(0)
    setCurrentPage(1)
    setHasSearched(false)
    setError(null)
  }

  const handlePageChange = (page: number) => {
    // We need to get the current filters to maintain them during pagination
    // For now, we'll implement a simple approach
    searchRecipes({} as SearchFilters, page)
  }

  const totalPages = Math.ceil(totalCount / RECIPES_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <SearchFilters 
        onSearch={handleSearch}
        onClear={handleClear}
        isLoading={isLoading}
        initialFilters={currentFilters}
      />

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {isLoading ? "Searching..." : `${totalCount} Recipe${totalCount !== 1 ? 's' : ''} Found`}
              </h2>
              {totalCount > 0 && (
                <p className="text-muted-foreground">
                  Showing {((currentPage - 1) * RECIPES_PER_PAGE) + 1} to {Math.min(currentPage * RECIPES_PER_PAGE, totalCount)} of {totalCount} recipes
                </p>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Searching recipes...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => handleClear()}>
                Try Again
              </Button>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && recipes.length === 0 && hasSearched && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Matching recipe not found</p>
              <Button onClick={() => handleClear()}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Recipe Grid */}
          {!isLoading && !error && recipes.length > 0 && (
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
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      if (pageNum > totalPages) return null
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">Discover Amazing Recipes</h3>
          <p className="text-muted-foreground mb-4">
            Use the search and filters above to find your perfect recipe
          </p>
        </div>
      )}
    </div>
  )
}
