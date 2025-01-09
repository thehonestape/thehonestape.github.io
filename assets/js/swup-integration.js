document.addEventListener('DOMContentLoaded', () => {
    initializeSwup();
});

function initializeSwup() {
    try {
        if (typeof window.Swup === 'undefined') {
            console.warn('Swup not loaded');
            return;
        }

        // Initialize cursor first
        if (!window.cursor) {
            initializeMouseFollower();
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

        // Force cursor reset on transition start
        swup.hooks.on('visit:start', () => {
            if (window.cursor) {
                // Destroy and recreate cursor to force a clean state
                window.cursor.destroy();
                window.cursor = null;
                initializeMouseFollower();

                if (window.cursor?.el) {
                    window.cursor.el.classList.add('-loading');
                }
            }
        });

        // Clean up other components during content replacement
        swup.hooks.on('content:replace', () => {
            const searchResults = document.getElementById('search-results');
            if (searchResults) {
                searchResults.innerHTML = '';
            }
            document.documentElement.classList.remove('search-active');

            const lightbox = document.querySelector('.swiper-lightbox');
            if (lightbox) lightbox.remove();

            // Reinitialize other components
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

        // Reset cursor after transition
        swup.hooks.on('visit:end', () => {
            if (!window.cursor) {
                initializeMouseFollower();
            }

            if (window.cursor?.el) {
                window.cursor.el.classList.remove('-loading');
            }
        });

    } catch (error) {
        console.warn('Error initializing Swup:', error);
    }
}

function initializeMouseFollower() {
    if (typeof MouseFollower === 'undefined') return;

    try {
        // Add styles that work with MouseFollower's classes
        // Check if device is mobile
        const isMobile = () => {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                window.matchMedia("(max-width: 768px)").matches;
        };

        // Don't initialize on mobile
        if (isMobile()) {
            if (window.cursor) {
                window.cursor.destroy();
                window.cursor = null;
            }
            return;
        }

        if (!document.querySelector('#mouse-follower-styles')) {
            const style = document.createElement('style');
            style.id = 'mouse-follower-styles';
            style.textContent = `
                /* Hide cursor on mobile/touch devices */
                @media (hover: none) and (pointer: coarse) {
                    .mf-cursor {
                        display: none !important;
                    }
                }
                
                @media (max-width: 768px) {
                    .mf-cursor {
                        display: none !important;
                    }
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
                    display: block;
                    width: 100px;
                    height: 100px;
                    transform: scale(0.2);
                    background: rgba(255, 255, 255, 1);
                    border-radius: 50%;
                    border: 1px solid var(--color-border-light);
                }

                .mf-cursor.-active::before {
                    background: rgba(255, 255, 255, 0);
                    border: 2px solid var(--color-border-light);
                    transform: scale(1);
                }

                .mf-cursor.-loading::before {
                    animation: cursorLoad 1s ease-in-out infinite;
                    background: rgba(255, 255, 255, 0);
                    border: 2px solid var(--color-border-light);
                }

                @keyframes cursorLoad {
                    0% { transform: scale(0.2); }
                    50% { transform: scale(1); }
                    100% { transform: scale(0.2); }
                }

                html.is-changing .mf-cursor {
                    opacity: 1 !important;
                }
            `;
            document.head.appendChild(style);
        }

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