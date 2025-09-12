import type React from "react"
import { Mail, Phone, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-2xl">J</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">D'SIGN</span>
                <p className="text-blue-600 text-sm font-medium">Marketplace</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-8 max-w-md">
              Marketplace design terpercaya untuk semua kebutuhan kreatif Anda.
              Temukan desain terbaik dari desainer profesional.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm">jdsign28@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm">+62 813-1771-6616</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm">Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="font-semibold text-lg mb-6 text-gray-900">Legal</h4>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; 2025 J D'SIGN Marketplace. All rights reserved.
          </p>
          <div className="text-xs text-gray-400">
            Dibuat dengan <span className="text-red-500">❤️</span> dan secangkir kopi ☕
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
