"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { createClient } from "@/lib/supabase"
import { Loader2, Plus, X } from "lucide-react"

interface Ingredient {
  name: string
  amount: string
  unit: string
}

interface Instruction {
  step: number
  instruction: string
}

export function RecipeForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    cuisineType: "",
    dietaryTags: [] as string[],
  })
  
  const [imageUrls, setImageUrls] = useState<string[]>([])
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "" }
  ])
  
  const [instructions, setInstructions] = useState<Instruction[]>([
    { step: 1, instruction: "" }
  ])
  
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
        throw new Error("You must be logged in to create a recipe")
      }

      // Filter out empty ingredients and instructions
      const validIngredients = ingredients.filter(ing => ing.name.trim() && ing.amount.trim())
      const validInstructions = instructions.filter(inst => inst.instruction.trim())

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
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
          image_urls: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"], // Use uploaded images or default
          is_public: true
        })
        .select()

      if (error) {
        throw error
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        prepTime: "",
        cookTime: "",
        servings: "",
        difficulty: "easy",
        cuisineType: "",
        dietaryTags: [],
      })
      setImageUrls([])
      setIngredients([{ name: "", amount: "", unit: "" }])
      setInstructions([{ step: 1, instruction: "" }])

      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Share Your Recipe</CardTitle>
        <CardDescription>
          Create and share your favorite recipe with the RecipeVibe community
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

          {/* Image Upload */}
          <ImageUpload
            onImagesChange={setImageUrls}
            maxImages={5}
            disabled={isLoading}
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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Recipe...
              </>
            ) : (
              "Share Recipe"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
