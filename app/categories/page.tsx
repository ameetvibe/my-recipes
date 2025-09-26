import { CategoriesGrid } from "@/components/categories-grid"

export const metadata = {
  title: 'Recipe Categories | RecipeVibe',
  description: 'Explore recipes by cuisine type. Discover Italian, Mexican, Asian, American, Mediterranean and many more delicious cuisines.',
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50">
      {/* Header Section with Pastel Background */}
      <div className="bg-gradient-to-r from-cyan-100 via-sky-100 to-blue-100 border-b border-cyan-200/50">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">
              Recipe Categories
            </h1>
            <p className="text-cyan-700/80 text-lg max-w-2xl mx-auto">
              Explore our diverse collection of recipes organized by cuisine type.
              From traditional Italian pasta to spicy Mexican dishes, find your next favorite meal.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto py-8 px-4">
        <CategoriesGrid />
      </div>
    </div>
  )
}