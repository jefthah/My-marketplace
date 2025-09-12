/**
 * DigitalCorp - Main JavaScript File
 * Contains all interactive functionality for the website
 */

// === DOM Content Loaded Event ===
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// === Main Initialization Function ===
function initializeWebsite() {
    initNavigation();
    initScrollAnimations();
    initFAQ();
    initContactForm();
    initScrollEffects();
    initCounterAnimations();
    initScrollToTop();
    initPreloader();
    initSearchFunctionality();
    initPerformanceOptimizations();
    
    console.log('🚀 DigitalCorp Website Loaded Successfully!');
}

// === Navigation Functions ===
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    // Mobile Navigation Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// === Scroll Animations ===
function initScrollAnimations() {
    // Reveal animation on scroll
    function reveal() {
        const reveals = document.querySelectorAll('.reveal');
        
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', reveal);
    reveal(); // Call once to check elements in view
}

// === FAQ Functionality ===
function initFAQ() {
    // FAQ Toggle function
    window.toggleFAQ = function(element) {
        const answer = element.nextElementSibling;
        const icon = element.querySelector('.faq-icon');
        
        if (answer.style.maxHeight && answer.style.maxHeight !== '0px') {
            answer.style.maxHeight = '0px';
            icon.textContent = '+';
        } else {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            icon.textContent = '−';
        }
    };
}

// === Contact Form ===
function initContactForm() {
    const contactForm = document.querySelector('form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const phone = formData.get('phone');
            const service = formData.get('service');
            const message = formData.get('message');
            
            // Create WhatsApp message
            const waMessage = `Halo DigitalCorp,%0A%0ASaya ${name} tertarik dengan layanan ${service}.%0A%0ADetail kebutuhan:%0A${encodeURIComponent(message)}%0A%0AMohon dapat dihubungi di nomor ini untuk diskusi lebih lanjut.%0A%0ATerima kasih!`;
            
            // Redirect to WhatsApp
            window.open(`https://wa.me/6281234567890?text=${waMessage}`, '_blank');
            
            // Reset form
            this.reset();
            alert('Terima kasih! Anda akan dialihkan ke WhatsApp untuk melanjutkan diskusi.');
        });
    }
}

// === Scroll Effects ===
function initScrollEffects() {
    // Add scroll effect to navigation
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (nav) {
            if (window.scrollY > 100) {
                nav.style.background = 'rgba(255, 255, 255, 0.95)';
                nav.style.backdropFilter = 'blur(10px)';
            } else {
                nav.style.background = '#fff';
                nav.style.backdropFilter = 'none';
            }
        }
    });

    // Add parallax effect to hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// === Typing Effect ===
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Initialize typing effect
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 50);
    }
});

// === Counter Animations ===
function initCounterAnimations() {
    // Add counter animation
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number, .metric-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
            if (!target) return;
            
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = counter.textContent.replace(/[0-9]+/, target);
                    clearInterval(timer);
                } else {
                    counter.textContent = counter.textContent.replace(/[0-9]+/, Math.floor(current));
                }
            }, 50);
        });
    }

    // Trigger counter animation when elements are visible
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with counters
    document.querySelectorAll('.about-stats, .trust-metrics').forEach(el => {
        if (el) counterObserver.observe(el);
    });
}

// === Hover Effects ===
function initHoverEffects() {
    // Add hover effects to service cards
    document.querySelectorAll('.service-card, .portfolio-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// === Scroll to Top ===
function initScrollToTop() {
    function addScrollToTop() {
        const scrollBtn = document.createElement('div');
        scrollBtn.innerHTML = '↑';
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        `;
        
        document.body.appendChild(scrollBtn);
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'translateY(0)';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.transform = 'translateY(10px)';
            }
        });
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        scrollBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.1)';
            this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        });
        
        scrollBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        });
    }

    addScrollToTop();
}

// === Preloader ===
function initPreloader() {
    function addPreloader() {
        const preloader = document.createElement('div');
        preloader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease-in-out;
        `;
        
        preloader.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">DigitalCorp</div>
                <div style="width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        document.body.appendChild(preloader);
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.remove();
                }, 500);
            }, 1000);
        });
    }

    addPreloader();
}

// === Search Functionality ===
function initSearchFunctionality() {
    function addSearch() {
        const searchBtn = document.createElement('div');
        searchBtn.innerHTML = '🔍';
        searchBtn.style.cssText = `
            position: fixed;
            top: 50%;
            right: 30px;
            width: 50px;
            height: 50px;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(searchBtn);
        
        searchBtn.addEventListener('click', () => {
            const searchTerm = prompt('Cari di website ini:');
            if (searchTerm) {
                // Simple search implementation
                const elements = document.querySelectorAll('h1, h2, h3, p, li');
                let found = false;
                
                elements.forEach(el => {
                    if (el.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.style.background = '#fef3cd';
                        setTimeout(() => {
                            el.style.background = '';
                        }, 3000);
                        found = true;
                        return;
                    }
                });
                
                if (!found) {
                    alert('Tidak ditemukan hasil untuk: ' + searchTerm);
                }
            }
        });
    }

    addSearch();
}

// === Loading Animation ===
function initLoadingAnimation() {
    // Add loading animation
    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });
}

// === Performance Optimizations ===
function initPerformanceOptimizations() {
    // Performance optimization: Lazy loading for images
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// === Cookie Consent (Optional - commented out due to localStorage restrictions) ===
function initCookieConsent() {
    // function addCookieConsent() {
    //     const cookieBanner = document.createElement('div');
    //     cookieBanner.style.cssText = `
    //         position: fixed;
    //         bottom: 0;
    //         left: 0;
    //         right: 0;
    //         background: #1f2937;
    //         color: white;
    //         padding: 1rem 2rem;
    //         display: flex;
    //         justify-content: space-between;
    //         align-items: center;
    //         z-index: 1000;
    //         transform: translateY(100%);
    //         transition: transform 0.3s ease;
    //     `;
        
    //     cookieBanner.innerHTML = `
    //         <div style="flex: 1; margin-right: 2rem;">
    //             <p style="margin: 0; font-size: 0.9rem;">Kami menggunakan cookie untuk meningkatkan pengalaman Anda di website ini. <a href="#" style="color: #60a5fa;">Pelajari lebih lanjut</a></p>
    //         </div>
    //         <div style="display: flex; gap: 1rem;">
    //             <button onclick="acceptCookies()" style="background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Terima</button>
    //             <button onclick="declineCookies()" style="background: transparent; color: white; border: 1px solid #6b7280; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Tolak</button>
    //         </div>
    //     `;
        
    //     document.body.appendChild(cookieBanner);
        
    //     // Show banner after 2 seconds
    //     setTimeout(() => {
    //         cookieBanner.style.transform = 'translateY(0)';
    //     }, 2000);
        
    //     // Global functions for cookie consent
    //     window.acceptCookies = function() {
    //         localStorage.setItem('cookieConsent', 'accepted');
    //         cookieBanner.style.transform = 'translateY(100%)';
    //         setTimeout(() => cookieBanner.remove(), 300);
    //     };
        
    //     window.declineCookies = function() {
    //         localStorage.setItem('cookieConsent', 'declined');
    //         cookieBanner.style.transform = 'translateY(100%)';
    //         setTimeout(() => cookieBanner.remove(), 300);
    //     };
        
    //     // Check if consent already given
    //     if (localStorage.getItem('cookieConsent')) {
    //         cookieBanner.remove();
    //     }
    // }

    // Initialize cookie consent (commented out)
    // addCookieConsent();
}

// === Utility Functions ===

// Debounce function for performance
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize hover effects when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initHoverEffects();
    initLoadingAnimation();
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeWebsite,
        initNavigation,
        initScrollAnimations,
        initFAQ,
        initContactForm,
        debounce,
        throttle
    };
}
