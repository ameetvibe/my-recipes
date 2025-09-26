import { HeroSection } from "@/components/hero-section"
import { FeaturedRecipes } from "@/components/featured-recipes"

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fun floating elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full blur-sm opacity-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-gradient-to-br from-pink-300 to-red-300 rounded-full blur-sm opacity-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute top-60 left-1/4 w-6 h-6 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full blur-sm opacity-20 animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-40 right-10 w-10 h-10 bg-gradient-to-br from-green-300 to-teal-300 rounded-full blur-sm opacity-20 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-7 h-7 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full blur-sm opacity-20 animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}></div>
      </div>

      <div className="relative z-10">
        <HeroSection />
        <FeaturedRecipes />
      </div>
    </div>
  )
}
