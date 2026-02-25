// ================================================================
//  Leano Security Services — index.js
// ================================================================

// DOM Elements
const loadingScreen  = document.getElementById('loadingScreen');
const mobileMenu     = document.getElementById('mobileMenu');
const navLinks       = document.getElementById('navLinks');
const heroParticles  = document.getElementById('heroParticles');
const counters       = document.querySelectorAll('.counter');
const techFeatures   = document.querySelectorAll('.tech-feature');

// ── Backdrop ─────────────────────────────────────────────────────
// Create a single backdrop element and append to body
const backdrop = document.createElement('div');
backdrop.className = 'nav-backdrop';
document.body.appendChild(backdrop);

// ── Page Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    createParticles();
    initCounters();
    initEventListeners();
    initIntersectionObserver();
    initLoadingScreen();
});

// ── Theme ────────────────────────────────────────────────────────
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next    = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    }
}

// ── Mobile menu ──────────────────────────────────────────────────
function openMenu() {
    navLinks.classList.add('active');
    mobileMenu.classList.add('active');
    backdrop.classList.add('active');
    mobileMenu.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent scroll behind drawer
}

function closeMenu() {
    navLinks.classList.remove('active');
    mobileMenu.classList.remove('active');
    backdrop.classList.remove('active');
    mobileMenu.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

function toggleMobileMenu() {
    navLinks.classList.contains('active') ? closeMenu() : openMenu();
}

// ── Event Listeners ───────────────────────────────────────────────
function initEventListeners() {
    // Hamburger button
    mobileMenu?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Close when a nav link is clicked
    navLinks?.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && window.innerWidth <= 1024) {
            closeMenu();
        }
    });

    // Close when backdrop is clicked
    backdrop.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Reset on desktop resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) {
            closeMenu();
            document.body.style.overflow = '';
        }
    });

    // Tech feature tabs (index page only)
    techFeatures.forEach(feature => {
        feature.addEventListener('click', () => {
            techFeatures.forEach(f => f.classList.remove('active'));
            feature.classList.add('active');
        });
    });

    // Header shrink on scroll
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        header?.classList.toggle('scrolled', window.scrollY > 100);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            const offset = document.querySelector('header')?.offsetHeight || 88;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
            if (window.innerWidth <= 1024) closeMenu();
        });
    });
}

// ── Hero Particles ────────────────────────────────────────────────
function createParticles() {
    if (!heroParticles) return;
    heroParticles.innerHTML = '';

    const colors = [
        'rgba(26,158,143,.55)',
        'rgba(214,40,57,.45)',
        'rgba(255,255,255,.35)',
        'rgba(10,44,90,.25)'
    ];

    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 4 + 1;
        Object.assign(p.style, {
            width:               `${size}px`,
            height:              `${size}px`,
            left:                `${Math.random() * 100}%`,
            top:                 `${Math.random() * 100}%`,
            animationDuration:   `${Math.random() * 20 + 10}s`,
            animationDelay:      `${Math.random() * 5}s`,
            backgroundColor:     colors[Math.floor(Math.random() * colors.length)],
            position:            'absolute',
            borderRadius:        '50%',
            pointerEvents:       'none',
            animation:           `particleFloat ${Math.random() * 20 + 10}s ${Math.random() * 5}s infinite linear`,
            opacity:             '0.7',
            zIndex:              '1',
        });
        heroParticles.appendChild(p);
    }

    // Inject particle keyframe once
    if (!document.getElementById('particle-style')) {
        const s = document.createElement('style');
        s.id = 'particle-style';
        s.textContent = `
            @keyframes particleFloat {
                0%   { transform: translateY(100vh) rotate(0deg);   opacity: 0; }
                10%  { opacity: .7; }
                90%  { opacity: .7; }
                100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(s);
    }
}

// ── Counters ──────────────────────────────────────────────────────
function initCounters() {
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = +el.getAttribute('data-target');
            let count    = 0;
            const step   = target / (2000 / 16);

            const tick = () => {
                count = Math.min(count + step, target);
                el.textContent = Math.ceil(count);
                if (count < target) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

// ── Scroll Animations ─────────────────────────────────────────────
function initIntersectionObserver() {
    // Inject fadeInUp animation once
    if (!document.getElementById('anim-style')) {
        const s = document.createElement('style');
        s.id = 'anim-style';
        s.textContent = `
            .anim-target { opacity: 0; transform: translateY(28px); transition: opacity .55s ease, transform .55s ease; }
            .anim-target.animate-in { opacity: 1; transform: translateY(0); }
        `;
        document.head.appendChild(s);
    }

    const targets = document.querySelectorAll(
        '.service-card, .tech-feature, .stat-card, .trust-item, .value-card, .team-card'
    );
    targets.forEach(el => el.classList.add('anim-target'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
}

// ── Loading Screen ────────────────────────────────────────────────
function initLoadingScreen() {
    if (!loadingScreen) return;
    window.addEventListener('load', () => {
        setTimeout(() => {
            loadingScreen.classList.add('loaded');
            setTimeout(() => { loadingScreen.style.display = 'none'; }, 500);
        }, 800);
    });
}
