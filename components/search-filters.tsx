"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Search, 
  Filter, 
  X, 
  Clock, 
  ChefHat, 
  Leaf, 
  Globe,
  SlidersHorizontal
} from "lucide-react"

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
  isLoading?: boolean
  initialFilters?: SearchFilters
}

export interface SearchFilters {
  query: string
  cuisine: string[]
  difficulty: string[]
  dietaryTags: string[]
  maxPrepTime: number | null
  maxCookTime: number | null
}

const CUISINE_OPTIONS = [
  "Italian", "Mexican", "Asian", "Indian", "Mediterranean", 
  "American", "French", "Thai", "Chinese", "Japanese", "Korean"
]

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"]

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
  "Nut-Free", "Keto", "Paleo", "Low-Carb", "High-Protein"
]

const TIME_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "Any time", value: null }
]

export function SearchFilters({ onSearch, onClear, isLoading = false, initialFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    query: "",
    cuisine: [],
    difficulty: [],
    dietaryTags: [],
    maxPrepTime: null,
    maxCookTime: null
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters({
      query: "",
      cuisine: [],
      difficulty: [],
      dietaryTags: [],
      maxPrepTime: null,
      maxCookTime: null
    })
    onClear()
  }

  const toggleFilter = (type: keyof SearchFilters, value: string) => {
    if (type === 'query') return
    
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) 
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }))
  }

  const setTimeFilter = (type: 'maxPrepTime' | 'maxCookTime', value: number | null) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const activeFiltersCount = 
    filters.cuisine.length + 
    filters.difficulty.length + 
    filters.dietaryTags.length + 
    (filters.maxPrepTime ? 1 : 0) + 
    (filters.maxCookTime ? 1 : 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Recipes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes, ingredients, or descriptions..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={isLoading} className="flex-1">
              {isLoading ? "Searching..." : "Search"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 border-t pt-6">
            {/* Cuisine Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Cuisine</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((cuisine) => (
                  <Badge
                    key={cuisine}
                    variant={filters.cuisine.includes(cuisine) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => toggleFilter('cuisine', cuisine)}
                  >
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Difficulty</h4>
              </div>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((difficulty) => (
                  <Badge
                    key={difficulty}
                    variant={filters.difficulty.includes(difficulty) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 capitalize"
                    onClick={() => toggleFilter('difficulty', difficulty)}
                  >
                    {difficulty}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dietary Tags Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Dietary Preferences</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((diet) => (
                  <Badge
                    key={diet}
                    variant={filters.dietaryTags.includes(diet) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => toggleFilter('dietaryTags', diet)}
                  >
                    {diet}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Time Filters */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Cooking Time</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Prep Time</label>
                  <div className="flex flex-wrap gap-2">
                    {TIME_OPTIONS.map((time) => (
                      <Badge
                        key={`prep-${time.value}`}
                        variant={filters.maxPrepTime === time.value ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => setTimeFilter('maxPrepTime', time.value)}
                      >
                        {time.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Cook Time</label>
                  <div className="flex flex-wrap gap-2">
                    {TIME_OPTIONS.map((time) => (
                      <Badge
                        key={`cook-${time.value}`}
                        variant={filters.maxCookTime === time.value ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => setTimeFilter('maxCookTime', time.value)}
                      >
                        {time.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleClear} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
