import { CategoriesGrid } from "@/components/categories-grid"

export const metadata = {
  title: 'Recipe Categories | RecipeVibe',
  description: 'Explore recipes by cuisine type. Discover Italian, Mexican, Asian, American, Mediterranean and many more delicious cuisines.',
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Recipe Categories</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our diverse collection of recipes organized by cuisine type.
            From traditional Italian pasta to spicy Mexican dishes, find your next favorite meal.
          </p>
        </div>
        <CategoriesGrid />
      </div>
    </div>
  )
}