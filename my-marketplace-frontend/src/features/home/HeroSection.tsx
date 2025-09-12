"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { ArrowRight, ChevronDown, Palette, Zap, Star, Code } from "lucide-react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const floatingElementsRef = useRef<HTMLDivElement>(null)
  const backgroundShapesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll(".hero-text > *")
      gsap.fromTo(elements, 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
      )
    }

    // Floating elements animation
    if (floatingElementsRef.current) {
      const floatingItems = floatingElementsRef.current.querySelectorAll(".floating-item")
      
      floatingItems.forEach((item, index) => {
        gsap.to(item, {
          y: "random(-20, 20)",
          rotation: "random(-15, 15)",
          duration: 3 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
          delay: index * 0.2
        })
      })
    }

    // Background shapes animation
    if (backgroundShapesRef.current) {
      const shapes = backgroundShapesRef.current.querySelectorAll(".bg-shape")
      
      shapes.forEach((shape, index) => {
        gsap.to(shape, {
          rotation: 360,
          duration: 20 + index * 5,
          repeat: -1,
          ease: "none"
        })
      })
    }

    // Scroll-triggered animations
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        
        // Parallax effect for background shapes
        if (backgroundShapesRef.current) {
          gsap.to(backgroundShapesRef.current, {
            y: progress * 100,
            opacity: 1 - progress * 0.5,
            duration: 0.3
          })
        }
        
        // Floating elements scroll effect
        if (floatingElementsRef.current) {
          gsap.to(floatingElementsRef.current, {
            y: progress * 150,
            opacity: 1 - progress * 0.8,
            duration: 0.3
          })
        }
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const scrollToNextSection = () => {
    const nextSection = document.querySelector('#kategori-populer') as HTMLElement
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Fallback: scroll down by viewport height
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
    }
  }

  return (
    <section className="hero-gradient min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decorative Shapes */}
      <div ref={backgroundShapesRef} className="absolute inset-0 pointer-events-none">
        <div className="bg-shape absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-60"></div>
        <div className="bg-shape absolute top-40 right-20 w-16 h-16 bg-purple-100 rounded-lg opacity-50 transform rotate-45"></div>
        <div className="bg-shape absolute bottom-40 left-20 w-24 h-24 bg-pink-100 rounded-full opacity-40"></div>
        <div className="bg-shape absolute top-60 left-1/4 w-12 h-12 bg-yellow-100 rounded-lg opacity-60 transform rotate-12"></div>
        <div className="bg-shape absolute bottom-60 right-1/4 w-18 h-18 bg-green-100 rounded-full opacity-50"></div>
        <div className="bg-shape absolute top-32 right-1/3 w-14 h-14 bg-indigo-100 rounded-lg opacity-45 transform -rotate-12"></div>
      </div>

      {/* Floating Design Elements */}
      <div ref={floatingElementsRef} className="absolute inset-0 pointer-events-none">
        <div className="floating-item absolute top-24 left-16 p-3 bg-white rounded-full shadow-lg opacity-80">
          <Palette className="w-6 h-6 text-blue-500" />
        </div>
        <div className="floating-item absolute top-36 right-24 p-3 bg-white rounded-full shadow-lg opacity-80">
          <Code className="w-6 h-6 text-purple-500" />
        </div>
        <div className="floating-item absolute bottom-48 left-24 p-3 bg-white rounded-full shadow-lg opacity-80">
          <Zap className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="floating-item absolute bottom-36 right-16 p-3 bg-white rounded-full shadow-lg opacity-80">
          <Star className="w-6 h-6 text-pink-500" />
        </div>
        <div className="floating-item absolute top-48 left-1/3 p-3 bg-white rounded-full shadow-lg opacity-80">
          <Palette className="w-6 h-6 text-green-500" />
        </div>
        <div className="floating-item absolute bottom-56 right-1/3 p-3 bg-white rounded-full shadow-lg opacity-80">
          <Code className="w-6 h-6 text-indigo-500" />
        </div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-12 gap-4 h-full p-8">
          {Array.from({ length: 96 }, (_, i) => (
            <div key={i} className="bg-blue-600 rounded-sm animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 flex-1 flex items-center justify-center relative z-10">
        <div ref={heroRef} className="hero-text text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
            Temukan Design <span className="text-blue-600">Profesional</span> untuk Bisnis Anda
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Marketplace design terbaru dengan koleksi template pilihan yang terus bertambah.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="btn-primary text-white px-8 py-3 rounded-full flex items-center justify-center transform hover:scale-105 transition-all duration-300">
              Mulai Belanja
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
              Jual Design Anda
            </button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Scroll Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer hover:scale-110 transition-transform group"
        onClick={scrollToNextSection}
      >
        <div className="flex flex-col items-center text-blue-600">
          <span className="text-sm mb-2 group-hover:text-blue-800 transition-colors">Scroll untuk melihat produk</span>
          <div className="relative">
            <ChevronDown className="w-6 h-6 group-hover:animate-pulse" />
            <div className="absolute inset-0 bg-blue-200 rounded-full scale-150 opacity-0 group-hover:opacity-30 transition-opacity"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
