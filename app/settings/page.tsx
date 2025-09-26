"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { UserSettings } from "@/components/user-settings"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getUserAndData() {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        console.log('Settings - User check:', { user, error })

        if (error || !user) {
          console.log('No user found, redirecting to home')
          router.push('/')
          return
        }

        setUser(user)

        // Fetch user data
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id, username, full_name, bio, avatar_url, created_at')
          .eq('id', user.id)
          .limit(1)

        if (userError) {
          console.error('User data fetch error:', userError)
        } else if (users && users.length > 0) {
          setUserData(users[0])
        }

      } catch (error) {
        console.error('Auth error:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    getUserAndData()
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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <UserSettings user={user} userData={userData} />
      </div>
    </div>
  )
}