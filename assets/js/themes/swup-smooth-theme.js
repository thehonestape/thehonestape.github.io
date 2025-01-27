(function () {
    if (typeof window.Swup === 'undefined') {
        console.error('Swup not loaded');
        return;
    }

    const theme = {
        name: 'SwupSmoothTheme',
        mount() {
            this.applyStyles();
            this.swup.hooks.on('animation:out:start', this.startAnimationOut.bind(this));
            this.swup.hooks.on('animation:in:start', this.startAnimationIn.bind(this));
        },

        applyStyles() {
            if (!document.getElementById('swup-smooth-theme-styles')) {
                const style = document.createElement('style');
                style.id = 'swup-smooth-theme-styles';
                style.textContent = `
                    .swup-transition-page {
                        mix-blend-mode: normal;
                        transform-origin: 50% 50%;
                        will-change: transform, opacity, filter;
                    }
                    
                    .swup-transition-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 999;
                        pointer-events: none;
                        mix-blend-mode: overlay;
                        background: radial-gradient(
                            circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                            rgba(255,255,255,0.03) 0%,
                            rgba(0,0,0,0.01) 100%
                        );
                    }

                    html.is-changing {
                        scrollbar-width: none;
                    }
                    html.is-changing::-webkit-scrollbar {
                        display: none;
                    }
                `;
                document.head.appendChild(style);
            }

            document.addEventListener('mousemove', (e) => {
                document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
                document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
            });
        },

        async startAnimationOut() {
            const page = document.querySelector('#swup');
            const nextPath = this.swup.getCurrentUrl()?.path;
            const isGoingHome = nextPath === '/' || nextPath === '/index.html';
            const goingBack = window.history.state?.direction === 'back' || isGoingHome;

            const overlay = document.createElement('div');
            overlay.className = 'swup-transition-overlay';
            document.body.appendChild(overlay);

            const tl = gsap.timeline({
                defaults: {
                    ease: "power1.inOut",
                    duration: 0.25
                }
            });

            tl.to(page, {
                opacity: 0,
                scale: 0.995,
                filter: 'brightness(1.02) contrast(0.98)',
                transformOrigin: goingBack ? "50% 48%" : "50% 52%"
            })
                .to(overlay, {
                    backdropFilter: "blur(4px)",
                    duration: 0.2
                }, "<");

            await tl.play();
        },

        async startAnimationIn() {
            const page = document.querySelector('#swup');
            const overlay = document.querySelector('.swup-transition-overlay');
            const currentPath = window.location.pathname;
            const isHomePage = currentPath === '/' || currentPath === '/index.html';
            const goingBack = window.history.state?.direction === 'back' || isHomePage;

            gsap.set(page, {
                opacity: 0,
                scale: 0.995,
                filter: 'brightness(1.02) contrast(0.98)',
                transformOrigin: goingBack ? "50% 52%" : "50% 48%"
            });

            const tl = gsap.timeline({
                defaults: {
                    ease: "power1.out",
                    duration: 0.25
                }
            });

            tl.to(page, {
                opacity: 1,
                scale: 1,
                filter: 'brightness(1) contrast(1)',
                transformOrigin: "50% 50%"
            })
                .to(overlay, {
                    backdropFilter: "blur(0px)",
                    duration: 0.2,
                    onComplete: () => overlay.remove()
                }, "<");

            await tl.play();
        },

        unmount() {
            const style = document.getElementById('swup-smooth-theme-styles');
            if (style) {
                style.remove();
            }
        }
    };

    // Update history state to include direction
    const originalPushState = window.history.pushState;
    window.history.pushState = function () {
        const state = arguments[0] || {};
        const nextPath = new URL(arguments[2], window.location.origin).pathname;
        state.direction = (nextPath === '/' || nextPath === '/index.html') ? 'back' : 'forward';
        arguments[0] = state;
        return originalPushState.apply(this, arguments);
    };

    window.addEventListener('popstate', function (event) {
        if (event.state) {
            const currentPath = window.location.pathname;
            event.state.direction = (currentPath === '/' || currentPath === '/index.html') ? 'back' : 'back';
        }
    });

    window.SwupSmoothTheme = function () {
        return {
            ...theme,
            isSwupPlugin: true
        };
    };
})();