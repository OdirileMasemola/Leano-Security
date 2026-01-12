// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.getElementById('navLinks');
const themeToggle = document.getElementById('themeToggle');
const heroParticles = document.getElementById('heroParticles');
const counters = document.querySelectorAll('.counter');
const techFeatures = document.querySelectorAll('.tech-feature');
const overlayPoints = document.querySelectorAll('.overlay-point');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    initPage();
    initAnimations();
    initEventListeners();
});

// Page initialization
function initPage() {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Initialize mobile menu for mobile devices
    if (window.innerWidth <= 1024) {
        navLinks.classList.add('mobile-hidden');
        navLinks.classList.remove('active');
        mobileMenu.classList.remove('active');
    } else {
        navLinks.classList.remove('mobile-hidden');
        navLinks.classList.remove('active');
    }
    
    // Create hero particles
    createParticles();
    
    // Initialize counters
    initCounters();
}

// Initialize event listeners
function initEventListeners() {
    // Mobile menu toggle - FIXED
    mobileMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close mobile menu when clicking on a link
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && window.innerWidth <= 1024) {
            toggleMobileMenu();
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !mobileMenu.contains(e.target) && window.innerWidth <= 1024) {
            navLinks.classList.remove('active');
            mobileMenu.classList.remove('active');
            navLinks.classList.add('mobile-hidden');
        }
    });
    
    // Tech feature interactions
    techFeatures.forEach(feature => {
        feature.addEventListener('click', () => {
            techFeatures.forEach(f => f.classList.remove('active'));
            feature.classList.add('active');
        });
    });
    
    // Header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);
    
    // Intersection Observer for animations
    initIntersectionObserver();
    
    // Window resize handler
    window.addEventListener('resize', handleWindowResize);
}

// Mobile menu toggle - FIXED
function toggleMobileMenu() {
    navLinks.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('mobile-hidden');
    } else {
        // Small delay before hiding to allow smooth transition
        setTimeout(() => {
            if (!navLinks.classList.contains('active')) {
                navLinks.classList.add('mobile-hidden');
            }
        }, 300);
    }
}

// Window resize handler
function handleWindowResize() {
    if (window.innerWidth > 1024) {
        // Desktop - show nav links, remove mobile classes
        navLinks.classList.remove('mobile-hidden', 'active');
        mobileMenu.classList.remove('active');
    } else {
        // Mobile - hide nav links if not active
        if (!navLinks.classList.contains('active')) {
            navLinks.classList.add('mobile-hidden');
            navLinks.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    }
}

// Handle header scroll effect
function handleHeaderScroll() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Create particles for hero section
function createParticles() {
    if (!heroParticles) return;
    
    const particleCount = 50;
    
    // Clear existing particles
    heroParticles.innerHTML = '';
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        // Set styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        // Random color
        const colors = [
            'rgba(42, 157, 143, 0.6)',
            'rgba(230, 57, 70, 0.6)',
            'rgba(255, 255, 255, 0.4)',
            'rgba(10, 44, 90, 0.3)'
        ];
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        heroParticles.appendChild(particle);
    }
}

// Initialize counter animations
function initCounters() {
    if (counters.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const speed = 2000; // Animation duration in ms
                
                const updateCount = () => {
                    const count = +counter.innerText;
                    const increment = target / (speed / 16); // 60fps
                    
                    if (count < target) {
                        counter.innerText = Math.ceil(count + increment);
                        setTimeout(updateCount, 16);
                    } else {
                        counter.innerText = target;
                    }
                };
                
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// Initialize animations on scroll
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.service-card, .tech-feature, .stat-card, .trust-item').forEach(el => {
        observer.observe(el);
    });
}

// Initialize animations
function initAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: float 20s infinite linear;
            opacity: 0.7;
        }
        
        @keyframes float {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.7;
            }
            90% {
                opacity: 0.7;
            }
            100% {
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
            transform: translateY(30px);
        }
        
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .service-card, .tech-feature, .stat-card, .trust-item {
            opacity: 0;
        }
        
        /* Mobile menu styles */
        .nav-links.mobile-hidden {
            display: none;
        }
        
        .nav-links.active {
            display: flex !important;
        }
        
        @media (min-width: 1025px) {
            .nav-links.mobile-hidden {
                display: flex !important;
            }
        }
        
        @media (max-width: 1024px) {
            .nav-links {
                position: fixed;
                top: 90px;
                left: 0;
                width: 100%;
                height: calc(100vh - 90px);
                background-color: var(--light-color);
                flex-direction: column;
                padding: 3rem 2rem;
                gap: 0;
                transform: translateX(-100%);
                opacity: 0;
                visibility: hidden;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: var(--shadow-xl);
                z-index: 999;
                overflow-y: auto;
            }
            
            [data-theme="dark"] .nav-links {
                background-color: var(--dark-color);
            }
            
            .nav-links.active {
                transform: translateX(0);
                opacity: 1;
                visibility: visible;
            }
            
            .nav-links li {
                width: 100%;
                text-align: center;
                margin: 0.5rem 0;
            }
            
            .nav-links a {
                display: block;
                padding: 1.25rem 2rem;
                font-size: 1.2rem;
                border-radius: 10px;
                transition: all 0.3s ease;
            }
            
            .nav-links a:hover {
                background-color: rgba(42, 157, 143, 0.1);
                transform: translateX(10px);
            }
            
            .nav-links a::after {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Hide loading screen after page load
    if (loadingScreen) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingScreen.classList.add('loaded');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 1000);
        });
    }
}

// Emergency button click handler
document.querySelector('.emergency-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.innerWidth <= 768) {
        window.location.href = 'tel:+27683794897';
    } else {
        alert('Emergency Number: 068 379 4897\nCalling this number now...');
        // In a real implementation, you might want to use:
        // window.open('tel:+27683794897');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active') && window.innerWidth <= 1024) {
                toggleMobileMenu();
            }
        }
    });
});

// Add particle animation CSS
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    .particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.7;
        z-index: 1;
    }
`;
document.head.appendChild(particleStyle);