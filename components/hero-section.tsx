"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChefHat, Users, Star, Clock } from "lucide-react"
import Image from "next/image"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search triggered with query:', searchQuery)
    if (searchQuery.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      console.log('Navigating to:', searchUrl)
      router.push(searchUrl)
    } else {
      console.log('Empty search query')
    }
  }

  const handleButtonClick = (e?: React.MouseEvent) => {
    e?.preventDefault()
    console.log('Button clicked directly')
    if (searchQuery.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      console.log('Navigating to:', searchUrl)
      router.push(searchUrl)
    } else {
      console.log('Empty search query - please enter something to search')
    }
  }
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f97316%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Discover Amazing
                <span className="text-primary block">Recipes</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Join thousands of food lovers sharing their favorite recipes. 
                Find inspiration, share your creations, and connect with fellow cooking enthusiasts.
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-md relative z-10">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Search recipes, ingredients..."
                  className="pl-10 h-12 relative z-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      console.log('Enter key pressed')
                      handleButtonClick()
                    }
                  }}
                />
              </div>
              <div
                className="bg-orange-500 text-white hover:bg-orange-600 h-12 px-6 rounded-md font-medium transition-colors cursor-pointer active:scale-95 flex items-center justify-center relative z-20 border-2 border-orange-600"
                onClick={(e) => {
                  console.log('DIV CLICKED!')
                  handleButtonClick(e)
                }}
                onMouseEnter={() => console.log('DIV HOVERED!')}
                style={{
                  minWidth: '80px',
                  pointerEvents: 'all',
                  userSelect: 'none'
                }}
              >
                Search
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>10K+ Recipes</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>50K+ Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Quick & Easy</span>
              </div>
            </div>

          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="Delicious homemade pasta"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating Recipe Cards */}
            <div className="absolute -top-4 -left-4 bg-white dark:bg-card rounded-lg p-4 shadow-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Italian Pasta</p>
                  <p className="text-xs text-muted-foreground">by Maria Rossi</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-card rounded-lg p-4 shadow-lg border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">4.8 Rating</p>
                  <p className="text-xs text-muted-foreground">120 reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
