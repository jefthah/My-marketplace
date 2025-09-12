import type React from "react"
import { Github, Linkedin, Mail, Code2, Coffee } from "lucide-react"
import { Link } from "react-router-dom"

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Code2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-white mb-6">Dikembangkan dengan ❤️</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Marketplace design ini dibangun menggunakan teknologi modern seperti React, Node.js, MongoDB, dan TypeScript. 
          Dikembangkan dengan fokus pada user experience dan performance yang optimal.
        </p>
        
        {/* Tech Stack */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">React</span>
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">TypeScript</span>
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">Node.js</span>
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">MongoDB</span>
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">Tailwind CSS</span>
        </div>

        {/* Developer Contact */}
        <div className="flex justify-center space-x-6">
          <Link to="https://github.com/jefthah" target="_blank"className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all transform hover:scale-110">
            <Github className="w-6 h-6 text-white" />
          </Link>
          <Link to="https://www.linkedin.com/in/jefta-supraja-925805286/" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all transform hover:scale-110">
            <Linkedin className="w-6 h-6 text-white" />
          </Link>
          <a href="mailto:jefta.supraja@gmail.com" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all transform hover:scale-110">
            <Mail className="w-6 h-6 text-white" />
          </a>
          <Link to="" title="Buy me some coffee" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-3 rounded-full transition-all transform hover:scale-110">
            <Coffee className="w-6 h-6 text-white" />
          </Link>
        </div>
        
        <div className="mt-6">
          <p className="text-blue-200 text-sm">
            Dibuat dengan semangat dan secangkir kopi ☕
          </p>
        </div>
      </div>
    </section>
  )
}

export default CTASection
