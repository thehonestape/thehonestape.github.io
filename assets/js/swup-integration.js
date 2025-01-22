document.addEventListener('DOMContentLoaded', () => {
    const isHomePage = window.location.pathname === '/' ||
        window.location.pathname === '/index.html';

    if (isHomePage && window.terminalManager) {
        window.terminalManager.initialize();
    }

    initializeSwup();
});

function initializeSwup() {
    try {
        if (typeof window.Swup === 'undefined') {
            console.warn('Swup not loaded');
            return;
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

        window.swup = swup;

        if (!isMobile()) {
            initializeMouseFollower();
        }

        if (typeof gsap !== 'undefined') {
            initializeGSAPAnimations();
        }

        setupSwupHooks(swup);
        addStyles();

    } catch (error) {
        console.warn('Error initializing Swup:', error);
    }
}

function setupSwupHooks(swup) {
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

    swup.hooks.on('content:replace', () => {
        cleanup();

        if (typeof gsap !== 'undefined') {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            }
            initializeGSAPAnimations();
        }

        if (typeof window.searchInit === 'function') {
            window.searchInit();
        }
        if (typeof window.searchInitListener === 'function') {
            window.searchInitListener();
        }

        if (window.initializeLightbox) {
            window.initializeLightbox();
        }

        const isHomePage = window.location.pathname === '/' ||
            window.location.pathname === '/index.html';
        if (isHomePage && window.terminalManager) {
            window.terminalManager.initialize();
        }
    });

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
        gsap.registerPlugin(ScrollTrigger, TextPlugin);
        initializeScrollAnimations();
    } catch (error) {
        console.warn('Error initializing GSAP:', error);
    }
}

function initializeScrollAnimations() {
    const featuredArticles = gsap.utils.toArray('#featured-notes .list-feed');

    featuredArticles.forEach((article) => {
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
            once: true
        });
    });

    const cards = gsap.utils.toArray('.card');
    cards.forEach((card) => {
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

                gsap.set(card, { visibility: 'visible' });
                gsap.set([elements.container, elements.image, elements.title, elements.tags], {
                    opacity: 0
                });
                gsap.set(elements.image, {
                    scale: 1.1,
                    filter: "blur(15px) brightness(1.2)"
                });

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

function initializeMouseFollower() {
    if (typeof MouseFollower === 'undefined') return;

    try {
        if (window.cursor) {
            window.cursor.destroy();
            window.cursor = null;
        }

        window.cursor = new MouseFollower({
            container: document.body,
            speed: 0.55,
            skewing: 0,           // Reduce skewing to prevent drift
            ease: 'expo.out',
            className: 'mf-cursor',
            stateDetection: {
                '-active': 'a,button',
                '-loading': '[data-loading]'
            },
            hideOnLeave: true,    // Hide when leaving window
            hideOnStop: false,    // Don't hide when stopping
            initTimeout: 1        // Quick initialization
        });

        // Force cursor to follow mouse
        document.addEventListener('mousemove', () => {
            if (window.cursor?.el?.classList.contains('-loading')) {
                window.cursor.el.style.opacity = '1';
            }
        });

    } catch (error) {
        console.warn('Error initializing MouseFollower:', error);
    }
}

// Update Swup hooks
swup.hooks.on('visit:start', () => {
    const content = document.querySelector('#swup');
    gsap.to(content, {
        duration: 0.4,
        opacity: 0,
        ease: "expo.in"
    });

    if (window.cursor?.el) {
        window.cursor.el.classList.add('-loading');
        // Force cursor visibility and centered position
        window.cursor.el.style.opacity = '1';
        window.cursor.el.style.transform = 'translate(-50%, -50%)';
    }
});

swup.hooks.on('visit:end', () => {
    const content = document.querySelector('#swup');
    gsap.to(content, {
        duration: 0.5,
        opacity: 1,
        ease: "expo.out",
        delay: 0.1
    });

    if (window.cursor?.el) {
        window.cursor.el.classList.remove('-loading');
        // Reset cursor position to current mouse position
        const event = new MouseEvent('mousemove', {
            clientX: window.innerWidth / 2,
            clientY: window.innerHeight / 2
        });
        document.dispatchEvent(event);
    }
});

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.matchMedia("(max-width: 768px)").matches;
}

function addStyles() {
    if (!document.querySelector('#animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            .card, .list-feed {
                position: relative;
                overflow: hidden;
                visibility: hidden;
                will-change: transform, opacity;
            }

            .card *, .list-feed * {
                backface-visibility: hidden;
            }

            .blog-roll-image, .card-image {
                will-change: transform, opacity, filter;
            }

            .title span, .content span {
                will-change: transform, opacity, filter;
            }

            .swiper-lightbox {
                z-index: 100;
            }

            .mf-cursor {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 100;
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
                transform: scale(0.3);
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
                opacity: 1 !important;  // Force visibility during loading
            }

            @media (hover: none) and (pointer: coarse), (max-width: 768px) {
                .mf-cursor {
                    display: none !important;
                }
            }

            @keyframes cursorLoad {
                0% { transform: scale(0.2); }
                50% { transform: scale(1); }
                100% { transform: scale(0.2); }
            }

            .transition-fade {
                transition: opacity 0.4s ease;
                opacity: 1;
            }

            html.is-animating .transition-fade {
                opacity: 0;
            }
            @keyframes cursorLoad {
                0% { transform: scale(0.2); }
                50% { transform: scale(1); }
                100% { transform: scale(0.2); }
            }

            html.is-changing .mf-cursor {
                opacity: 1 !important;
                pointer-events: none;
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

    if (window.lightboxCleanup) {
        window.lightboxCleanup();
    }
}