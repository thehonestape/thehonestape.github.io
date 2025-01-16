// Initialize both Swup and initial page load
document.addEventListener('DOMContentLoaded', () => {
    // Handle initial page load first
    const isHomePage = window.location.pathname === '/' ||
        window.location.pathname === '/index.html';

    if (isHomePage && window.terminalManager) {
        window.terminalManager.initialize();
    }

    // Initialize Swup
    initializeSwup();
});

function initializeSwup() {
    try {
        if (typeof window.Swup === 'undefined') {
            console.warn('Swup not loaded');
            return;
        }

        // Check if device is mobile
        const isMobile = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                window.matchMedia("(max-width: 768px)").matches;
        };

        // Initialize cursor if not mobile
        if (!isMobile()) {
            initializeMouseFollower();
        }

        const swup = new window.Swup({
            containers: ['#swup'],
            animateHistoryBrowsing: true,
            cache: true,
            scroll: false,
            plugins: [
                new window.SwupHeadPlugin({
                    persistAssets: true,
                    persistTags: ['style', 'link[rel="stylesheet"]', 'script']
                }),
                new window.SwupProgressPlugin(),
                new window.SwupPreloadPlugin(),
            ]
        });

        // Make swup instance globally available
        window.swup = swup;

        // Initialize GSAP animations after Swup is ready
        if (typeof gsap !== 'undefined') {
            initializeGSAPAnimations();
        }

        // Setup Swup hooks
        setupSwupHooks(swup, isMobile);

        // Add styles
        addStyles();

    } catch (error) {
        console.warn('Error initializing Swup:', error);
    }
}

function setupSwupHooks(swup, isMobile) {
    // Before transition starts
    swup.hooks.on('visit:start', () => {
        const content = document.querySelector('#swup');

        // Simple fade/diffuse out without movement
        gsap.to(content, {
            duration: 0.4,
            opacity: 0,
            filter: "blur(10px)",
            ease: "power2.inOut"
        });

        if (window.cursor) {
            window.cursor.destroy();
            window.cursor = null;

            if (!isMobile()) {
                initializeMouseFollower();
                if (window.cursor?.el) {
                    window.cursor.el.classList.add('-loading');
                }
            }
        }
    });

    swup.hooks.on('content:replace', () => {
        cleanup();

        // Set scroll position immediately
        window.scrollTo({
            top: 0,
            behavior: 'auto'
        });

        // Re-initialize GSAP and ScrollTrigger
        if (typeof gsap !== 'undefined') {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            }
            initializeGSAPAnimations();
        }

        // Handle other reinitializations
        if (typeof window.searchInit === 'function') {
            window.searchInit();
        }
        if (typeof window.searchInitListener === 'function') {
            window.searchInitListener();
        }

        const isHomePage = window.location.pathname === '/' ||
            window.location.pathname === '/index.html';
        if (isHomePage && window.terminalManager) {
            window.terminalManager.initialize();
        }
    });

    // After transition is complete
    swup.hooks.on('visit:end', () => {
        const content = document.querySelector('#swup');

        gsap.fromTo(content,
            {
                opacity: 0,
                filter: "blur(10px)"
            },
            {
                duration: 0.5,
                opacity: 1,
                filter: "blur(0px)",
                ease: "power2.out",
                clearProps: "all"
            }
        );

        if (!isMobile()) {
            if (!window.cursor) {
                initializeMouseFollower();
            }
            if (window.cursor?.el) {
                window.cursor.el.classList.remove('-loading');
            }
        }
    });
}
function initializeGSAPAnimations() {
    try {
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger, TextPlugin);

        // Initialize all animations
        initializeScrollAnimations();
    } catch (error) {
        console.warn('Error initializing GSAP:', error);
    }
}

function animateText(element) {
    if (!element) return;

    const text = element.textContent;
    const chars = text.split('');
    element.textContent = '';

    chars.forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.willChange = 'transform, opacity, filter';
        element.appendChild(span);
    });

    gsap.to(element.children, {
        duration: 0.8,
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        stagger: {
            amount: 0.3,
            from: "random"
        },
        ease: "power2.out",
        clearProps: "all",
        onStart: function () {
            gsap.set(element.children, {
                opacity: 0,
                scale: 0.8,
                filter: "blur(10px)",
            });
        }
    });
}

function initializeScrollAnimations() {
    // Featured notes section
    // In your initializeScrollAnimations function, adjust the featured articles section:

const featuredArticles = gsap.utils.toArray('#featured-notes .list-feed');

featuredArticles.forEach(article => {
    ScrollTrigger.create({
        trigger: article,
        // Adjust these values to control when the animation starts
        start: "top center", // Changed from "top 85%" to "top center"
        // Optional: add markers to help visualize the trigger point while developing
        // markers: true, // Uncomment this to see trigger points
        onEnter: () => {
            const elements = {
                container: article,
                image: article.querySelector('.blog-roll-image'),
                title: article.querySelector('.title'),
                content: article.querySelector('.content'),
                tags: article.querySelectorAll('.tag')
            };

            // Initial states
            gsap.set(elements.container, { 
                visibility: 'visible'
            });

            const tl = gsap.timeline();

            // Slightly adjusted timing
            tl.fromTo(elements.container,
                {
                    opacity: 0,
                    y: 30
                },
                {
                    duration: 0.4,
                    opacity: 1,
                    y: 0,
                    ease: "back.out(1.2)"
                }
            )
            .fromTo(elements.image,
                {
                    opacity: 0,
                    scale: 1.05,
                    filter: "blur(8px)"
                },
                {
                    duration: 0.6, // Slightly longer
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    ease: "power2.out"
                },
                "-=0.2"
            )
            .fromTo(elements.title,
                {
                    opacity: 0,
                    y: 15,
                    filter: "blur(5px)"
                },
                {
                    duration: 0.5, // Slightly longer
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    ease: "power2.out"
                },
                "-=0.3" // Less overlap
            );

            // Rest of your animation remains the same...
        },
        once: true
    });
});

    // Cards animation
    const cards = gsap.utils.toArray('.card');
    cards.forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start: "top 85%",
            onEnter: () => {
                gsap.fromTo(card,
                    {
                        opacity: 0,
                        y: 20,
                        visibility: 'visible'
                    },
                    {
                        duration: 0.4,
                        opacity: 1,
                        y: 0,
                        delay: index * 0.1,
                        ease: "back.out(1.2)"
                    }
                );
            },
            once: true
        });
    });
}

function initializeMouseFollower() {
    if (typeof MouseFollower === 'undefined') return;

    try {
        // Destroy existing cursor if it exists
        if (window.cursor) {
            window.cursor.destroy();
            window.cursor = null;
        }

        // Initialize with basic settings
        window.cursor = new MouseFollower({
            container: document.body,
            speed: 0.55,
            skewing: 0,
            ease: 'expo.out',
            className: 'mf-cursor',
            stateDetection: {
                '-active': 'a,button',
                '-loading': '[data-loading]'
            }
        });
    } catch (error) {
        console.warn('Error initializing MouseFollower:', error);
    }
}

// Simplified styles
function addStyles() {
    if (!document.querySelector('#animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            .card, .list-feed {
                visibility: hidden;
            }

            .mf-cursor {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9999;
                contain: layout style size;
                pointer-events: none;
                will-change: transform;
            }

            .mf-cursor::before {
                content: "";
                position: absolute;
                top: -50px;
                left: -50px;
                width: 100px;
                height: 100px;
                transform: scale(0.4);
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                border: 2px solid var(--color-border-dark);
            }

            .mf-cursor.-active::before {
                background: transparent;
                border: 2px solid var(--color-border-light);
                transform: scale(1);
            }

            @media (hover: none) and (pointer: coarse), (max-width: 768px) {
                .mf-cursor {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function cleanup() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.innerHTML = '';
    }
    document.documentElement.classList.remove('search-active');

    const lightbox = document.querySelector('.swiper-lightbox');
    if (lightbox) {
        lightbox.remove();
    }
}