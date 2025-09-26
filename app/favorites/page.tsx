"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { FavoriteRecipes } from "@/components/favorite-recipes"
import { Loader2 } from "lucide-react"

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        console.log('Favorites - User check:', { user, error })

        if (error || !user) {
          console.log('No user found, redirecting to home')
          router.push('/')
          return
        }

        setUser(user)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      {/* Header Section with Pastel Background */}
      <div className="bg-gradient-to-r from-red-100 via-rose-100 to-pink-100 border-b border-red-200/50">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
              My Favorites
            </h1>
            <p className="text-red-700/80 text-lg max-w-2xl mx-auto">
              Recipes you've saved for later
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto py-8 px-4">
        <FavoriteRecipes userId={user.id} />
      </div>
    </div>
  )
}