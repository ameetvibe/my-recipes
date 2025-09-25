import { notFound } from 'next/navigation'
import { CategoryRecipes } from "@/components/category-recipes"

const CUISINE_CATEGORIES = {
  'italian': { name: 'Italian', description: 'Classic pasta, pizza, and Mediterranean flavors' },
  'mexican': { name: 'Mexican', description: 'Spicy and vibrant dishes with bold flavors' },
  'asian': { name: 'Asian', description: 'Fresh ingredients and aromatic spices from Asia' },
  'american': { name: 'American', description: 'Comfort food classics and BBQ favorites' },
  'mediterranean': { name: 'Mediterranean', description: 'Healthy and flavorful dishes from the Mediterranean' },
  'indian': { name: 'Indian', description: 'Rich curries and aromatic spices' },
  'french': { name: 'French', description: 'Elegant cuisine with refined techniques' },
  'chinese': { name: 'Chinese', description: 'Traditional stir-fries, dumplings, and noodles' },
  'thai': { name: 'Thai', description: 'Sweet, sour, and spicy flavors in perfect balance' },
  'japanese': { name: 'Japanese', description: 'Fresh sushi, ramen, and umami-rich dishes' },
  'greek': { name: 'Greek', description: 'Mediterranean classics with olive oil and herbs' },
  'spanish': { name: 'Spanish', description: 'Paella, tapas, and flavorful regional dishes' },
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = CUISINE_CATEGORIES[slug as keyof typeof CUISINE_CATEGORIES]

  if (!category) {
    return {
      title: 'Category Not Found | RecipeVibe',
    }
  }

  return {
    title: `${category.name} Recipes | RecipeVibe`,
    description: `Discover authentic ${category.name.toLowerCase()} recipes. ${category.description}.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = CUISINE_CATEGORIES[slug as keyof typeof CUISINE_CATEGORIES]

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{category.name} Recipes</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {category.description}
          </p>
        </div>
        <CategoryRecipes categoryName={category.name} />
      </div>
    </div>
  )
}