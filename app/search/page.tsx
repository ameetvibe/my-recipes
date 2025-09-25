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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Search Recipes</h1>
        <p className="text-muted-foreground text-lg">
          Discover amazing recipes with our powerful search and filtering tools
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading search...</span>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  )
}
