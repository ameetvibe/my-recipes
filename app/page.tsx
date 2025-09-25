import { HeroSection } from "@/components/hero-section"
import { FeaturedRecipes } from "@/components/featured-recipes"

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedRecipes />
    </div>
  )
}
