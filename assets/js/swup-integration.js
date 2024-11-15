document.addEventListener('DOMContentLoaded', () => {
    try {
        const swup = new Swup({
            containers: ['#swup'],
            animateHistoryBrowsing: true,
            cache: false,
            plugins: [
                new SwupHeadPlugin(),
                new SwupProgressPlugin()
            ]
        });

        // Cleanup function
        const cleanup = () => {
            const lightbox = document.querySelector('.swiper-lightbox');
            if (lightbox) {
                lightbox.remove();
            }
            // Reset cursor state
            const cursor = document.querySelector('.custom-cursor');
            if (cursor) {
                cursor.style.opacity = '0';
                cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
            }
        };

        // Initialize custom cursor
        const initializeCursor = () => {
            const links = document.querySelectorAll('a:has(.blog-roll-image)');
            const cursor = document.querySelector('.custom-cursor');

            if (cursor && links.length > 0) {
                // Reset cursor state first
                cursor.style.opacity = '0';
                cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';

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
        };

        swup.hooks.on('content:replace', cleanup);

        swup.hooks.on('page:view', () => {
            initializeCursor();
            const event = new Event('DOMContentLoaded');
            document.dispatchEvent(event);
        });

    } catch (error) {
        console.warn('Error initializing Swup:', error);
    }
});