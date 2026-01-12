// Services Page Specific JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initServicesPage();
});

function initServicesPage() {
    // Initialize animations
    initAnimations();
    
    // Initialize particle system for hero
    initParticles();
    
    // Initialize service cards interactions
    initServiceCards();
    
    // Initialize smooth scrolling for service links
    initServiceLinks();
    
    // Initialize package card interactions
    initPackageCards();
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Add specific animations for service cards
                if (entry.target.classList.contains('service-card')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
                
                // Add animation for process steps
                if (entry.target.classList.contains('process-step')) {
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, entry.target.dataset.delay || 0);
                }
                
                // Add animation for package cards
                if (entry.target.classList.contains('package-card')) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, entry.target.dataset.delay || 0);
                }
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.service-card, .promise-card, .process-step, .package-card, .detail-header').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        if (el.classList.contains('process-step') || el.classList.contains('package-card')) {
            el.dataset.delay = index * 200;
        }
        observer.observe(el);
    });
}

function initParticles() {
    const particlesContainer = document.getElementById('heroParticles');
    if (!particlesContainer) return;
    
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 15 + 10;
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
        
        particlesContainer.appendChild(particle);
    }
    
    // Add CSS for particles
    const style = document.createElement('style');
    style.textContent = `
        .particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: float 15s infinite linear;
            opacity: 0.7;
        }
        
        @keyframes float {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 0.7;
            }
            90% {
                opacity: 0.7;
            }
            100% {
                transform: translateY(-1000px) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function initServiceCards() {
    // Add hover effects to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.service-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.transition = 'transform 0.3s ease';
            }
            
            // Add glow effect
            card.style.boxShadow = '0 20px 40px rgba(42, 157, 143, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.service-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
            
            // Remove glow effect
            card.style.boxShadow = '';
        });
        
        // Click effect
        card.addEventListener('click', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            setTimeout(() => {
                card.style.transform = 'translateY(-10px) scale(1)';
            }, 150);
        });
    });
}

function initServiceLinks() {
    // Smooth scroll for service detail links
    const serviceLinks = document.querySelectorAll('.service-link');
    serviceLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                // Highlight the target section
                targetElement.style.boxShadow = '0 0 0 5px rgba(42, 157, 143, 0.3)';
                setTimeout(() => {
                    targetElement.style.boxShadow = '';
                }, 1000);
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initPackageCards() {
    // Add interactive effects to package cards
    const packageCards = document.querySelectorAll('.package-card');
    packageCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px)';
            card.style.boxShadow = '0 25px 50px rgba(42, 157, 143, 0.4)';
            
            // Highlight features
            const features = card.querySelectorAll('.feature');
            features.forEach(feature => {
                const icon = feature.querySelector('i');
                if (icon && !icon.classList.contains('fa-times')) {
                    feature.style.transform = 'translateX(10px)';
                    feature.style.color = 'var(--accent-color)';
                }
            });
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
            
            // Reset features
            const features = card.querySelectorAll('.feature');
            features.forEach(feature => {
                feature.style.transform = '';
                feature.style.color = '';
            });
        });
        
        // Click on CTA button
        const ctaButton = card.querySelector('.package-cta');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                e.stopPropagation();
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 200);
            });
        }
    });
}

// Add CSS for animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    .process-step.animated {
        animation: slideInLeft 0.5s ease forwards;
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .service-card, .package-card {
        transition: all 0.3s ease !important;
    }
    
    .service-card:hover .service-icon {
        transform: rotate(360deg);
        transition: transform 0.6s ease;
    }
    
    .promise-card:hover .promise-icon {
        transform: rotateY(180deg);
        transition: transform 0.6s ease;
    }
`;
document.head.appendChild(animationStyle);

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
        }
    });
});

// Highlight current service on scroll
function highlightCurrentService() {
    const sections = document.querySelectorAll('.service-detail');
    const navHeight = document.querySelector('header').offsetHeight;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Remove all active classes
    document.querySelectorAll('.service-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section link
    if (currentSection) {
        const activeLink = document.querySelector(`.service-link[href="#${currentSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.style.color = 'var(--accent-color)';
            activeLink.style.fontWeight = '700';
        }
    }
}

// Throttle scroll events
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(highlightCurrentService, 100);
});

// Initialize on load
highlightCurrentService();