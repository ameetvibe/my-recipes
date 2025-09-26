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
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border-2 hover:border-gradient-to-r hover:from-orange-200 hover:to-pink-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge
                className={`${
                  difficulty === "easy"
                    ? "bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-md"
                    : difficulty === "medium"
                    ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md"
                    : "bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-md"
                } font-semibold`}
              >
                {difficulty}
              </Badge>
              {user && (
                <Button
                  size="sm"
                  variant="ghost"
                  className={`h-8 w-8 p-0 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md ${isFavorited ? 'text-red-500 hover:text-red-600' : 'text-gray-600 hover:text-red-500'} transition-all duration-300 hover:scale-110`}
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
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-pink-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              {title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {description}
            </p>

            {/* Recipe metadata */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-blue-600">
                <Clock className="h-3 w-3" />
                <span className="font-medium">{prepTime + cookTime}m</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <Users className="h-3 w-3" />
                <span className="font-medium">{servings} servings</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="h-3 w-3 fill-current" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
              {currentLikeCount > 0 && (
                <div className="flex items-center gap-1 text-pink-600">
                  <Heart className="h-3 w-3 fill-current" />
                  <span className="font-medium">{currentLikeCount}</span>
                </div>
              )}
            </div>
            
            {/* Dietary tags */}
            {dietaryTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {dietaryTags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={tag}
                    className={`text-xs font-medium ${
                      index % 3 === 0
                        ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200"
                        : index % 3 === 1
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200"
                        : "bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200"
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
                {dietaryTags.length > 3 && (
                  <Badge className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-200">
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
              <Avatar className="h-6 w-6 ring-2 ring-orange-200 ring-offset-1">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-orange-400 to-pink-400 text-white font-semibold">
                  {author.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700 font-medium">{author.name}</span>
            </div>
            {cuisine && (
              <Badge className="text-xs bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-200 font-medium">
                {cuisine}
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}