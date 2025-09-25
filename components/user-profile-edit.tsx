"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase"
import { Loader2, Upload, Save, X } from "lucide-react"
import { toast } from "sonner"

interface UserProfileEditProps {
  userId: string
  onCancel: () => void
  onSave: () => void
}

interface ProfileData {
  username: string
  full_name: string
  bio: string
  cooking_level: 'beginner' | 'intermediate' | 'advanced'
  avatar_url: string | null
}

export function UserProfileEdit({ userId, onCancel, onSave }: UserProfileEditProps) {
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    full_name: "",
    bio: "",
    cooking_level: "beginner",
    avatar_url: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('users')
          .select('username, full_name, bio, cooking_level, avatar_url')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Profile fetch error:', error.message || error)
          throw new Error(error.message || 'Failed to fetch profile')
        }

        setProfileData({
          username: data.username || "",
          full_name: data.full_name || "",
          bio: data.bio || "",
          cooking_level: data.cooking_level || "beginner",
          avatar_url: data.avatar_url
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error(error instanceof Error ? error.message : "Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const preview = URL.createObjectURL(file)
      setAvatarPreview(preview)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const supabase = createClient()
      
      let avatarUrl = profileData.avatar_url

      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${userId}/avatar.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('Avatar upload error:', uploadError.message || uploadError)
          throw new Error(uploadError.message || 'Failed to upload avatar')
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        avatarUrl = publicUrlData.publicUrl
      }

      // Update profile data
      const { error } = await supabase
        .from('users')
        .update({
          username: profileData.username,
          full_name: profileData.full_name || null,
          bio: profileData.bio || null,
          cooking_level: profileData.cooking_level,
          avatar_url: avatarUrl
        })
        .eq('id', userId)

      if (error) {
        console.error('Profile update error:', error.message || error)
        throw new Error(error.message || 'Failed to update profile')
      }

      toast.success("Profile updated successfully!")

      onSave()
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={avatarPreview || profileData.avatar_url || undefined} 
                alt="Profile" 
              />
              <AvatarFallback className="text-2xl">
                {profileData.username.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="font-semibold">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Click the upload icon to change your profile picture
            </p>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            Username *
          </label>
          <Input
            id="username"
            value={profileData.username}
            onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
            placeholder="Enter your username"
            required
          />
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm font-medium">
            Full Name
          </label>
          <Input
            id="full_name"
            value={profileData.full_name}
            onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
            placeholder="Enter your full name"
          />
        </div>

        {/* Cooking Level */}
        <div className="space-y-2">
          <label htmlFor="cooking_level" className="text-sm font-medium">
            Cooking Level
          </label>
          <Select
            value={profileData.cooking_level}
            onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
              setProfileData(prev => ({ ...prev, cooking_level: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your cooking level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio
          </label>
          <Textarea
            id="bio"
            value={profileData.bio}
            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </div>

        {/* Future fields can be added here when database schema is extended */}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
