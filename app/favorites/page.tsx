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
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">
            Recipes you&apos;ve saved for later
          </p>
        </div>
        <FavoriteRecipes userId={user.id} />
      </div>
    </div>
  )
}