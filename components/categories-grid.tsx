"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface Category {
  name: string
  slug: string
  description: string
  image: string
  recipeCount: number
}

const CUISINE_CATEGORIES = [
  {
    name: "Italian",
    slug: "italian",
    description: "Classic pasta, pizza, and Mediterranean flavors",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80",
  },
  {
    name: "Mexican",
    slug: "mexican",
    description: "Spicy and vibrant dishes with bold flavors",
    image: "https://images.unsplash.com/photo-1565299585323-38174c4a6c56?w=500&q=80",
  },
  {
    name: "Asian",
    slug: "asian",
    description: "Fresh ingredients and aromatic spices from Asia",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d396?w=500&q=80",
  },
  {
    name: "American",
    slug: "american",
    description: "Comfort food classics and BBQ favorites",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&q=80",
  },
  {
    name: "Mediterranean",
    slug: "mediterranean",
    description: "Healthy and flavorful dishes from the Mediterranean",
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=500&q=80",
  },
  {
    name: "Indian",
    slug: "indian",
    description: "Rich curries and aromatic spices",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&q=80",
  },
  {
    name: "French",
    slug: "french",
    description: "Elegant cuisine with refined techniques",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80",
  },
  {
    name: "Chinese",
    slug: "chinese",
    description: "Traditional stir-fries, dumplings, and noodles",
    image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500&q=80",
  },
  {
    name: "Thai",
    slug: "thai",
    description: "Sweet, sour, and spicy flavors in perfect balance",
    image: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=500&q=80",
  },
  {
    name: "Japanese",
    slug: "japanese",
    description: "Fresh sushi, ramen, and umami-rich dishes",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&q=80",
  },
  {
    name: "Greek",
    slug: "greek",
    description: "Mediterranean classics with olive oil and herbs",
    image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=500&q=80",
  },
  {
    name: "Spanish",
    slug: "spanish",
    description: "Paella, tapas, and flavorful regional dishes",
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=500&q=80",
  }
]

export function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategoryCounts() {
      try {
        const supabase = createClient()

        const categoriesWithCounts = await Promise.all(
          CUISINE_CATEGORIES.map(async (category) => {
            const { count } = await supabase
              .from('recipes')
              .select('id', { count: 'exact' })
              .eq('is_public', true)
              .ilike('cuisine_type', `%${category.name}%`)

            return {
              ...category,
              recipeCount: count || 0,
            }
          })
        )

        setCategories(categoriesWithCounts)
      } catch (error) {
        console.error('Error fetching category counts:', error)
        // Set categories with 0 count if there's an error
        setCategories(CUISINE_CATEGORIES.map(cat => ({ ...cat, recipeCount: 0 })))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoryCounts()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((category) => (
        <Link key={category.slug} href={`/categories/${category.slug}`}>
          <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <div className="relative h-48 overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-xl mb-1">
                  {category.name}
                </h3>
                <p className="text-white/90 text-sm line-clamp-2">
                  {category.description}
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {category.recipeCount} {category.recipeCount === 1 ? 'Recipe' : 'Recipes'}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  View All →
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}