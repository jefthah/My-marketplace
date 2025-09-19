import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Menu, X, Search, User, ShoppingCart, LogOut, Settings } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

interface NavigationProps {
  onCartClick?: () => void
  cartItemCount?: number
}

const Navigation: React.FC<NavigationProps> = ({ onCartClick, cartItemCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLoginClick = () => {
    navigate('/login')
  }

  // Navigation handler - supports both routing and smooth scroll
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    
    // If we're not on homepage, navigate to homepage first
    if (location.pathname !== '/') {
      if (targetId === 'reviews') {
        // Navigate to reviews page
        navigate('/reviews')
      } else {
        // Navigate to homepage and scroll to section
        navigate('/')
        // Small delay to ensure page loads before scrolling
        setTimeout(() => {
          const element = document.getElementById(targetId)
          if (element) {
            const offset = 80
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.scrollY - offset

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth"
            })
          }
        }, 100)
      }
    } else {
      // We're on homepage, handle normally
      if (targetId === 'reviews') {
        // Navigate to reviews page
        navigate('/reviews')
      } else {
        // Smooth scroll to section
        const element = document.getElementById(targetId)
        if (element) {
          const offset = 80
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          })
        }
      }
    }

    // Close mobile menu if open
    setIsMenuOpen(false)
  }

  // Track active section saat scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["kategori-populer", "reviews", "about"]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle click outside user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu])

  const navItems = [
    { id: "our-products", label: "Our Products", targetId: "kategori-populer" },
    { id: "reviews", label: "Reviews", targetId: "reviews" },
    { id: "about", label: "About", targetId: "about" }
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Desktop Menu */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div 
              className="flex items-center space-x-1.5 sm:space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">J</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-blue-900">D'SIGN</span>
            </div>

            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.targetId}`}
                  onClick={(e) => handleNavClick(e, item.targetId)}
                  className={`relative px-2 py-1 text-gray-700 hover:text-blue-600 transition-colors ${
                    activeSection === item.targetId ? "text-blue-600" : ""
                  }`}
                >
                  {item.label}
                  {activeSection === item.targetId && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input type="text" placeholder="Cari design..." className="bg-transparent outline-none text-sm w-32 xl:w-48" />
            </div>

            {/* Mobile Search Button */}
            <button className="lg:hidden p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </button>

            {/* Cart Icon with Badge */}
            <button 
              onClick={() => onCartClick && onCartClick()}
              className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden md:flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {(() => {
                    console.log('🔍 Navigation render check:');
                    console.log('- user.profileImage:', !!user.profileImage);
                    console.log('- user.photoUrl:', !!user.photoUrl);
                    console.log('- photoUrl preview:', user.photoUrl ? user.photoUrl.substring(0, 50) + '...' : 'null');
                    return null;
                  })()}
                  {user.profileImage || user.photoUrl ? (
                    <img 
                      src={user.profileImage || user.photoUrl} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-20 truncate">
                    {user?.name || 'User'}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'No email'}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleLoginClick}
                className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={toggleMenu} className="md:hidden p-1.5 sm:p-2">
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-14 sm:top-16 right-0 w-full bg-white border-t md:hidden mobile-menu shadow-lg ${isMenuOpen ? "active" : ""}`}
      >
        <div className="px-4 py-4">
          {/* Mobile Search */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2.5 mb-4 lg:hidden">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input type="text" placeholder="Cari design..." className="bg-transparent outline-none text-sm flex-1" />
          </div>
          
          {/* Navigation Links */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.targetId}`}
                onClick={(e) => handleNavClick(e, item.targetId)}
                className={`block py-3 px-2 text-gray-700 rounded-lg transition-colors ${
                  activeSection === item.targetId 
                    ? "text-blue-600 font-medium bg-blue-50" 
                    : "hover:bg-gray-50"
                }`}
              >
                {item.label}
              </a>
            ))}
            
            {/* Cart Link */}
            <button 
              onClick={() => {
                if (onCartClick) {
                  onCartClick();
                }
                setIsMenuOpen(false);
              }}
              className="w-full text-left py-3 px-2 text-gray-700 flex items-center justify-between rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>Keranjang</span>
              {cartItemCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-1">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
          {/* User section for mobile */}
          {isAuthenticated && user ? (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center space-x-3 px-3 py-2">
                {user?.profileImage || user?.photoUrl ? (
                  <img 
                    src={user.profileImage || user.photoUrl} 
                    alt={user?.name || 'User'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'No email'}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  navigate('/dashboard');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left py-2 text-gray-700 flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span>Dashboard</span>
              </button>
              <button 
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                  navigate('/');
                }}
                className="w-full text-left py-2 text-gray-700 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLoginClick}
              className="w-full text-left py-2 text-gray-700 flex items-center"
            >
              <User className="w-4 h-4 mr-2" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navigation