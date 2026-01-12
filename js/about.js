// About Page Specific JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initAboutPage();
});

function initAboutPage() {
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize timeline interactions
    initTimeline();
    
    // Initialize stats counters
    initStatsCounters();
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Special animations for specific elements
                if (entry.target.classList.contains('timeline-item')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.value-card, .team-card, .cert-card, .leadership-stat, .timeline-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Special observation for timeline items
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.transform = index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
    });
}

function initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.02)';
            item.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
        
        // Add click effect
        item.addEventListener('click', () => {
            const content = item.querySelector('.timeline-content');
            content.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            setTimeout(() => {
                content.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }, 300);
        });
    });
}

function initStatsCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    if (counters.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = counter.textContent.includes('+') 
                    ? parseInt(counter.textContent.replace('+', '')) 
                    : counter.textContent;
                
                if (typeof target === 'number') {
                    animateCounter(counter, target);
                }
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(counter, target) {
    let count = 0;
    const increment = target / 50; // Animate over 50 steps
    const interval = 30; // 30ms per step
    
    const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
            count = target;
            clearInterval(timer);
        }
        counter.textContent = target.toString().includes('+') 
            ? Math.floor(count) + '+' 
            : Math.floor(count).toString();
    }, interval);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
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
    
    .timeline-item {
        transition: transform 0.3s ease, opacity 0.6s ease !important;
    }
    
    .cert-card, .value-card, .team-card {
        transition: all 0.3s ease !important;
    }
    
    .cert-card:hover .cert-icon,
    .value-card:hover .value-icon,
    .team-card:hover .team-icon {
        transform: rotate(360deg);
        transition: transform 0.6s ease;
    }
`;
document.head.appendChild(style);

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