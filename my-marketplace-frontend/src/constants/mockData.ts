import type { Design, Category } from "../types"

export const designs: Design[] = [
  {
    id: 2,
    title: "Creative Logo Pack",
    price: "Rp 890.000",
    rating: 4.9,
    views: 3400,
    category: "logo",
    image: "https://via.placeholder.com/300x200/1E40AF/ffffff?text=Logo+Design",
    description: "Koleksi 50+ logo design berkualitas tinggi dengan berbagai style. Termasuk file vector dan berbagai format untuk kebutuhan branding.",
    features: [
      "50+ Unique Logo Designs",
      "Vector Files (AI, EPS, SVG)",
      "High Resolution PNG",
      "Color & Monochrome Versions",
      "Commercial License",
      "Font Information"
    ],
    preview: [
      "https://via.placeholder.com/800x600/1E40AF/ffffff?text=Logo+Pack+1",
      "https://via.placeholder.com/800x600/3730A3/ffffff?text=Logo+Pack+2",
      "https://via.placeholder.com/800x600/6366F1/ffffff?text=Logo+Pack+3"
    ],
    author: "Creative Minds Co",
    downloadCount: 3380,
    tags: ["logo", "branding", "vector", "creative"]
  },
  {
    id: 3,
    title: "Personal Portfolio Dark",
    price: "Rp 650.000",
    rating: 4.7,
    views: 2100,
    category: "portfolio",
    image: "https://via.placeholder.com/300x200/60A5FA/ffffff?text=Portfolio",
    description: "Template portfolio personal dengan tema dark yang elegan. Perfect untuk developer, designer, atau creative professional.",
    features: [
      "Dark Theme Design",
      "Animated Interactions",
      "Project Showcase",
      "Contact Form",
      "Mobile Optimized",
      "Easy Customization"
    ],
    preview: [
      "https://via.placeholder.com/800x600/60A5FA/ffffff?text=Portfolio+Dark+1",
      "https://via.placeholder.com/800x600/1E293B/ffffff?text=Portfolio+Dark+2",
      "https://via.placeholder.com/800x600/0F172A/ffffff?text=Portfolio+Dark+3"
    ],
    author: "UI Designer X",
    downloadCount: 2080,
    tags: ["portfolio", "dark", "personal", "developer"]
  },
  {
    id: 4,
    title: "Business Landing Page",
    price: "Rp 1.200.000",
    rating: 5.0,
    views: 5600,
    category: "landing",
    image: "https://via.placeholder.com/800x600/3B82F6/ffffff?text=Business+Landing",
    description: "Professional business landing page template dengan conversion-focused design. Ideal untuk corporate, consulting, dan enterprise.",
    features: [
      "Conversion Optimized",
      "Professional Design",
      "Multiple Page Layouts",
      "Business Components",
      "Analytics Ready",
      "A/B Testing Friendly"
    ],
    preview: [
      "https://via.placeholder.com/800x600/3B82F6/ffffff?text=Business+1",
      "https://via.placeholder.com/800x600/1E40AF/ffffff?text=Business+2",
      "https://via.placeholder.com/800x600/1D4ED8/ffffff?text=Business+3"
    ],
    author: "Corporate Designs",
    downloadCount: 5520,
    tags: ["business", "corporate", "landing", "professional"]
  },
  {
    id: 5,
    title: "Minimalist Logo Design",
    price: "Rp 350.000",
    rating: 4.6,
    views: 890,
    category: "logo",
    image: "https://via.placeholder.com/300x200/1E40AF/ffffff?text=Minimal+Logo",
    description: "Set logo minimalist yang clean dan timeless. Cocok untuk brand modern yang mengutamakan simplicity dan elegance.",
    features: [
      "Minimalist Style",
      "Scalable Vector",
      "Multiple Formats",
      "Brand Guidelines",
      "Color Variations",
      "Usage Examples"
    ],
    preview: [
      "https://via.placeholder.com/800x600/1E40AF/ffffff?text=Minimal+1",
      "https://via.placeholder.com/800x600/3730A3/ffffff?text=Minimal+2",
      "https://via.placeholder.com/800x600/4F46E5/ffffff?text=Minimal+3"
    ],
    author: "Minimal Studio",
    downloadCount: 875,
    tags: ["logo", "minimal", "clean", "modern"]
  },
  {
    id: 6,
    title: "Developer Portfolio",
    price: "Rp 750.000",
    rating: 4.9,
    views: 4200,
    category: "portfolio",
    image: "https://via.placeholder.com/300x200/60A5FA/ffffff?text=Dev+Portfolio",
    description: "Portfolio template khusus untuk developer dengan showcase project, skills, dan experience. Dilengkapi dengan interactive elements.",
    features: [
      "Code Showcase",
      "Skills Visualization",
      "Project Gallery",
      "Resume Section",
      "GitHub Integration",
      "Tech Stack Display"
    ],
    preview: [
      "https://via.placeholder.com/800x600/60A5FA/ffffff?text=Dev+Portfolio+1",
      "https://via.placeholder.com/800x600/3B82F6/ffffff?text=Dev+Portfolio+2",
      "https://via.placeholder.com/800x600/1E40AF/ffffff?text=Dev+Portfolio+3"
    ],
    author: "Dev Community",
    downloadCount: 4150,
    tags: ["portfolio", "developer", "coding", "showcase"]
  },
  {
    id: 7,
    title: "E-commerce Landing Page",
    price: "Rp 950.000",
    rating: 4.8,
    views: 3200,
    category: "landing",
    image: "https://via.placeholder.com/300x200/059669/ffffff?text=E-commerce+Landing",
    description: "Template landing page khusus untuk toko online dengan fitur lengkap dan design yang conversion-optimized.",
    features: [
      "Product Showcase",
      "Shopping Cart Integration",
      "Payment Gateway Ready",
      "Mobile Commerce",
      "SEO Optimized",
      "Analytics Integration"
    ],
    preview: [
      "https://via.placeholder.com/800x600/059669/ffffff?text=Ecommerce+1",
      "https://via.placeholder.com/800x600/047857/ffffff?text=Ecommerce+2",
      "https://via.placeholder.com/800x600/065F46/ffffff?text=Ecommerce+3"
    ],
    author: "Commerce Studios",
    downloadCount: 3150,
    tags: ["landing", "ecommerce", "shop", "conversion"]
  },
  {
    id: 9,
    title: "Creative Portfolio Light",
    price: "Rp 550.000",
    rating: 4.6,
    views: 1800,
    category: "portfolio",
    image: "https://via.placeholder.com/300x200/F59E0B/ffffff?text=Creative+Portfolio",
    description: "Template portfolio dengan tema light dan colorful, perfect untuk creative artist dan designer.",
    features: [
      "Light & Colorful Theme",
      "Gallery Showcase",
      "About Me Section",
      "Skills Display",
      "Contact Integration",
      "Social Media Links"
    ],
    preview: [
      "https://via.placeholder.com/800x600/F59E0B/ffffff?text=Creative+1",
      "https://via.placeholder.com/800x600/FBBF24/ffffff?text=Creative+2",
      "https://via.placeholder.com/800x600/FCD34D/ffffff?text=Creative+3"
    ],
    author: "Bright Designs",
    downloadCount: 1750,
    tags: ["portfolio", "creative", "colorful", "artist"]
  },
  {
    id: 10,
    title: "SaaS Landing Template",
    price: "Rp 1.100.000",
    rating: 4.9,
    views: 4500,
    category: "landing",
    image: "https://via.placeholder.com/300x200/DC2626/ffffff?text=SaaS+Landing",
    description: "Template landing page premium untuk aplikasi SaaS dengan fokus pada conversion dan user acquisition.",
    features: [
      "SaaS-focused Design",
      "Pricing Tables",
      "Feature Comparison",
      "Testimonials Section",
      "Demo Integration",
      "Lead Generation Forms"
    ],
    preview: [
      "https://via.placeholder.com/800x600/DC2626/ffffff?text=SaaS+1",
      "https://via.placeholder.com/800x600/B91C1C/ffffff?text=SaaS+2",
      "https://via.placeholder.com/800x600/991B1B/ffffff?text=SaaS+3"
    ],
    author: "SaaS Design Pro",
    downloadCount: 4400,
    tags: ["landing", "saas", "software", "subscription"]
  },
  {
    id: 11,
    title: "Restaurant Website Kit",
    price: "Rp 850.000",
    rating: 4.7,
    views: 2200,
    category: "web",
    image: "https://via.placeholder.com/300x200/92400E/ffffff?text=Restaurant+Web",
    description: "Template website lengkap untuk restoran dengan menu online, reservasi, dan food gallery.",
    features: [
      "Menu Management",
      "Online Reservation",
      "Food Gallery",
      "Location Maps",
      "Customer Reviews",
      "Social Integration"
    ],
    preview: [
      "https://via.placeholder.com/800x600/92400E/ffffff?text=Restaurant+1",
      "https://via.placeholder.com/800x600/A16207/ffffff?text=Restaurant+2",
      "https://via.placeholder.com/800x600/B45309/ffffff?text=Restaurant+3"
    ],
    author: "Food Web Studios",
    downloadCount: 2150,
    tags: ["web", "restaurant", "food", "menu"]
  },
  {
    id: 12,
    title: "Corporate Branding Package",
    price: "Rp 1.500.000",
    rating: 5.0,
    views: 3800,
    category: "business",
    image: "https://via.placeholder.com/300x200/1F2937/ffffff?text=Corporate+Brand",
    description: "Paket branding lengkap untuk perusahaan corporate dengan logo, stationery, dan brand guidelines.",
    features: [
      "Complete Brand Identity",
      "Logo Design System",
      "Business Stationery",
      "Presentation Templates",
      "Brand Guidelines",
      "Digital Assets"
    ],
    preview: [
      "https://via.placeholder.com/800x600/1F2937/ffffff?text=Corporate+1",
      "https://via.placeholder.com/800x600/374151/ffffff?text=Corporate+2",
      "https://via.placeholder.com/800x600/4B5563/ffffff?text=Corporate+3"
    ],
    author: "Corporate Design Co",
    downloadCount: 3750,
    tags: ["business", "corporate", "branding", "identity"]
  }
]

export const categories: Category[] = [
  { id: "all", name: "Semua Design", icon: "🎨" },
  { id: "landing", name: "Landing Page", icon: "🚀" },
  { id: "portfolio", name: "Personal Portfolio", icon: "👤" },
  { id: "logo", name: "Design Logo", icon: "💎" },
  { id: "web", name: "Web Design", icon: "🖥️" },
  { id: "business", name: "Business Template", icon: "💼" },
  { id: "creative", name: "Creative Design", icon: "✨" },
]