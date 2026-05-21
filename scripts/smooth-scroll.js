/**
 * Smooth Scroll Handler
 * Handles hash-based navigation with smooth scrolling and header offset
 * Prevents fixed headers from covering target sections
 */

(function() {
    'use strict';

    // Configuration
    const config = {
        headerSelector: 'header',
        offsetPx: 80, // Extra spacing below header
        scrollDuration: 600, // ms
        waitForPageLoad: true
    };

    /**
     * Get the header height dynamically
     */
    function getHeaderHeight() {
        const header = document.querySelector(config.headerSelector);
        return header ? header.offsetHeight : 0;
    }

    /**
     * Scroll to a specific element with offset
     */
    function scrollToElement(element) {
        if (!element) return;

        const headerHeight = getHeaderHeight();
        const targetPosition = element.getBoundingClientRect().top + window.scrollY - headerHeight - config.offsetPx;

        // Use smooth scroll if supported, otherwise fallback
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        } else {
            // Fallback for browsers without smooth scroll support
            animateScroll(window.scrollY, targetPosition, config.scrollDuration);
        }
    }

    /**
     * Fallback smooth scroll animation
     */
    function animateScroll(startY, endY, duration) {
        const startTime = performance.now();
        
        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        function frame(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutQuad(progress);
            const currentY = startY + (endY - startY) * easeProgress;

            window.scrollTo(0, currentY);

            if (progress < 1) {
                requestAnimationFrame(frame);
            }
        }

        requestAnimationFrame(frame);
    }

    /**
     * Handle hash in URL and scroll to target
     */
    function handleHash() {
        const hash = window.location.hash;
        
        if (hash) {
            // Remove the '#' and get the element ID
            const targetId = hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    scrollToElement(targetElement);
                }, 100);
            }
        }
    }

    /**
     * Initialize smooth scroll handler
     */
    function init() {
        // Handle hash on page load
        if (config.waitForPageLoad) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', handleHash);
            } else {
                handleHash();
            }
        } else {
            handleHash();
        }

        // Handle hash changes (back/forward navigation)
        window.addEventListener('hashchange', handleHash);

        // Handle internal anchor links
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                const hash = link.getAttribute('href');
                const targetId = hash.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    e.preventDefault();
                    window.location.hash = hash;
                    scrollToElement(targetElement);
                }
            }
        });
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
