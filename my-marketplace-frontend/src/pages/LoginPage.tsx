import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Lock, Mail, User, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { gsap } from 'gsap';

interface FormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement[]>([]);

  // GSAP Animations
  useEffect(() => {
    const tl = gsap.timeline();

    // Initial setup - hide elements
    gsap.set([containerRef.current, formRef.current], { opacity: 0, y: 30 });
    gsap.set(heroRef.current, { opacity: 0, x: -50 });
    gsap.set('.floating-element', { opacity: 0, scale: 0 });

    // Main entrance animation
    tl.to(containerRef.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power3.out"
    })
    .to(heroRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.5")
    .to(formRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.4")
    .to('.floating-element', {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.7)"
    }, "-=0.3");

    // Floating animation for background elements
    gsap.to('.floating-element', {
      y: '+=20',
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
      stagger: 0.2
    });

    // Form field focus animations
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        gsap.to(input, { scale: 1.02, duration: 0.2, ease: "power2.out" });
      });
      input.addEventListener('blur', () => {
        gsap.to(input, { scale: 1, duration: 0.2, ease: "power2.out" });
      });
    });

    return () => {
      tl.kill();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Loading animation
    gsap.to('.submit-btn', { scale: 0.95, duration: 0.1 });

    try {
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      const response = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        const userData = {
          id: data.data.user.id,
          name: data.data.user.username,
          email: data.data.user.email,
          role: data.data.user.role,
          photoUrl: data.data.user.photoUrl
        };
        
        login(userData, data.data.token);
        
        // Success animation
        gsap.to('.submit-btn', { 
          backgroundColor: '#10B981', 
          duration: 0.3,
          onComplete: () => {
            navigate('/');
          }
        });
      } else {
        setError(data.message || 'Login failed');
        // Error shake animation
        gsap.fromTo(formRef.current, 
          { x: 0 },
          { 
            x: 10,
            duration: 0.1,
            repeat: 5,
            yoyo: true,
            ease: "power2.out"
          }
        );
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
      gsap.fromTo(formRef.current,
        { x: 0 },
        {
          x: 10,
          duration: 0.1,
          repeat: 5,
          yoyo: true,
          ease: "power2.out"
        }
      );
    } finally {
      setIsLoading(false);
      gsap.to('.submit-btn', { scale: 1, duration: 0.2 });
    }
  };

  const addToFloatingRefs = (el: HTMLDivElement) => {
    if (el && !floatingElementsRef.current.includes(el)) {
      floatingElementsRef.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div ref={addToFloatingRefs} className="floating-element absolute top-20 left-10 w-20 h-20 bg-blue-100/50 rounded-full blur-xl"></div>
        <div ref={addToFloatingRefs} className="floating-element absolute top-40 right-20 w-32 h-32 bg-indigo-100/60 rounded-full blur-2xl"></div>
        <div ref={addToFloatingRefs} className="floating-element absolute bottom-20 left-20 w-24 h-24 bg-purple-100/50 rounded-full blur-xl"></div>
        <div ref={addToFloatingRefs} className="floating-element absolute bottom-40 right-10 w-16 h-16 bg-pink-100/60 rounded-full blur-lg"></div>
        <div ref={addToFloatingRefs} className="floating-element absolute top-1/2 left-1/4 w-8 h-8 bg-blue-200/70 rounded-full"></div>
        <div ref={addToFloatingRefs} className="floating-element absolute top-1/3 right-1/3 w-6 h-6 bg-indigo-200/80 rounded-full"></div>
      </div>

      <div ref={containerRef} className="flex min-h-screen items-center max-w-6xl mx-auto px-4">
        {/* Left Side - Hero Section */}
        <div ref={heroRef} className="hidden lg:flex lg:w-1/2 flex-col justify-center pr-8 relative">
          <div className="max-w-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">JD'SIGN</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
              Welcome to the Future of 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Design</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Discover thousands of premium designs, templates, and creative assets. 
              Join our community of designers and bring your vision to life.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span>100% Secure & Trusted Platform</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Instant Download Access</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <User className="w-5 h-5 text-blue-500" />
                <span>Premium Design Community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center pl-8">
          <div className="max-w-md w-full">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">JD'SIGN</span>
              </div>
            </div>

            {/* Form Container */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-gray-200/50">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Sign in to your account</h2>
                <p className="text-gray-600">Welcome back to JD'SIGN Marketplace</p>
              </div>

              <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="email"
                      type="email"
                      required
                      className="form-input w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="form-input w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-blue-500 hover:text-blue-600 transition-colors">
                    Forgot your password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-btn w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>

                {/* Register Link */}
                <div className="text-center pt-2">
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/signup')}
                      className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
