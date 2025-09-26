"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { MyRecipesList } from "@/components/my-recipes-list"
import { Loader2 } from "lucide-react"

export default function MyRecipesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        console.log('My Recipes - User check:', { user, error })

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
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50">
      {/* Header Section with Pastel Background */}
      <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-peach-100 border-b border-rose-200/50">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              My Recipes
            </h1>
            <p className="text-rose-700/80 text-lg max-w-2xl mx-auto">
              Manage and view all your shared recipes
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto py-8 px-4">
        <MyRecipesList userId={user.id} />
      </div>
    </div>
  )
}

