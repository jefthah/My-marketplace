// Portfolio Website JavaScript

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/**
 * Custom Cursor Implementation
 */
class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.cursorDot = document.querySelector('.cursor-dot');
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => this.updateCursorPosition(e));
        document.addEventListener('mousedown', () => this.shrinkCursor());
        document.addEventListener('mouseup', () => this.expandCursor());
    }

    updateCursorPosition(e) {
        this.cursor.style.left = e.clientX + 'px';
        this.cursor.style.top = e.clientY + 'px';
        this.cursorDot.style.left = e.clientX + 'px';
        this.cursorDot.style.top = e.clientY + 'px';
    }

    shrinkCursor() {
        this.cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    }

    expandCursor() {
        this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    }
}

/**
 * Navigation Bar Controller
 */
class NavigationController {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.init();
    }

    init() {
        this.bindScrollEvent();
        this.initSmoothScrolling();
    }

    bindScrollEvent() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        });
    }

    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e, anchor));
        });
    }

    handleSmoothScroll(e, anchor) {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            gsap.to(window, {
                duration: 1,
                scrollTo: {
                    y: target,
                    offsetY: 70
                },
                ease: "power2.inOut"
            });
        }
    }
}

/**
 * Animation Controller
 */
class AnimationController {
    constructor() {
        this.init();
    }

    init() {
        this.initHeroAnimations();
        this.initTypingEffect();
        this.initFloatingShapes();
        this.initParallaxEffect();
        this.initScrollTriggerAnimations();
        this.initInteractiveAnimations();
    }

    initHeroAnimations() {
        const timeline = gsap.timeline();
        
        timeline
            .from('.hero-subtitle', {
                opacity: 0,
                y: 30,
                duration: 1,
                delay: 0.5
            })
            .from('.hero-title', {
                opacity: 0,
                y: 50,
                duration: 1,
                delay: 0.2
            })
            .from('.hero-description', {
                opacity: 0,
                y: 30,
                duration: 1,
                delay: 0.2
            })
            .from('.hero-buttons', {
                opacity: 0,
                y: 30,
                duration: 1,
                delay: 0.2
            });
    }

    initTypingEffect() {
        const titles = ['Creative Developer', 'UI/UX Designer', 'Problem Solver'];
        let titleIndex = 0;
        const typedText = document.querySelector('.typed-text');

        const typeText = () => {
            gsap.to(typedText, {
                duration: 2,
                text: titles[titleIndex],
                ease: "none",
                onComplete: () => {
                    gsap.to(typedText, {
                        duration: 0.5,
                        opacity: 0,
                        delay: 2,
                        onComplete: () => {
                            titleIndex = (titleIndex + 1) % titles.length;
                            gsap.to(typedText, {
                                duration: 0.5,
                                opacity: 1,
                                onComplete: typeText
                            });
                        }
                    });
                }
            });
        };

        typeText();
    }

    initFloatingShapes() {
        gsap.to('.shape:nth-child(1)', {
            x: 100,
            y: -100,
            duration: 20,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to('.shape:nth-child(2)', {
            x: -150,
            y: 100,
            duration: 25,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to('.shape:nth-child(3)', {
            x: 100,
            y: 150,
            duration: 30,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    initParallaxEffect() {
        gsap.to('.hero-bg', {
            yPercent: 50,
            ease: "none",
            scrollTrigger: {
                trigger: '.hero',
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    }

    initScrollTriggerAnimations() {
        // About section animations
        gsap.from('.about-text', {
            opacity: 0,
            x: -50,
            duration: 1,
            scrollTrigger: {
                trigger: '.about-text',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        gsap.from('.about-image', {
            opacity: 0,
            x: 50,
            duration: 1,
            scrollTrigger: {
                trigger: '.about-image',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        // Skills section animations
        gsap.from('.skill-category', {
            opacity: 0,
            y: 60,
            duration: 0.8,
            stagger: 0.2,
            scrollTrigger: {
                trigger: '.skills-grid',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        // Skill cards animation with stagger
        gsap.utils.toArray('.skill-card').forEach((card, index) => {
            gsap.from(card, {
                opacity: 0,
                x: -30,
                duration: 0.6,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Animate skill progress bars
        gsap.utils.toArray('.skill-card').forEach(card => {
            const progressBar = card.querySelector('.skill-progress');
            const skillLevel = card.getAttribute('data-skill');
            
            gsap.to(progressBar, {
                width: skillLevel + '%',
                duration: 1.5,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Projects cards animation with enhanced effects
        gsap.from('.project-card', {
            opacity: 0,
            scale: 0.9,
            y: 40,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: '.projects-grid',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        // Projects CTA animation
        gsap.from('.projects-cta', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            scrollTrigger: {
                trigger: '.projects-cta',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        // Contact form animation
        gsap.from('.contact-form > *', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: {
                trigger: '.contact-form',
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        // Section title animations
        gsap.utils.toArray('.section-title').forEach(title => {
            gsap.from(title, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    initInteractiveAnimations() {
        this.initSkillCardHover();
        this.initProjectCard3DHover();
        this.initButtonMagneticEffect();
        this.initSkillCategoryAnimations();
        this.initProjectOverlayAnimations();
    }

    initSkillCardHover() {
        document.querySelectorAll('.skill-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                // Animate the skill icon
                const icon = card.querySelector('.skill-icon');
                gsap.to(icon, {
                    scale: 1.1,
                    rotation: 5,
                    duration: 0.3
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
                
                const icon = card.querySelector('.skill-icon');
                gsap.to(icon, {
                    scale: 1,
                    rotation: 0,
                    duration: 0.3
                });
            });
        });
    }

    initSkillCategoryAnimations() {
        document.querySelectorAll('.skill-category').forEach(category => {
            category.addEventListener('mouseenter', () => {
                const title = category.querySelector('.category-title');
                gsap.to(title, {
                    scale: 1.05,
                    duration: 0.3
                });
            });
            
            category.addEventListener('mouseleave', () => {
                const title = category.querySelector('.category-title');
                gsap.to(title, {
                    scale: 1,
                    duration: 0.3
                });
            });
        });
    }

    initProjectCard3DHover() {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    duration: 0.3,
                    transformPerspective: 1000,
                    ease: "power2.out"
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: 0.5
                });
            });
        });
    }

    initProjectOverlayAnimations() {
        document.querySelectorAll('.project-card').forEach(card => {
            const overlay = card.querySelector('.project-overlay');
            const links = card.querySelectorAll('.project-link');
            
            card.addEventListener('mouseenter', () => {
                gsap.to(links, {
                    y: 0,
                    opacity: 1,
                    duration: 0.3,
                    stagger: 0.1,
                    ease: "back.out(1.7)"
                });
            });
            
            card.addEventListener('mouseleave', () => {
                gsap.to(links, {
                    y: 20,
                    opacity: 0,
                    duration: 0.2,
                    stagger: 0.05
                });
            });
        });
    }

    initButtonMagneticEffect() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(btn, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3
                });
            });
            
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.3
                });
            });
        });
    }
}

/**
 * Contact Form Handler
 */
class ContactFormHandler {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.init();
    }

    init() {
        if (this.form) {
            this.bindSubmitEvent();
        }
    }

    bindSubmitEvent() {
        const submitBtn = this.form.querySelector('.btn-primary');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData();
        const inputs = this.form.querySelectorAll('.form-control');
        
        inputs.forEach(input => {
            if (input.value.trim()) {
                formData.append(input.name || input.placeholder.toLowerCase().replace(/\s+/g, '_'), input.value);
            }
        });

        // Simulate form submission
        this.showSubmissionFeedback();
    }

    showSubmissionFeedback() {
        const submitBtn = this.form.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent!';
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                this.form.reset();
            }, 2000);
        }, 1500);
    }
}

/**
 * Performance Optimizer
 */
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeScrollEvents();
        this.preloadCriticalAssets();
    }

    optimizeScrollEvents() {
        let ticking = false;

        const updateScrollBasedElements = () => {
            // Update any scroll-based elements here
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollBasedElements);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick);
    }

    preloadCriticalAssets() {
        // Preload any critical assets
        const criticalAssets = [
            // Add paths to critical images, fonts, etc.
        ];

        criticalAssets.forEach(asset => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = asset;
            link.as = this.getAssetType(asset);
            document.head.appendChild(link);
        });
    }

    getAssetType(assetPath) {
        const extension = assetPath.split('.').pop().toLowerCase();
        const typeMap = {
            'woff': 'font',
            'woff2': 'font',
            'jpg': 'image',
            'jpeg': 'image',
            'png': 'image',
            'webp': 'image',
            'svg': 'image'
        };
        return typeMap[extension] || 'fetch';
    }
}

/**
 * Application Initialization
 */
class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        // Initialize all components
        this.customCursor = new CustomCursor();
        this.navigationController = new NavigationController();
        this.animationController = new AnimationController();
        this.contactFormHandler = new ContactFormHandler();
        this.performanceOptimizer = new PerformanceOptimizer();
        
        console.log('Portfolio app initialized successfully!');
    }
}

// Initialize the application
new PortfolioApp();
