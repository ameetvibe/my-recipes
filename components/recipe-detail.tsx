"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RecipeRating } from "@/components/recipe-rating"
import { RecipeComments } from "@/components/recipe-comments"
import { 
  Clock, 
  Users, 
  ChefHat, 
  Star, 
  Heart, 
  Share2, 
  ArrowLeft,
  Calendar,
  Globe
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface Recipe {
  id: string
  title: string
  description: string | null
  image_urls: string[]
  ingredients: Array<{
    name: string
    amount: string
    unit: string
  }>
  instructions: Array<{
    step: number
    instruction: string
  }>
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
    created_at: string
  }
}

interface RecipeDetailProps {
  recipe: Recipe
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [likeCount, setLikeCount] = useState(0)
  const supabase = createClient() // Keep this here for other functions

  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)

  useEffect(() => {
    async function fetchRatingAndComments() {
      try {
        const supabase = createClient()
        // Fetch average rating
        const { data: ratings } = await supabase
          .from('ratings')
          .select('rating')
          .eq('recipe_id', recipe.id)

        if (ratings && ratings.length > 0) {
          const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          setAverageRating(avg)
        }

        // Fetch like count
        const { count: likeCountData } = await supabase
          .from('recipe_likes')
          .select('*', { count: 'exact', head: true })
          .eq('recipe_id', recipe.id)

        setLikeCount(likeCountData || 0)

        // Fetch user's rating and favorite status if logged in
        console.log('Fetching user data...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('User data:', { user, userError })

        if (userError) {
          console.error('Error fetching user:', userError)
        }

        if (user) {
          setUser(user)

          const { data: userRatingData, error: ratingError } = await supabase
            .from('ratings')
            .select('rating')
            .eq('user_id', user.id)
            .eq('recipe_id', recipe.id)
            .maybeSingle() // Use maybeSingle instead of single

          console.log('Rating check result:', { userRatingData, ratingError })
          if (userRatingData) {
            setUserRating(userRatingData.rating)
          }

          // Check if user has liked this recipe
          const { data: likeData, error: likeError } = await supabase
            .from('recipe_likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('recipe_id', recipe.id)
            .maybeSingle() // Use maybeSingle instead of single to handle no results

          console.log('Like check result:', { likeData, likeError })
          setIsLiked(!!likeData)
        }

        // Fetch comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select(`
            id,
            content,
            created_at,
            updated_at,
            user_id,
            parent_comment_id,
            users!inner(username, avatar_url)
          `)
          .eq('recipe_id', recipe.id)
          .is('parent_comment_id', null)
          .order('created_at', { ascending: false })

        if (commentsData) {
          // Fetch replies for each comment
          const commentsWithReplies = await Promise.all(
            commentsData.map(async (comment) => {
              const { data: replies } = await supabase
                .from('comments')
                .select(`
                  id,
                  content,
                  created_at,
                  updated_at,
                  user_id,
                  parent_comment_id,
                  users!inner(username, avatar_url)
                `)
                .eq('parent_comment_id', comment.id)
                .order('created_at', { ascending: true })

              return {
                ...comment,
                replies: replies || []
              }
            })
          )
          setComments(commentsWithReplies)
        }
      } catch (error) {
        console.error('Error fetching rating and comments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRatingAndComments()
  }, [recipe.id, supabase])
  
  const difficultyColors = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800", 
    hard: "bg-red-100 text-red-800"
  }

  const handleLikeToggle = async () => {
    console.log('Like toggle clicked, user:', user)

    if (!user) {
      toast.error("Please sign in to like recipes")
      return
    }

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('recipe_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.id)

        if (error) {
          throw new Error(error.message)
        }

        setIsLiked(false)
        setLikeCount(prev => Math.max(0, prev - 1))
        toast.success("Removed from favorites")
      } else {
        // Add like
        const { error } = await supabase
          .from('recipe_likes')
          .insert({
            user_id: user.id,
            recipe_id: recipe.id
          })

        if (error) {
          throw new Error(error.message)
        }

        setIsLiked(true)
        setLikeCount(prev => prev + 1)
        toast.success("Added to favorites")
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error("Failed to update favorite")
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description || `Check out this ${recipe.title} recipe!`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could add a toast notification here
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Recipes
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLikeToggle}>
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recipe Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={difficultyColors[recipe.difficulty]}>
                  {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                </Badge>
                {recipe.cuisine_type && (
                  <Badge variant="outline">
                    <Globe className="h-3 w-3 mr-1" />
                    {recipe.cuisine_type}
                  </Badge>
                )}
                {recipe.dietary_tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-4xl font-bold">{recipe.title}</h1>
              
              {recipe.description && (
                <p className="text-lg text-muted-foreground">{recipe.description}</p>
              )}

              {/* Recipe Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {recipe.prep_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Prep: {recipe.prep_time_minutes}m
                  </div>
                )}
                {recipe.cook_time_minutes && (
                  <div className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    Cook: {recipe.cook_time_minutes}m
                  </div>
                )}
                {totalTime > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Total: {totalTime}m
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Serves {recipe.servings}
                  </div>
                )}
              </div>
            </div>

            {/* Image Gallery */}
            {recipe.image_urls.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-[4/3] relative overflow-hidden rounded-lg">
                      <Image
                        src={recipe.image_urls[selectedImageIndex]}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    
                    {/* Thumbnail Grid */}
                    {recipe.image_urls.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {recipe.image_urls.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`aspect-square relative overflow-hidden rounded-md border-2 transition-colors ${
                              selectedImageIndex === index 
                                ? 'border-primary' 
                                : 'border-transparent hover:border-muted-foreground'
                            }`}
                          >
                            <Image
                              src={url}
                              alt={`${recipe.title} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                      <span className="font-medium">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                      <span className="text-muted-foreground">{ingredient.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {instruction.step}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground">{instruction.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recipe by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {recipe.users.avatar_url ? (
                      <Image
                        src={recipe.users.avatar_url}
                        alt={recipe.users.username}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {recipe.users.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{recipe.users.username}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(recipe.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <Badge className={difficultyColors[recipe.difficulty]}>
                    {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                  </Badge>
                </div>
                {recipe.cuisine_type && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cuisine</span>
                    <span className="font-medium">{recipe.cuisine_type}</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servings</span>
                    <span className="font-medium">{recipe.servings}</span>
                  </div>
                )}
                {totalTime > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Time</span>
                    <span className="font-medium">{totalTime} minutes</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" onClick={handleLikeToggle}>
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like Recipe'}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Recipe
              </Button>
              {likeCount > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  {likeCount} {likeCount === 1 ? 'person likes' : 'people like'} this recipe
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rating and Comments Section */}
        <div className="mt-12 space-y-8">
          {/* Rating Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Rate This Recipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecipeRating
                recipeId={recipe.id}
                initialRating={averageRating}
                initialUserRating={userRating}
                onRatingChange={setAverageRating}
              />
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comments & Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <RecipeComments
                recipeId={recipe.id}
                initialComments={comments}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
