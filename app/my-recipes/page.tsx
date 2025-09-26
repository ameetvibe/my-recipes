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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Recipes</h1>
        <p className="text-muted-foreground">
          Manage and view all your shared recipes
        </p>
      </div>

      <MyRecipesList userId={user.id} />
    </div>
  )
}

