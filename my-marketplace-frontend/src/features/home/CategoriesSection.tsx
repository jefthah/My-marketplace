"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { categories } from "../../constants"
import type { Category } from "../../types"

interface CategoriesSectionProps {
  selectedCategory: string
  onCategorySelect: (categoryId: string) => void
  onCategoryPageSelect?: (categoryId: string) => void
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ selectedCategory, onCategorySelect, onCategoryPageSelect }) => {
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (categoriesRef.current) {
      const buttons = categoriesRef.current.querySelectorAll(".category-btn")
      gsap.fromTo(
        buttons,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.5 },
      )
    }
  }, [])

  return (
    <section id="kategori-populer" className="py-8 sm:py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-6 sm:mb-8 text-center">Kategori Populer</h2>
        <div ref={categoriesRef} className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center gap-3 sm:gap-4">
          {categories.map((cat: Category) => (
            <div key={cat.id} className="category-btn flex flex-col items-center">
              <button
                onClick={() => onCategorySelect(cat.id)}
                className={`w-full sm:w-auto px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-full flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 mb-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                  selectedCategory === cat.id 
                    ? "bg-blue-600 text-white transform scale-105" 
                    : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <span className="text-lg sm:text-xl">{cat.icon}</span>
                <span className="font-medium text-xs sm:text-sm md:text-base leading-tight text-center sm:text-left">
                  {cat.name}
                </span>
              </button>
              {cat.id !== "all" && (
                <button
                  onClick={() => onCategoryPageSelect && onCategoryPageSelect(cat.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors hidden sm:block"
                >
                  Lihat Semua →
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile "Lihat Semua" Section */}
        <div className="mt-6 sm:hidden">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.filter(cat => cat.id !== "all").map((cat: Category) => (
              <button
                key={`mobile-${cat.id}`}
                onClick={() => onCategoryPageSelect && onCategoryPageSelect(cat.id)}
                className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Semua {cat.name} →
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
