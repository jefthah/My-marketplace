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
    <section id="kategori-populer" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Kategori Populer</h2>
        <div ref={categoriesRef} className="flex flex-wrap justify-center gap-4">
          {categories.map((cat: Category) => (
            <div key={cat.id} className="category-btn flex flex-col items-center">
              <button
                onClick={() => onCategorySelect(cat.id)}
                className={`px-6 py-3 rounded-full flex items-center space-x-2 mb-2 transition-colors ${
                  selectedCategory === cat.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="font-medium">{cat.name}</span>
              </button>
              {cat.id !== "all" && (
                <button
                  onClick={() => onCategoryPageSelect && onCategoryPageSelect(cat.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Lihat Semua →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
