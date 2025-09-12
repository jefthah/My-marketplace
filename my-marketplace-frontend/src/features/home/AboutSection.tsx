"use client"

import type React from "react"
import { Shield, BadgePercent, Zap, Award, CheckCircle, ArrowRight } from "lucide-react"

const AboutSection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "100% Aman",
      description: "Transaksi terjamin dengan sistem pembayaran yang aman dan terpercaya"
    },
    {
      icon: BadgePercent,
      title: "Harga Bersahabat",
      description: "Kualitas bagus tanpa bikin budget jebol."
    },
    {
      icon: Zap,
      title: "Proses Cepat",
      description: "Download instant setelah pembayaran, tidak perlu menunggu"
    },
    {
      icon: Award,
      title: "Kualitas Terjamin",
      description: "Setiap design telah melalui kurasi untuk memastikan kualitas terbaik"
    }
  ]

  const achievements = [
    "Harga ramah kantong, value maksimal",
    "Siap pakai & mudah di-edit untuk disesuaikan dengan gaya brand kamu",
    "Best practice tipografi, spacing, dan sistem warna—enak dilihat & scalable",
    "Dibangun oleh developer—untuk developer: "
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Tentang <span className="text-blue-600">J'DSIGN</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Marketplace template desain terjangkau untuk bangun portofolio developer
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <div>
            <h3 className="text-3xl font-bold text-blue-900 mb-6">
              Misi Kami Adalah Memberdayakan <span className="text-blue-600">Kreativitas</span>
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              J D’SIGN lahir dari pengalaman seorang developer fresh graduate yang butuh portofolio cepat, bagus, dan terjangkau. Di sini kami menyediakan template desain & komponen UI siap pakai—mulai dari landing page, dashboard, hingga section portofolio—yang mudah dikustomisasi, ramah pemula, dan tidak kalah apik dibanding produk premium
            </p>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Tujuan marketplace ini dibuat adalah menjawab kebutuhan nyata developer—berawal dari pengalaman founder J D’SIGN sebagai fresh graduate yang harus menyiapkan portofolio cepat, bagus, dan terjangkau. Kami menghadirkan template desain & komponen UI siap pakai dengan struktur rapi, panduan singkat, serta kompatibel dengan workflow modern (Figma dan implementasi yang nyaman untuk React/Next + Tailwind). Harapannya, kamu bisa lebih cepat publish karya, tampil profesional, dan percaya diri saat melamar kerja atau mulai mengambil klien.
            </p>

            {/* Achievements List */}
            <div className="space-y-3 mb-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{achievement}</span>
                </div>
              ))}
            </div>

            <button className="btn-primary text-white px-8 py-3 rounded-full flex items-center">
              Pelajari Lebih Lanjut
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>

          {/* Right Content - Image/Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600"
                alt="Team collaboration"
                className="rounded-xl shadow-xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">Harga Bersahabat</p>
                    <p className="text-sm text-gray-600">Value maksimal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className="text-center p-6 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-semibold text-blue-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Developer Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Tentang Developer
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Dibangun oleh developer Fresh Graduate yang percaya bahwa setiap ide besar berawal dari langkah kecil. Dengan passion di bidang teknologi, aplikasi ini lahir untuk memberikan pengalaman marketplace yang lebih modern dan mudah digunakan.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.open('https://3d-portfolio-spline.vercel.app/', '_blank')}
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Lihat Portfolio
            </button>
            <button 
              onClick={() => window.open('https://wa.me/6285156924873?text=Halo, saya tertarik dengan layanan development Anda', '_blank')}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Hubungi Developer
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection