"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface RecipeCardProps {
  id: string
  title: string
  description: string
  imageUrl: string
  author: {
    name: string
    avatar?: string
  }
  prepTime: number
  cookTime: number
  servings: number
  rating: number
  difficulty: "easy" | "medium" | "hard"
  cuisine?: string
  dietaryTags?: string[]
  likeCount?: number
}

export function RecipeCard({
  id,
  title,
  description,
  imageUrl,
  author,
  prepTime,
  cookTime,
  servings,
  rating,
  difficulty,
  cuisine,
  dietaryTags = [],
  likeCount = 0
}: RecipeCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkFavoriteStatus()
  }, [id])

  const checkFavoriteStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setUser(null)
        return
      }

      setUser(session.user)

      // Check if user has favorited this recipe
      const { data } = await supabase
        .from('recipe_likes')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('recipe_id', id)
        .single()

      setIsFavorited(!!data)
    } catch (error) {
      // No favorite found or user not authenticated
      setIsFavorited(false)
    }
  }

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast.error("Please sign in to favorite recipes")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('recipe_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', id)

        if (error) {
          throw new Error(error.message)
        }

        setIsFavorited(false)
        setCurrentLikeCount(prev => Math.max(0, prev - 1))
        toast.success("Removed from favorites")
      } else {
        // Add favorite
        const { error } = await supabase
          .from('recipe_likes')
          .insert({
            user_id: user.id,
            recipe_id: id
          })

        if (error) {
          throw new Error(error.message)
        }

        setIsFavorited(true)
        setCurrentLikeCount(prev => prev + 1)
        toast.success("Added to favorites")
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error("Failed to update favorite")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Link href={`/recipe/${id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge
                variant={difficulty === "easy" ? "default" : difficulty === "medium" ? "secondary" : "destructive"}
                className="bg-white/90 text-black hover:bg-white/90"
              >
                {difficulty}
              </Badge>
              {user && (
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white/90 ${isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'}`}
                  onClick={toggleFavorite}
                  disabled={isLoading}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
            
            {/* Recipe metadata */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{prepTime + cookTime}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{servings} servings</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
              {currentLikeCount > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-red-400 text-red-400" />
                  <span>{currentLikeCount}</span>
                </div>
              )}
            </div>
            
            {/* Dietary tags */}
            {dietaryTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {dietaryTags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {dietaryTags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{dietaryTags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="text-xs">
                  {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{author.name}</span>
            </div>
            {cuisine && (
              <Badge variant="secondary" className="text-xs">
                {cuisine}
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}