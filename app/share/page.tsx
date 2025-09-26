import { RecipeForm } from "@/components/recipe-form"

export default function ShareRecipe() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header Section with Pastel Background */}
      <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 border-b border-green-200/50">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Share Your Recipe
            </h1>
            <p className="text-green-700/80 text-lg max-w-2xl mx-auto">
              Share your culinary creations with the RecipeVibe community
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto py-8 px-4">
        <RecipeForm />
      </div>
    </div>
  )
}
