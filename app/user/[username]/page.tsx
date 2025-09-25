import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { UserProfile } from "@/components/user-profile"

interface UserProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  
  const supabase = await createServerSupabaseClient()
  const resolvedParams = await params
  
  const { data: users } = await supabase
    .from('users')
    .select('username, bio')
    .eq('username', resolvedParams.username)
    .limit(1)

  if (!users || users.length === 0) {
    return {
      title: "User Not Found - RecipeVibe",
      description: "The user profile you're looking for doesn't exist.",
    }
  }

  const user = users[0]

  return {
    title: `${user.username} - RecipeVibe`,
    description: user.bio || `View ${user.username}'s recipes and profile on RecipeVibe.`,
    openGraph: {
      title: `${user.username} - RecipeVibe`,
      description: user.bio || `View ${user.username}'s recipes and profile on RecipeVibe.`,
      type: "profile",
    },
  }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  
  const supabase = await createServerSupabaseClient()
  const resolvedParams = await params
  
  // Get current user to determine if this is their own profile
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  // Get the profile user by username
  const { data: profileUsers, error } = await supabase
    .from('users')
    .select('id, username')
    .eq('username', resolvedParams.username)
    .limit(1)

  if (error) {
    console.error('Error fetching user by username:', error.message || error)
    notFound()
  }

  if (!profileUsers || profileUsers.length === 0) {
    console.log('User not found:', resolvedParams.username)
    notFound()
  }

  const profileUser = profileUsers[0]

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <UserProfile 
      userId={profileUser.id} 
      isOwnProfile={isOwnProfile}
    />
  )
}
