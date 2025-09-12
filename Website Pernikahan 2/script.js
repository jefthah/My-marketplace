// GSAP Animations
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Custom Cursor
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(() => {
        cursorFollower.style.left = e.clientX - 10 + 'px';
        cursorFollower.style.top = e.clientY - 10 + 'px';
    }, 100);
});

// Preloader
window.addEventListener('load', () => {
    gsap.to('.preloader', {
        opacity: 0,
        duration: 1,
        delay: 1,
        onComplete: () => {
            document.querySelector('.preloader').style.display = 'none';
        }
    });

    // Hero Animations
    gsap.to('.hero-subtitle', {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 1.5
    });

    gsap.to('.hero-title', {
        opacity: 1,
        rotateX: 0,
        duration: 1.5,
        delay: 1.8
    });

    gsap.to('.hero-date', {
        opacity: 1,
        scale: 1,
        duration: 1,
        delay: 2.2,
        ease: 'back.out(1.7)'
    });
});

// Particles
function createParticle() {
    const particles = document.querySelector('.particles');
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particles.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 20000);
}

setInterval(createParticle, 500);

// Floating Menu Active State
const sections = document.querySelectorAll('.section, .hero');
const menuDots = document.querySelectorAll('.menu-dot');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    menuDots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === 0 && current === 'home') dot.classList.add('active');
        if (index === 1 && current === 'couple') dot.classList.add('active');
        if (index === 2 && current === 'story') dot.classList.add('active');
        if (index === 3 && current === 'events') dot.classList.add('active');
        if (index === 4 && current === 'gallery') dot.classList.add('active');
        if (index === 5 && current === 'rsvp') dot.classList.add('active');
        if (index === 6 && current === 'gift') dot.classList.add('active');
    });
});

// Menu Dot Click
menuDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        const sectionIds = ['home', 'couple', 'story', 'events', 'gallery', 'rsvp', 'gift'];
        const target = document.getElementById(sectionIds[index]);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Scroll Animations
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        duration: 1
    });
});

gsap.utils.toArray('.couple-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        rotateY: 30,
        duration: 1,
        delay: i * 0.2
    });
});

gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item.querySelector('.timeline-content'), {
        scrollTrigger: {
            trigger: item,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        },
        x: i % 2 === 0 ? -100 : 100,
        opacity: 0,
        duration: 1
    });
});

gsap.utils.toArray('.event-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        duration: 1,
        delay: i * 0.2
    });
});

gsap.utils.toArray('.gallery-item').forEach((item, i) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        scale: 0,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'back.out(1.7)'
    });
});

// Countdown
function updateCountdown() {
    const weddingDate = new Date('2025-12-31T19:00:00').getTime();
    const now = new Date().getTime();
    const difference = weddingDate - now;

    if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
}

setInterval(updateCountdown, 1000);
updateCountdown();

// Music Player
const musicPlayer = document.getElementById('musicPlayer');
let isPlaying = false;

musicPlayer.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
        musicPlayer.classList.add('playing');
    } else {
        musicPlayer.classList.remove('playing');
    }
});

// Form Submit
document.querySelector('.rsvp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    gsap.to('.form-submit', {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            alert('Thank you for your RSVP! We look forward to celebrating with you.');
            e.target.reset();
        }
    });
});

// Copy Function
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Number copied to clipboard!');
    });
}

// Parallax Effect
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
});
