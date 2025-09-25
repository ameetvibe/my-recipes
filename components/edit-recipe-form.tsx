"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { createClient } from "@/lib/supabase"
import { Loader2, Plus, X, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Ingredient {
  name: string
  amount: string
  unit: string
}

interface Instruction {
  step: number
  instruction: string
}

interface Recipe {
  id: string
  title: string
  description: string | null
  ingredients: any
  instructions: any
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  servings: number | null
  difficulty: "easy" | "medium" | "hard"
  cuisine_type: string | null
  dietary_tags: string[]
  image_urls: string[]
  is_public: boolean
  user_id: string
}

interface EditRecipeFormProps {
  recipe: Recipe
}

export function EditRecipeForm({ recipe }: EditRecipeFormProps) {
  const [formData, setFormData] = useState({
    title: recipe.title,
    description: recipe.description || "",
    prepTime: recipe.prep_time_minutes?.toString() || "",
    cookTime: recipe.cook_time_minutes?.toString() || "",
    servings: recipe.servings?.toString() || "",
    difficulty: recipe.difficulty,
    cuisineType: recipe.cuisine_type || "",
    dietaryTags: recipe.dietary_tags || [],
    isPublic: recipe.is_public,
  })

  const [imageUrls, setImageUrls] = useState<string[]>(recipe.image_urls || [])

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
      return recipe.ingredients
    }
    return [{ name: "", amount: "", unit: "" }]
  })

  const [instructions, setInstructions] = useState<Instruction[]>(() => {
    if (recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0) {
      return recipe.instructions.map((inst: any, index: number) => ({
        step: index + 1,
        instruction: typeof inst === 'string' ? inst : inst.instruction || ""
      }))
    }
    return [{ step: 1, instruction: "" }]
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, [field]: value } : ingredient
    )
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, { step: instructions.length + 1, instruction: "" }])
  }

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updated = instructions.filter((_, i) => i !== index)
        .map((instruction, i) => ({ ...instruction, step: i + 1 }))
      setInstructions(updated)
    }
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = instructions.map((instruction, i) =>
      i === index ? { ...instruction, instruction: value } : instruction
    )
    setInstructions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to edit a recipe")
      }

      // Verify recipe ownership
      if (recipe.user_id !== user.id) {
        throw new Error("You can only edit your own recipes")
      }

      // Filter out empty ingredients and instructions
      const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.amount.trim())
      const validInstructions = instructions.filter(inst => inst.instruction.trim())

      const { data, error } = await supabase
        .from('recipes')
        .update({
          title: formData.title,
          description: formData.description,
          ingredients: validIngredients,
          instructions: validInstructions,
          prep_time_minutes: formData.prepTime ? parseInt(formData.prepTime) : null,
          cook_time_minutes: formData.cookTime ? parseInt(formData.cookTime) : null,
          servings: formData.servings ? parseInt(formData.servings) : null,
          difficulty: formData.difficulty,
          cuisine_type: formData.cuisineType || null,
          dietary_tags: formData.dietaryTags,
          image_urls: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"],
          is_public: formData.isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', recipe.id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Recipe update error:', error.message || error)
        throw new Error(error.message || 'Failed to update recipe')
      }

      toast.success("Recipe updated successfully!")
      router.push("/my-recipes")
      router.refresh()
    } catch (error) {
      console.error('Error updating recipe:', error)
      setError(error instanceof Error ? error.message : "An error occurred")
      toast.error(error instanceof Error ? error.message : "Failed to update recipe")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-recipes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Recipes
            </Link>
          </Button>
        </div>
        <CardTitle className="text-2xl font-bold">Edit Recipe</CardTitle>
        <CardDescription>
          Update your recipe details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Recipe Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter recipe title"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cuisineType" className="text-sm font-medium">
                Cuisine Type
              </label>
              <Input
                id="cuisineType"
                value={formData.cuisineType}
                onChange={(e) => setFormData(prev => ({ ...prev, cuisineType: e.target.value }))}
                placeholder="e.g., Italian, Mexican, Asian"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your recipe..."
              className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Time and Servings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="prepTime" className="text-sm font-medium">
                Prep Time (min)
              </label>
              <Input
                id="prepTime"
                type="number"
                value={formData.prepTime}
                onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                placeholder="15"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cookTime" className="text-sm font-medium">
                Cook Time (min)
              </label>
              <Input
                id="cookTime"
                type="number"
                value={formData.cookTime}
                onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
                placeholder="30"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="servings" className="text-sm font-medium">
                Servings
              </label>
              <Input
                id="servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
                placeholder="4"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as "easy" | "medium" | "hard" }))}
                className="w-full px-3 py-2 border border-input rounded-md"
                disabled={isLoading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              disabled={isLoading}
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm font-medium">
              Make this recipe public
            </label>
          </div>

          {/* Image Upload */}
          <ImageUpload
            onImagesChange={setImageUrls}
            maxImages={5}
            disabled={isLoading}
            initialImages={imageUrls}
          />

          {/* Ingredients */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Ingredients *</label>
              <Button type="button" onClick={addIngredient} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  placeholder="Amount"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, "name", e.target.value)}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  size="sm"
                  variant="outline"
                  disabled={isLoading || ingredients.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Instructions *</label>
              <Button type="button" onClick={addInstruction} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  {instruction.step}
                </div>
                <textarea
                  placeholder="Describe this step..."
                  value={instruction.instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  className="flex-1 min-h-[60px] px-3 py-2 border border-input rounded-md resize-none"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  size="sm"
                  variant="outline"
                  disabled={isLoading || instructions.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Recipe...
                </>
              ) : (
                "Update Recipe"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/my-recipes")}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}