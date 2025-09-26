"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RecipeCard } from "./recipe-card"
import { UserProfileEdit } from "./user-profile-edit"
import { createClient } from "@/lib/supabase"
import {
  User,
  ChefHat,
  Heart,
  Users,
  Edit3,
  Settings
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface UserProfile {
  id: string
  username: string
  full_name: string | null
  email: string
  avatar_url: string | null
  bio: string | null
  cooking_level: 'beginner' | 'intermediate' | 'advanced'
  created_at: string
  recipe_count: number
  follower_count: number
  following_count: number
}

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
  average_rating?: number
  rating_count?: number
}

interface UserProfileProps {
  userId: string
  isOwnProfile?: boolean
}

export function UserProfile({ userId, isOwnProfile = false }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'recipes' | 'about'>('recipes')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!userId) {
          throw new Error('No user ID provided')
        }

        console.log('Fetching profile for userId:', userId)
        const supabase = createClient()

        // Test if supabase client is working
        console.log('Supabase client initialized')

        // Check authentication status
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError) {
          console.error('Auth session error:', authError.message || authError)
        } else {
          console.log('Auth session:', session ? 'authenticated' : 'anonymous')
        }

        // Fetch user profile with counts
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select(`
            id,
            username,
            full_name,
            email,
            avatar_url,
            bio,
            cooking_level,
            created_at
          `)
          .eq('id', userId)
          .maybeSingle() // Use maybeSingle instead of single

        if (profileError) {
          console.error('Profile fetch error:', profileError.message || profileError)
          throw new Error(profileError.message || 'Failed to fetch profile')
        }

        if (!profileData) {
          throw new Error('User profile not found')
        }

        if (!profileData) {
          throw new Error('User not found')
        }

        console.log('Profile data fetched:', profileData)

        // Get recipe count
        const { count: recipeCount, error: recipeCountError } = await supabase
          .from('recipes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_public', true)

        if (recipeCountError) {
          console.error('Recipe count error:', recipeCountError.message || recipeCountError)
        }

        // Get follower count
        const { count: followerCount, error: followerCountError } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId)

        if (followerCountError) {
          console.error('Follower count error:', followerCountError.message || followerCountError)
        }

        // Get following count
        const { count: followingCount, error: followingCountError } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId)

        if (followingCountError) {
          console.error('Following count error:', followingCountError.message || followingCountError)
        }

        const userProfile: UserProfile = {
          ...profileData,
          recipe_count: recipeCount || 0,
          follower_count: followerCount || 0,
          following_count: followingCount || 0
        }

        setProfile(userProfile)

        // Fetch user's recipes
        console.log('Fetching recipes for userId:', userId)
        const { data: recipesData, error: recipesError } = await supabase
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
            created_at
          `)
          .eq('user_id', userId)
          .eq('is_public', true)
          .order('created_at', { ascending: false })

        if (recipesError) {
          console.error('Recipes fetch error:', recipesError.message || recipesError)
          throw new Error(recipesError.message || 'Failed to fetch recipes')
        }

        console.log('Recipes data fetched:', recipesData)
        setRecipes((recipesData as unknown as Recipe[]) || [])
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-3 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "The user profile you're looking for doesn't exist."}
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const formattedJoinDate = formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })

  return (
    <div className="container mx-auto py-8">
      {isEditing ? (
        <UserProfileEdit
          userId={userId}
          onCancel={() => setIsEditing(false)}
          onSave={() => {
            setIsEditing(false)
            // Refresh profile data
            window.location.reload()
          }}
        />
      ) : (
        <>
          {/* Profile Header */}
          <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
              <AvatarFallback className="text-2xl">
                {profile.username.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{profile.full_name || profile.username}</h1>
                  <p className="text-muted-foreground">@{profile.username} • Joined {formattedJoinDate}</p>
                  {profile.cooking_level && (
                    <Badge variant="secondary" className="mt-2">
                      {profile.cooking_level.charAt(0).toUpperCase() + profile.cooking_level.slice(1)} Chef
                    </Badge>
                  )}
                </div>
                
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="border-2 border-blue-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-blue-700 hover:text-blue-800 transition-all duration-300 hover:scale-105"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-2 border-purple-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 text-purple-700 hover:text-purple-800 transition-all duration-300 hover:scale-105"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                )}
              </div>

              {/* Profile Stats */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-primary" />
                  <span className="font-medium">{profile.recipe_count}</span>
                  <span className="text-muted-foreground">Recipes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{profile.follower_count}</span>
                  <span className="text-muted-foreground">Followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="font-medium">{profile.following_count}</span>
                  <span className="text-muted-foreground">Following</span>
                </div>
              </div>

              {/* Bio and Contact Info */}
              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
              
              {/* Additional profile info can be added here when schema is extended */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'recipes' ? 'default' : 'outline'}
          onClick={() => setActiveTab('recipes')}
        >
          <ChefHat className="h-4 w-4 mr-2" />
          Recipes ({profile.recipe_count})
        </Button>
        <Button
          variant={activeTab === 'about' ? 'default' : 'outline'}
          onClick={() => setActiveTab('about')}
        >
          <User className="h-4 w-4 mr-2" />
          About
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'recipes' && (
        <div className="space-y-6">
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description || ""}
                    imageUrl={recipe.image_urls[0] || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                    author={{
                      name: profile?.username || "Unknown",
                      avatar: profile?.avatar_url || undefined
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
          ) : (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Recipes Yet</h3>
              <p className="text-muted-foreground mb-4">
                {isOwnProfile 
                  ? "You haven't shared any recipes yet. Start sharing your culinary creations!"
                  : `${profile.username} hasn't shared any recipes yet.`
                }
              </p>
              {isOwnProfile && (
                <Button asChild>
                  <a href="/share">Share Your First Recipe</a>
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <Card>
          <CardHeader>
            <CardTitle>About {profile.username}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Member Since</h4>
                <p className="text-muted-foreground">{formattedJoinDate}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Total Recipes</h4>
                <p className="text-muted-foreground">{profile.recipe_count}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cooking Level</h4>
                <p className="text-muted-foreground">
                  {profile.cooking_level ? 
                    profile.cooking_level.charAt(0).toUpperCase() + profile.cooking_level.slice(1) : 
                    'Not specified'
                  }
                </p>
              </div>
            </div>
            
            {profile.bio && (
              <div>
                <h4 className="font-semibold mb-2">Bio</h4>
                <p className="text-muted-foreground">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  )
}
