import { Metadata } from "next"
import { Suspense } from "react"
import { SearchResults } from "@/components/search-results"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Search Recipes - RecipeVibe",
  description: "Find your perfect recipe with our advanced search and filtering options. Search by ingredients, cuisine, difficulty, and more.",
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Header Section with Pastel Background */}
      <div className="bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-100 border-b border-yellow-200/50">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Search Recipes
            </h1>
            <p className="text-yellow-700/80 text-lg max-w-2xl mx-auto">
              Discover amazing recipes with our powerful search and filtering tools
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto py-8 px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="ml-2 text-amber-700">Loading search...</span>
          </div>
        }>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  )
}
