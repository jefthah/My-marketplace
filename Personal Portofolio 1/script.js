// GSAP Animations
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Custom Cursor - Enhanced Smooth
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

// Update mouse position
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth cursor animation using GSAP
function animateCursor() {
    // Main cursor follows mouse immediately
    gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: "power2.out"
    });
    
    // Follower has delay and smooth easing
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    
    gsap.set(cursorFollower, {
        x: followerX,
        y: followerY
    });
    
    requestAnimationFrame(animateCursor);
}

// Start cursor animation
animateCursor();

// Cursor hover effect
const hoverElements = document.querySelectorAll('a, button, .skill-tag, .project-card, .service-card');
hoverElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-grow');
        cursorFollower.classList.add('cursor-grow');
    });
    element.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-grow');
        cursorFollower.classList.remove('cursor-grow');
    });
});

// Scroll Progress Bar
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.querySelector('.scroll-progress').style.width = scrollPercent + '%';
});

// Navigation Scroll Effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Hero Animations
const heroTl = gsap.timeline();

// Hero avatar animation
heroTl.from('.hero-avatar', {
    duration: 1,
    scale: 0,
    opacity: 0,
    ease: 'back.out(1.7)'
})
.from('.hero-subtitle', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out'
}, '-=0.5')
.from('.hero-title .title-line', {
    duration: 1,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: 'power3.out'
}, '-=0.3')
.from('.hero-description', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out'
}, '-=0.3')
.from('.hero-stats', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out'
}, '-=0.3')
.from('.hero-cta', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out'
}, '-=0.3')
.from('.hero-social', {
    duration: 1,
    y: 30,
    opacity: 0,
    ease: 'power3.out'
}, '-=0.3');

// Floating Shapes Animation
gsap.to('.shape-1', {
    y: -30,
    x: 30,
    rotation: 45,
    duration: 15,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

gsap.to('.shape-2', {
    y: 30,
    x: -30,
    rotation: -45,
    duration: 20,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

gsap.to('.shape-3', {
    y: -20,
    x: -20,
    rotation: 60,
    duration: 18,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

gsap.to('.shape-4', {
    y: 25,
    x: 25,
    rotation: -30,
    duration: 22,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

gsap.to('.shape-5', {
    y: -15,
    x: 15,
    rotation: 90,
    duration: 16,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

// Parallax Effect
gsap.to('.floating-shapes', {
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
    },
    y: -100
});

// About Section Animation
gsap.from('.about-image', {
    scrollTrigger: {
        trigger: '.about',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    x: -100,
    opacity: 0,
    duration: 1.5,
    ease: 'power3.out'
});

gsap.from('.about-text', {
    scrollTrigger: {
        trigger: '.about',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    x: 100,
    opacity: 0,
    duration: 1.5,
    ease: 'power3.out'
});

gsap.from('.skill-tag', {
    scrollTrigger: {
        trigger: '.skills',
        start: 'top 90%',
        toggleActions: 'play none none reverse'
    },
    scale: 0,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'back.out(1.7)'
});

// Projects Animation
gsap.from('.project-card', {
    scrollTrigger: {
        trigger: '.projects-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    y: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
});

// Services Animation
gsap.from('.service-card', {
    scrollTrigger: {
        trigger: '.services-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.15,
    ease: 'power3.out'
});

// Contact Animation
gsap.from('.contact-item', {
    scrollTrigger: {
        trigger: '.contact-info',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    x: -50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
});

gsap.from('.contact-form', {
    scrollTrigger: {
        trigger: '.contact-form',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    scale: 0.9,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

// Text Animation on Scroll
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        scrollTrigger: {
            trigger: title,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
});

// Smooth Scroll for Navigation Links
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

// Form Submit Handler
document.querySelector('.contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Animate button
    gsap.to('.btn-submit', {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            alert('Message sent successfully!');
            e.target.reset();
        }
    });
});

// Mouse Parallax on Hero Content
document.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    
    gsap.to('.hero-content', {
        rotationY: mouseX * 5,
        rotationX: -mouseY * 5,
        duration: 1,
        ease: 'power2.out',
        transformPerspective: 1000
    });
});

// Magnetic Button Effect
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'elastic.out(1, 0.3)'
        });
    });
});

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Typing effect for role text
    const typingTexts = ['Frontend Developer', 'UI/UX Designer', 'React Developer', 'Creative Coder'];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.querySelector('.typing-text');
    
    function typeEffect() {
        const currentText = typingTexts[textIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            setTimeout(typeEffect, 1500);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % typingTexts.length;
            setTimeout(typeEffect, 200);
        } else {
            setTimeout(typeEffect, isDeleting ? 50 : 100);
        }
    }
    
    // Start typing effect after initial animation
    setTimeout(typeEffect, 2000);
    
    // Download CV functionality
    const downloadCVBtn = document.getElementById('downloadCV');
    if (downloadCVBtn) {
        downloadCVBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Animate button
            gsap.to(downloadCVBtn, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    // Create a dummy CV download (you can replace this with actual CV file)
                    const cvContent = `
Alex Johnson - Creative Designer & Developer
=====================================

Contact Information:
Email: alex.johnson@email.com
Phone: +1 (555) 123-4567
Location: San Francisco, CA
Portfolio: www.alexjohnson.dev

Professional Summary:
Creative and detail-oriented Frontend Developer with 6+ years of experience in designing and developing user-centered digital solutions. Passionate about creating exceptional user experiences through innovative design and clean, efficient code.

Technical Skills:
- Frontend: React, JavaScript, TypeScript, HTML5, CSS3, Next.js
- Design: Figma, Adobe Creative Suite, Sketch, Prototyping
- Backend: Node.js, Express, MongoDB, PostgreSQL
- Tools: Git, GSAP, Webpack, Responsive Design

Experience:
Senior Frontend Developer | TechCorp | 2021-Present
- Led development of 15+ responsive web applications
- Improved user engagement by 40% through UI/UX redesigns
- Mentored junior developers and established coding standards

UI/UX Designer | CreativeStudio | 2019-2021
- Designed user interfaces for 20+ mobile and web applications
- Conducted user research and usability testing
- Collaborated with cross-functional teams on product strategy

Education:
Bachelor of Computer Science | University of Technology | 2018

Projects:
- TaskFlow: Project management platform with real-time collaboration
- EcoShop: Sustainable e-commerce platform with carbon tracking
- MindfulSpace: Wellness application with meditation features

Languages:
English (Native), Spanish (Conversational)
                    `;
                    
                    const blob = new Blob([cvContent], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'Alex_Johnson_CV.txt';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    // Show success message
                    showNotification('CV Downloaded Successfully! 📄', 'success');
                }
            });
        });
    }
    
    // Number counter animation for stats
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        gsap.to(stat, {
            scrollTrigger: {
                trigger: stat,
                start: 'top 80%',
            },
            innerHTML: target,
            duration: 2,
            ease: 'power2.out',
            snap: { innerHTML: 1 },
            onUpdate: function() {
                stat.innerHTML = Math.ceil(stat.innerHTML);
            }
        });
    });
    
    // Add interactive hover effects for hero elements
    const avatar = document.querySelector('.hero-avatar');
    if (avatar) {
        avatar.addEventListener('mouseenter', () => {
            gsap.to('.avatar-img', {
                scale: 1.1,
                duration: 0.3,
                ease: 'power2.out'
            });
            gsap.to('.avatar-ring', {
                scale: 1.1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        avatar.addEventListener('mouseleave', () => {
            gsap.to('.avatar-img', {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
            gsap.to('.avatar-ring', {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    }
    
    // Social icons hover effects
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            gsap.to(icon, {
                y: -5,
                scale: 1.1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        icon.addEventListener('mouseleave', () => {
            gsap.to(icon, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
    
    // Tech items hover effects
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                y: -5,
                scale: 1.1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
    
    // Specialization items hover effects
    const specItems = document.querySelectorAll('.spec-item');
    specItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                y: -5,
                scale: 1.05,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
});

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            margin-left: 10px;
        `;
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Mobile Navigation with GSAP Animations
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const mobileOverlay = document.getElementById('mobile-overlay');
const navLinks = document.querySelectorAll('.nav-link');

console.log('Mobile nav elements:', { hamburger, navMenu, mobileOverlay, navLinks });

let isMenuOpen = false;

// Mobile menu toggle function
function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
        openMobileMenu();
    } else {
        closeMobileMenu();
    }
}

// Open mobile menu with GSAP animations
function openMobileMenu() {
    hamburger.classList.add('active');
    navMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    
    // GSAP Timeline for opening animation
    const tl = gsap.timeline();
    
    // Animate menu slide in
    tl.set(navMenu, { x: '100%' })
      .to(navMenu, {
          x: '0%',
          duration: 0.4,
          ease: "back.out(1.7)"
      })
      // Animate overlay fade in
      .to(mobileOverlay, {
          opacity: 1,
          duration: 0.3
      }, "-=0.2")
      // Animate menu items with stagger
      .fromTo(navLinks, {
          x: 50,
          opacity: 0
      }, {
          x: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.1,
          ease: "power2.out"
      }, "-=0.1");
}

// Close mobile menu with GSAP animations
function closeMobileMenu() {
    hamburger.classList.remove('active');
    
    // GSAP Timeline for closing animation
    const tl = gsap.timeline({
        onComplete: () => {
            navMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
        }
    });
    
    // Animate menu items out
    tl.to(navLinks, {
        x: 50,
        opacity: 0,
        duration: 0.2,
        stagger: 0.05,
        ease: "power2.in"
    })
    // Animate overlay fade out
    .to(mobileOverlay, {
        opacity: 0,
        duration: 0.2
    }, "-=0.1")
    // Animate menu slide out
    .to(navMenu, {
        x: '100%',
        duration: 0.3,
        ease: "back.in(1.7)"
    }, "-=0.1");
}

// Event listeners
hamburger.addEventListener('click', toggleMobileMenu);
mobileOverlay.addEventListener('click', closeMobileMenu);

// Close menu when clicking nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (isMenuOpen) {
            closeMobileMenu();
            isMenuOpen = false;
        }
    });
});

// Close menu on window resize if open
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.innerWidth > 768 && isMenuOpen) {
            closeMobileMenu();
            isMenuOpen = false;
        }
        
        // Refresh ScrollTrigger on resize
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }, 250);
});

// Enhanced mobile animations for responsive design
window.addEventListener('DOMContentLoaded', () => {
    // Wait for GSAP to load
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Responsive animations based on screen size
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 992 && window.innerWidth > 768;
        
        if (isMobile) {
            // Mobile-specific animations
            gsap.fromTo('.service-card', {
                y: 50,
                opacity: 0,
                scale: 0.9
            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                stagger: 0.2,
                ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
            
            // Mobile project cards animation
            gsap.fromTo('.project-card', {
                y: 30,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.projects-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        } else if (isTablet) {
            // Tablet-specific animations
            gsap.fromTo('.service-card', {
                y: 40,
                opacity: 0,
                scale: 0.95
            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.5,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            });
        } else {
            // Desktop animations
            gsap.fromTo('.service-card', {
                y: 30,
                opacity: 0,
                scale: 0.98
            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.4,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: '.services-grid',
                    start: 'top 70%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }
});
