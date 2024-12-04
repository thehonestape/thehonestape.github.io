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


        // After content is replaced
        swup.hooks.on('content:replace', () => {
            cleanup();
            initializeComponents();

            // Reinitialize search
            if (typeof window.searchInit === 'function') {
                searchInit();
            }
            if (typeof window.searchInitListener === 'function') {
                searchInitListener();
            }

            // Check if we're on homepage and reinitialize terminal
            const isHomePage = window.location.pathname === '/' ||
                window.location.pathname === '/index.html';

            if (isHomePage) {
                initializeTerminalComponents();
            }
        });

    } catch (error) {
        console.warn('Error initializing Swup:', error);
    }
}

function initializeComponents() {
    const isHomePage = window.location.pathname === '/' ||
        window.location.pathname === '/index.html';

    if (isHomePage) {
        initializeTerminalComponents();
    }
    initializeCursor();
}

function initializeTerminalComponents() {
    const terminal = document.getElementById('terminal');
    if (!terminal) return;

    try {
        const shakeWrapper = terminal.querySelector('.terminal-wrapper');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        // Initialize drag functionality
        const header = terminal.querySelector('.terminal__header');
        if (header) {
            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        }

        // Initialize buttons
        const maxButton = terminal.querySelector('.action--max');
        const minButton = terminal.querySelector('.action--min');
        const closeButton = terminal.querySelector('.action--close');

        if (maxButton) {
            maxButton.addEventListener('click', () => {
                terminal.classList.remove('minimized');
                terminal.classList.toggle('big');
                xOffset = 0;
                yOffset = 0;
                setTranslate(0, 0, terminal);
            });
        }

        if (minButton) {
            minButton.addEventListener('click', () => {
                terminal.classList.remove('big');
                terminal.classList.toggle('minimized');
                if (!terminal.classList.contains('minimized')) {
                    setTranslate(0, 0, terminal);
                }
            });
        }

        if (closeButton && shakeWrapper) {
            closeButton.addEventListener('click', () => {
                shakeWrapper.classList.add('headShake');
                setTimeout(() => shakeWrapper.classList.remove('headShake'), 500);
            });
        }

        // Initialize terminal content
        initializeTerminal();

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, terminal);
            }
        }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        }

    } catch (error) {
        console.warn('Error initializing terminal:', error);
    }
}

function initializeCursor() {
    // Only create cursor if it doesn't exist
    if (!document.querySelector('.custom-cursor')) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
            <path d="M25 0C11.19 0 0 11.19 0 25s11.19 25 25 25 25-11.19 25-25S38.81 0 25 0m11 27.01c0 .52-.43.95-.95.95s-.95-.43-.95-.95v-9.78L15.61 35.72a.948.948 0 0 1-1.34-1.34l18.49-18.49h-9.78c-.52 0-.95-.43-.95-.95s.43-.95.95-.95h12.06c.52 0 .95.43.95.95V27Z"/>
        </svg>`;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            });
        });
    }

    const links = document.querySelectorAll('a:has(.blog-roll-image)');
    const cursor = document.querySelector('.custom-cursor');

    if (cursor && links.length > 0) {
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.style.opacity = '1';
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            });
            link.addEventListener('mouseleave', () => {
                cursor.style.opacity = '0';
                cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
            });
        });
    }
}

function cleanup() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.innerHTML = '';
    }
    document.documentElement.classList.remove('search-active');

    const lightbox = document.querySelector('.swiper-lightbox');
    if (lightbox) lightbox.remove();
}