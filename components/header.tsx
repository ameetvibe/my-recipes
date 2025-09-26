"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthModal } from "@/components/auth/auth-modal"
import { UserMenu } from "@/components/auth/user-menu"
import { createClient } from "@/lib/supabase"
import { Search, Menu, X, ChefHat, User, Heart, Plus } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-yellow-200 transition-colors">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            RecipeVibe
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 ml-8">
            <Link
              href="/search"
              className="text-sm font-medium text-white/90 transition-colors hover:text-yellow-200"
            >
              Search Recipes
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-white/90 transition-colors hover:text-yellow-200"
            >
              Categories
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search recipes, ingredients..."
                className="pl-10 bg-white/90 backdrop-blur border-white/20 focus:border-yellow-300 placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-8 animate-pulse bg-white/20 rounded-full" />
            ) : user ? (
              <>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-yellow-200" asChild>
                  <Link href="/my-recipes">
                    <ChefHat className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-yellow-200" asChild>
                  <Link href="/favorites">
                    <Heart className="h-4 w-4" />
                  </Link>
                </Button>
                <UserMenu user={user} />
                <Button size="sm" className="bg-yellow-400 text-orange-800 hover:bg-yellow-300 font-semibold" asChild>
                  <Link href="/share">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipe
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-yellow-200" onClick={() => setIsAuthModalOpen(true)}>
                  <User className="h-4 w-4" />
                </Button>
                <Button size="sm" className="bg-yellow-400 text-orange-800 hover:bg-yellow-300 font-semibold" onClick={() => setIsAuthModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipe
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4 space-y-4 bg-black/10 backdrop-blur">
            {/* Mobile User Actions - Moved to top */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/20">
              {isLoading ? (
                <div className="h-8 w-8 animate-pulse bg-white/20 rounded-full flex-1" />
              ) : user ? (
                <>
                  <Button variant="ghost" size="sm" className="flex-1 text-white hover:bg-white/20 hover:text-yellow-200" asChild>
                    <Link href="/favorites">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </Link>
                  </Button>
                  <UserMenu user={user} />
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="flex-1 text-white hover:bg-white/20 hover:text-yellow-200" onClick={() => setIsAuthModalOpen(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search recipes..."
                className="pl-10 bg-white/90 backdrop-blur border-white/20 focus:border-yellow-300 placeholder:text-gray-500"
              />
            </div>

            {/* Mobile Navigation Links */}
            <nav className="space-y-3">
              <Link
                href="/categories"
                className="block py-2 text-sm font-medium text-white/90 transition-colors hover:text-yellow-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
            </nav>

            {/* Add Recipe Button */}
            <Button size="sm" className="w-full bg-yellow-400 text-orange-800 hover:bg-yellow-300 font-semibold" asChild>
              <Link href={user ? "/share" : "#"} onClick={user ? undefined : () => setIsAuthModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  )
}

