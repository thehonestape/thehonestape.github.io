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
                new window.SwupSlideTheme()
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
        content.style.opacity = '0';

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

    // When new content is ready
    swup.hooks.on('content:replace', () => {
        cleanup();

        // Re-initialize GSAP if it exists
        if (typeof gsap !== 'undefined') {
            // Kill existing ScrollTriggers
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            }
            initializeGSAPAnimations();
        }

        // Initialize search if needed
        if (typeof window.searchInit === 'function') {
            window.searchInit();
        }
        if (typeof window.searchInitListener === 'function') {
            window.searchInitListener();
        }

        // Initialize lightbox (add this line)
        if (window.initializeLightbox) {
            window.initializeLightbox();
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
        setTimeout(() => {
            content.style.opacity = '1';
        }, 50);

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

// Add this new function
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
    // Featured notes section animation
    const featuredArticles = gsap.utils.toArray('#featured-notes .list-feed');
    console.log('Found featured articles:', featuredArticles.length); // Debug line

    featuredArticles.forEach((article, index) => {
        ScrollTrigger.create({
            trigger: article,
            start: "top 85%",
            onEnter: () => {
                const tl = gsap.timeline();
                const elements = {
                    container: article,
                    image: article.querySelector('.blog-roll-image'),
                    title: article.querySelector('.title'),
                    content: article.querySelector('.content'),
                    tags: article.querySelectorAll('.tag')
                };

                // Debug
                console.log('Elements found:', {
                    hasImage: !!elements.image,
                    hasTitle: !!elements.title,
                    hasContent: !!elements.content,
                    tagsCount: elements.tags.length
                });

                // Set initial states
                gsap.set([elements.container], {
                    opacity: 0,
                    y: 30,
                    visibility: 'visible'
                });

                if (elements.image) {
                    gsap.set(elements.image, {
                        opacity: 0,
                        scale: 1.05,
                        filter: "blur(15px) brightness(1.2)"
                    });
                }

                // Animation sequence
                tl.to(elements.container, {
                    duration: 0.8,
                    opacity: 1,
                    y: 0,
                    ease: "power3.out"
                })

                if (elements.image) {
                    tl.to(elements.image, {
                        duration: 1,
                        opacity: 1,
                        scale: 1,
                        filter: "blur(0px) brightness(1)",
                        ease: "power2.out"
                    }, "-=0.4");
                }

                if (elements.title) {
                    tl.to(elements.title, {
                        duration: 0.6,
                        opacity: 1,
                        y: 0,
                        ease: "power2.out"
                    }, "-=0.6");
                }

                if (elements.tags.length) {
                    tl.to(elements.tags, {
                        duration: 0.4,
                        opacity: 1,
                        y: 0,
                        stagger: 0.05,
                        ease: "power2.out"
                    }, "-=0.4");
                }
            },
            once: true,
            markers: true // Debug - remove in production
        });
    });

    // Project cards animation
    const cards = gsap.utils.toArray('.card');
    cards.forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start: "top 85%",
            onEnter: () => {
                const tl = gsap.timeline();
                const elements = {
                    container: card,
                    image: card.querySelector('.card-image'),
                    title: card.querySelector('.title'),
                    tags: card.querySelectorAll('.tag')
                };

                // Set ALL initial states at once
                gsap.set(card, { visibility: 'visible' }); // Ensure card is visible
                gsap.set([elements.container, elements.image, elements.title, elements.tags], {
                    opacity: 0
                });
                gsap.set(elements.image, {
                    scale: 1.1,
                    filter: "blur(15px) brightness(1.2)"
                });

                // Smoother animation sequence
                tl.to(elements.container, {
                    duration: 0.4,
                    opacity: 1,
                    ease: "power2.out"
                })
                    .to(elements.image, {
                        duration: 1,
                        opacity: 1,
                        scale: 1,
                        filter: "blur(0px) brightness(1)",
                        ease: "power2.out"
                    }, "-=0.2")
                    .add(() => animateText(elements.title), "-=0.4")
                    .to(elements.tags, {
                        duration: 0.4,
                        opacity: 1,
                        stagger: 0.05,
                        ease: "power2.out"
                    }, "-=0.2");
            },
            once: true
        });
    });
}

// Replace your existing animateArticleContent
function animateArticleContent(article) {
    const elements = {
        tags: article.querySelectorAll('.tag'),
        image: article.querySelector('.blog-roll-image'),
        content: article.querySelector('.content'),
        title: article.querySelector('.title')
    };

    // Tags subtle float up
    gsap.fromTo(elements.tags,
        {
            opacity: 0,
            y: 10
        },
        {
            duration: 0.5,
            opacity: 1,
            y: 0,
            stagger: 0.05,
            ease: "power2.out"
        }
    );

    // Image reveal with modern diffusion
    if (elements.image) {
        gsap.fromTo(elements.image,
            {
                opacity: 0,
                scale: 1.05,
                filter: "blur(15px) brightness(1.2)"
            },
            {
                duration: 1.2,
                opacity: 1,
                scale: 1,
                filter: "blur(0px) brightness(1)",
                ease: "power2.out"
            }
        );
    }

    // Animate title with diffusion effect
    if (elements.title) {
        animateText(elements.title);
    }

    // Content fade up with slight diffusion
    if (elements.content) {
        const contentText = elements.content.textContent;
        elements.content.textContent = '';

        const words = contentText.split(' ');
        words.forEach(word => {
            const span = document.createElement('span');
            span.textContent = word + ' ';
            span.style.opacity = '0';
            span.style.display = 'inline-block';
            elements.content.appendChild(span);
        });

        gsap.to(elements.content.children, {
            duration: 0.8,
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: {
                amount: 0.5,
                from: "start"
            },
            ease: "power2.out",
            onStart: function () {
                gsap.set(elements.content.children, {
                    opacity: 0,
                    y: 10,
                    filter: "blur(5px)",
                });
            }
        });
    }
}

// Replace your existing animateCardContent
function animateCardContent(card) {
    const elements = {
        image: card.querySelector('.card-image'),
        tags: card.querySelectorAll('.tag'),
        title: card.querySelector('.title')
    };

    // Image reveal with diffusion effect
    if (elements.image) {
        gsap.fromTo(elements.image,
            {
                opacity: 0,
                scale: 1.1,
                filter: "blur(15px) brightness(1.2)"
            },
            {
                duration: 1,
                opacity: 1,
                scale: 1,
                filter: "blur(0px) brightness(1)",
                ease: "power2.out"
            }
        );
    }

    // Tags float up with stagger
    gsap.fromTo(elements.tags,
        {
            opacity: 0,
            y: 10,
            filter: "blur(5px)"
        },
        {
            duration: 0.4,
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.05,
            ease: "power2.out"
        }
    );

    // Title with diffusion effect
    if (elements.title) {
        animateText(elements.title);
    }
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
            skewing: 1,
            ease: 'expo.out',
            className: 'mf-cursor',
            stateDetection: {
                '-active': 'a,button',
                '-loading': '[data-loading]'
            }
        });

        // Simple click handling
        document.addEventListener('mousedown', () => {
            if (window.cursor?.el) {
                window.cursor.el.style.transform = 'scale(0.7)';
            }
        });

        document.addEventListener('mouseup', () => {
            if (window.cursor?.el) {
                window.cursor.el.style.transform = 'scale(1)';
            }
        });

    } catch (error) {
        console.warn('Error initializing MouseFollower:', error);
    }
}

function addStyles() {
    if (!document.querySelector('#animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            /* Base Animation States */
            .card, .list-feed {
                position: relative;
                overflow: hidden;
                visibility: hidden;
                will-change: transform, opacity;
            }

            .card *, .list-feed * {
                backface-visibility: hidden;
            }

            /* Image and Content */
            .blog-roll-image, .card-image {
                will-change: transform, opacity, filter;
            }

            .title span, .content span {
                will-change: transform, opacity, filter;
            }

            /* Mouse Follower */
            .mf-cursor {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9999;
                contain: layout style size;
                pointer-events: none;
                will-change: transform;
                mix-blend-mode: difference;

            }

            .mf-cursor::before {
                content: "";
                position: absolute;
                top: -50px;
                left: -50px;
                display: block;
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

            .mf-cursor.-loading::before {
                animation: cursorLoad 1s ease-in-out infinite;
                background: transparent;
                border: 2px solid var(--color-border-light);
            }

            /* Responsive Behavior */
            @media (hover: none) and (pointer: coarse), (max-width: 768px) {
                .mf-cursor {
                    display: none !important;
                }
            }

            /* Animations */
            @keyframes cursorLoad {
                0% { transform: scale(0.2); }
                50% { transform: scale(1); }
                100% { transform: scale(0.2); }
            }

            /* Transitions */
            .transition-fade {
                transition: opacity 0.4s ease;
                opacity: 1;
            }

            html.is-animating .transition-fade {
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
    }
}
function cleanup() {
    // Clean up search results if they exist
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.innerHTML = '';
    }

    // Remove search active class
    document.documentElement.classList.remove('search-active');

    // Clean up lightbox (update this part)
    if (window.lightboxCleanup) {
        window.lightboxCleanup();
    }
}