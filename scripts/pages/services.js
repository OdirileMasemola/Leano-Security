// Services Page — scroll-in animation for process steps.
// (Service cards are animated by the shared observer in home.js;
// the .anim-target styles are injected there as well.)

document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.process-step');
    if (!steps.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    steps.forEach(el => {
        el.classList.add('anim-target');
        observer.observe(el);
    });
});
