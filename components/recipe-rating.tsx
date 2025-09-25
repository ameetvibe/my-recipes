"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface RecipeRatingProps {
  recipeId: string
  initialRating?: number
  initialUserRating?: number
  onRatingChange?: (newRating: number) => void
  disabled?: boolean
}

export function RecipeRating({ 
  recipeId, 
  initialRating = 0, 
  initialUserRating = 0,
  onRatingChange,
  disabled = false 
}: RecipeRatingProps) {
  const [rating, setRating] = useState(initialRating)
  const [userRating, setUserRating] = useState(initialUserRating)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setRating(initialRating)
    setUserRating(initialUserRating)
  }, [initialRating, initialUserRating])

  const handleRatingClick = async (newRating: number) => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Authentication Required", {
          description: "Please sign in to rate recipes.",
        })
        return
      }

      // Check if user already rated this recipe
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id, rating')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single()

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('ratings')
          .update({ rating: newRating })
          .eq('id', existingRating.id)

        if (error) throw error
      } else {
        // Create new rating
        const { error } = await supabase
          .from('ratings')
          .insert({
            user_id: user.id,
            recipe_id: recipeId,
            rating: newRating
          })

        if (error) throw error
      }

      setUserRating(newRating)
      
      // Recalculate average rating
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('recipe_id', recipeId)

      if (ratings) {
        const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        setRating(averageRating)
        onRatingChange?.(averageRating)
      }

      toast.success("Rating Saved", {
        description: `You rated this recipe ${newRating} star${newRating !== 1 ? 's' : ''}.`,
      })

    } catch (error) {
      console.error('Error saving rating:', error)
      toast.error("Error", {
        description: "Failed to save rating. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const displayRating = hoveredRating || userRating || rating

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={disabled || isLoading}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground hover:text-yellow-400'
              }`}
            />
          </Button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating > 0 ? rating.toFixed(1) : 'No rating'}
      </span>
    </div>
  )
}
