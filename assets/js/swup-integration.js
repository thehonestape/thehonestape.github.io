document.addEventListener('DOMContentLoaded', () => {
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
            plugins: [
                new window.SwupHeadPlugin({
                    persistAssets: true,
                    persistTags: ['style', 'link[rel="stylesheet"]']
                }),
                new window.SwupProgressPlugin(),
                new window.SwupPreloadPlugin(),
                new window.SwupSlideTheme()
            ]
        });

        // Clean up cursor before transition starts
        swup.hooks.on('visit:start', () => {
            if (window.cursor) {
                window.cursor.destroy();
                window.cursor = null;
            }
        });

        // Initial load
        const isInitialHomePage = window.location.pathname === '/' ||
            window.location.pathname === '/index.html';
        if (isInitialHomePage && window.terminalManager) {
            window.terminalManager.initialize();
        }
        initializeMouseFollower();

        // After content is replaced
        swup.hooks.on('content:replace', () => {
            cleanup();

            if (typeof window.searchInit === 'function') {
                searchInit();
            }
            if (typeof window.searchInitListener === 'function') {
                searchInitListener();
            }

            const isHomePage = window.location.pathname === '/' ||
                window.location.pathname === '/index.html';
            if (isHomePage && window.terminalManager) {
                window.terminalManager.initialize();
            }
            initializeMouseFollower();
        });

    } catch (error) {
        console.warn('Error initializing Swup:', error);
    }
}

function initializeMouseFollower() {
    if (typeof MouseFollower === 'undefined' || window.cursor) return;
    try {
        // Add styles that work with MouseFollower's classes
        const style = document.createElement('style');
        style.textContent = `
            .mf-cursor {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9999;
                contain: layout style size;
                pointer-events: none;
                will-change: transform;
                mix-blend-mode: lighten;
                visibility: visible !important;
                opacity: 1 !important;
            }

            .mf-cursor::before {
                content: "";
                position: absolute;
                top: -50px;
                left: -50px;
                display: block;
                width: 100px;
                height: 100px;
                transform: scale(0.2);
                background: rgba(255, 255, 255, 1);
                border-radius: 50%;
                transition: transform 0.25s ease-in-out, background 0.25s ease-in-out;
                border: 1px solid var(--color-border-light);


            }

            .mf-cursor.-active::before {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid var(--color-border-light);
                transform: scale(1);

            }

            .mf-cursor.-mousedown::before {
                transform: scale(0.7);
                transition-duration: 0.1s;
            }

            .mf-cursor.-loading::before {
                animation: cursorLoad 0.8s ease-in-out infinite !important;
            }

            @keyframes cursorLoad {
                0% { transform: scale(0.2); }
                50% { transform: scale(1); }
                100% { transform: scale(0.2); }
            }
        `;
        document.head.appendChild(style);

        // Store last known position
        let lastX = 0;
        let lastY = 0;

        // Update position tracker
        document.addEventListener('mousemove', (e) => {
            lastX = e.clientX;
            lastY = e.clientY;
        });

        // Initialize with GSAP override
        gsap.config({
            force3D: true,
            nullTargetWarn: false,
        });

        window.cursor = new MouseFollower({
            container: document.body,
            speed: 0.55,
            ease: 'expo.out',
            hideNativeCursor: false,
            stateDetection: {
                '-active': 'a,button'
            },
            overwrite: true
        });

        // Handle mousedown/up states
        document.addEventListener('mousedown', (e) => {
            if (e.target.closest('a,button') && window.cursor) {
                window.cursor.el.classList.add('-mousedown');
                if (e.target.closest('[data-swup]')) {
                    window.cursor.el.classList.add('-loading');
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (window.cursor) {
                window.cursor.el.classList.remove('-mousedown');
            }
        });

        // Swup events
        document.addEventListener('swup:animationOutStart', () => {
            if (window.cursor?.el) {
                window.cursor.el.classList.add('-loading');
            }
        });

        document.addEventListener('swup:animationOutDone', () => {
            if (window.cursor?.el) {
                const currentTransform = window.cursor.el.style.transform;
                window.cursor.el.classList.add('-loading');
                window.cursor.el.style.transform = currentTransform;
                gsap.set(window.cursor.el, { clearProps: "none" });
            }
        });

        document.addEventListener('swup:animationInDone', () => {
            if (window.cursor?.el) {
                window.cursor.el.classList.remove('-loading');
                window.cursor.setPosition(lastX, lastY);
            }
        });

        // Add loading class when navigation starts
        document.addEventListener('click', (e) => {
            const swupLink = e.target.closest('[data-swup]');
            if (swupLink && window.cursor?.el) {
                window.cursor.el.classList.add('-loading');
            }
        });

    } catch (error) {
        console.warn('Error initializing MouseFollower:', error);
    }
}

function cleanup() {
    if (window.cursor) {
        window.cursor.destroy();
        window.cursor = null;
    }

    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.innerHTML = '';
    }
    document.documentElement.classList.remove('search-active');

    const lightbox = document.querySelector('.swiper-lightbox');
    if (lightbox) lightbox.remove();
}