// Capabilities Page Specific JavaScript

document.addEventListener('DOMContentLoaded', () => {
    initCapabilitiesPage();
});

function initCapabilitiesPage() {
    // Initialize animations
    initAnimations();
    
    // Initialize particle system for hero
    initParticles();
    
    // Initialize interactive elements
    initInteractiveElements();
    
    // Initialize node connections for integration section
    initNodeConnections();
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
                
                // Add specific animations for capability cards
                if (entry.target.classList.contains('capability-card')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
                
                // Add animation for feature items
                if (entry.target.classList.contains('feature-item')) {
                    setTimeout(() => {
                        entry.target.classList.add('animated');
                    }, entry.target.dataset.delay || 0);
                }
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.capability-card, .why-card, .integration-feature, .feature-item, .detail-header').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        if (el.classList.contains('feature-item')) {
            el.dataset.delay = index * 100;
        }
        observer.observe(el);
    });
}

function initParticles() {
    const particlesContainer = document.getElementById('heroParticles');
    if (!particlesContainer) return;
    
    const particleCount = 30;
    
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

function initInteractiveElements() {
    // Add hover effects to capability cards
    const capabilityCards = document.querySelectorAll('.capability-card');
    capabilityCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.capability-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.capability-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }
        });
        
        // Click effect
        card.addEventListener('click', () => {
            card.style.boxShadow = '0 20px 40px rgba(42, 157, 143, 0.3)';
            setTimeout(() => {
                card.style.boxShadow = '';
            }, 300);
        });
    });
    
    // Add hover effects to nodes
    const nodes = document.querySelectorAll('.node');
    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            const icon = node.querySelector('.node-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                icon.style.boxShadow = '0 10px 25px rgba(42, 157, 143, 0.4)';
            }
        });
        
        node.addEventListener('mouseleave', () => {
            const icon = node.querySelector('.node-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
                icon.style.boxShadow = '';
            }
        });
    });
}

function initNodeConnections() {
    const nodes = document.querySelectorAll('.node');
    const center = document.querySelector('.center-circle');
    
    if (!nodes.length || !center) return;
    
    // Create connection lines on hover
    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            createConnectionLine(node, center);
        });
        
        node.addEventListener('mouseleave', () => {
            removeConnectionLines();
        });
    });
    
    // Function to create connection line
    function createConnectionLine(node, center) {
        const line = document.createElement('div');
        line.className = 'connection-line';
        
        const nodeRect = node.getBoundingClientRect();
        const centerRect = center.getBoundingClientRect();
        const containerRect = document.querySelector('.integration-visual').getBoundingClientRect();
        
        const x1 = nodeRect.left + nodeRect.width / 2 - containerRect.left;
        const y1 = nodeRect.top + nodeRect.height / 2 - containerRect.top;
        const x2 = centerRect.left + centerRect.width / 2 - containerRect.left;
        const y2 = centerRect.top + centerRect.height / 2 - containerRect.top;
        
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 0';
        
        document.querySelector('.integration-visual').appendChild(line);
        
        // Animate the line
        setTimeout(() => {
            line.style.width = `${length}px`;
        }, 10);
    }
    
    // Function to remove connection lines
    function removeConnectionLines() {
        document.querySelectorAll('.connection-line').forEach(line => {
            line.remove();
        });
    }
    
    // Add CSS for connection lines
    const style = document.createElement('style');
    style.textContent = `
        .connection-line {
            position: absolute;
            height: 2px;
            background: linear-gradient(90deg, 
                rgba(42, 157, 143, 0.8) 0%, 
                rgba(42, 157, 143, 0.4) 100%);
            z-index: 1;
            pointer-events: none;
            transition: width 0.3s ease;
            width: 0;
        }
        
        .connection-line::before {
            content: '';
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            background-color: var(--accent-color);
            border-radius: 50%;
            animation: pulse-dot 1.5s infinite;
        }
        
        @keyframes pulse-dot {
            0%, 100% {
                opacity: 0.3;
                transform: translateY(-50%) scale(0.8);
            }
            50% {
                opacity: 1;
                transform: translateY(-50%) scale(1.2);
            }
        }
    `;
    document.head.appendChild(style);
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
    
    .feature-item.animated {
        animation: slideInRight 0.5s ease forwards;
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
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