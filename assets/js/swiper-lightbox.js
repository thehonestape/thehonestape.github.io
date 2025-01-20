document.addEventListener("DOMContentLoaded", function () {
    let swiper = null;
    let lightbox = null;

    function createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'swiper-lightbox';
        lightbox.style.display = 'none';
        lightbox.innerHTML = `
        <div class="swiper-container">
            <div class="swiper-wrapper"></div>
            <div class="nav-areas">
                <div class="nav-area nav-left" data-cursor-text="Previous">
                    <div class="nav-arrow">
                        <i class="fa-light fa-arrow-left-long"></i>
                    </div>
                </div>
                <div class="nav-area nav-right" data-cursor-text="Next">
                    <div class="nav-arrow">
                        <i class="fa-light fa-arrow-right-long"></i>
                    </div>
                </div>
            </div>
            <button class="close-button" data-cursor-text="Close">
                <i class="fa-light fa-xmark"></i>
            </button>
        </div>
    `;
        document.body.appendChild(lightbox);
        return lightbox;
    }

    function setupGallery() {
        const imageElements = document.querySelectorAll('a.lightbox-image');
        imageElements.forEach(element => {
            element.setAttribute('data-cursor-text', 'View Gallery');
            element.addEventListener("click", function (event) {
                event.preventDefault();
                openLightbox(this);
            });
        });
    }

    function openLightbox(clickedElement) {
        const featuredImage = document.querySelector('.featured-image-container .lightbox-image');
        const galleryImages = Array.from(document.querySelectorAll('.gallery .lightbox-image'));
        const allImages = [featuredImage, ...galleryImages].filter(Boolean);
        const currentIndex = allImages.indexOf(clickedElement);

        if (!swiper) {
            initializeSwiper(allImages);
        }

        lightbox.style.display = 'flex';
        gsap.fromTo(lightbox,
            {
                opacity: 0,
                filter: "blur(10px)"
            },
            {
                duration: 0.4,
                opacity: 1,
                filter: "blur(0px)",
                ease: "power2.out"
            }
        );

        swiper.slideTo(currentIndex, 0);
        document.addEventListener('keydown', keyboardNavigation);
    }

    function initializeSwiper(images) {
        if (!images || images.length === 0) {
            console.warn('No images to initialize Swiper with');
            return;
        }

        const swiperWrapper = lightbox.querySelector('.swiper-wrapper');
        swiperWrapper.innerHTML = '';

        images.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="swiper-zoom-container">
                    <img src="${img.href}" alt="${img.title || ''}" />
                </div>
            `;
            swiperWrapper.appendChild(slide);
        });

        swiper = new Swiper(lightbox.querySelector('.swiper-container'), {
            slidesPerView: 1.5,
            centeredSlides: true,
            spaceBetween: 30,
            loop: true,
            zoom: {
                maxRatio: 3,
                minRatio: 1,
                toggle: true,
                containerClass: 'swiper-zoom-container',
                zoomedSlideClass: 'swiper-slide-zoomed'
            },
            keyboard: {
                enabled: true,
                onlyInViewport: false,
            },
            speed: 400,
            touchRatio: 1,
            touchAngle: 45,
            grabCursor: true,
            resistance: true,
            resistanceRatio: 0.65,
            touchStartPreventDefault: false,
            touchMoveStopPropagation: true,
            watchSlidesProgress: true,
            touchEventsTarget: 'container',
            passiveListeners: true,
            touchReleaseOnEdges: true,
            breakpoints: {
                320: {
                    slidesPerView: 1.2,
                    spaceBetween: 10
                },
                640: {
                    slidesPerView: 1.5,
                    spaceBetween: 20
                }
            },
            on: {
                slideChange: function () {
                    const activeSlide = this.slides[this.activeIndex];
                    gsap.fromTo(activeSlide,
                        {
                            opacity: 0.8,
                            scale: 1.02,
                            filter: "blur(5px)"
                        },
                        {
                            duration: 0.4,
                            opacity: 1,
                            scale: 1,
                            filter: "blur(0px)",
                            ease: "power2.out"
                        }
                    );
                }
            }
        });

        setupLightboxControls();
    }

    function setupLightboxControls() {
        const navLeft = lightbox.querySelector('.nav-left');
        const navRight = lightbox.querySelector('.nav-right');
        const closeButton = lightbox.querySelector('.close-button');

        [navLeft, navRight, closeButton].forEach(el => {
            const icon = el.querySelector('i');
            if (!icon) return;

            el.addEventListener('mouseenter', () => {
                if (window.cursor) {
                    window.cursor.setSkewing(0);
                    window.cursor.setState('-sticky');
                }
                gsap.to(icon, {
                    scale: 1.2,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            el.addEventListener('mouseleave', () => {
                if (window.cursor) {
                    window.cursor.removeState('-sticky');
                    window.cursor.setSkewing(1);
                }
                gsap.to(icon, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        navLeft.addEventListener('click', () => swiper?.slidePrev());
        navRight.addEventListener('click', () => swiper?.slideNext());
        closeButton.addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    function keyboardNavigation(e) {
        if (lightbox?.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                swiper?.slidePrev();
            } else if (e.key === 'ArrowRight') {
                swiper?.slideNext();
            } else if (e.key === 'Escape') {
                closeLightbox();
            }
        }
    }

    function closeLightbox() {
        gsap.to(lightbox, {
            duration: 0.3,
            opacity: 0,
            filter: "blur(10px)",
            ease: "power2.in",
            onComplete: () => {
                lightbox.style.display = 'none';
                document.removeEventListener('keydown', keyboardNavigation);
            }
        });
    }

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .swiper-lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 100;
            will-change: transform, opacity, filter;
        }

        .swiper-container {
            height: 100%;
            z-index: 2;
        }

        .nav-areas {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: space-between;
            pointer-events: none;
            z-index: 1;
        }

        .nav-area {
            flex: 0 0 20%;
            pointer-events: auto;
        }

        .nav-area.nav-left {
            margin-right: auto;
        }
        
        .nav-area.nav-right {
            margin-left: auto;
        }

        .nav-arrow {
            position: fixed;
            top: 50%;
            transform: translateY(-50%);
            font-size: 2rem;
            color: white;
            opacity: 0.5;
            mix-blend-mode: difference;
            transition: all 0.3s ease;
            pointer-events: none;
            width: 50px;
            height: 50px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            will-change: transform, opacity;
            z-index: 3;
        }

        .nav-left .nav-arrow {
            left: 3rem;
        }

        .nav-right .nav-arrow {
            right: 3rem;
        }

        .nav-area:hover .nav-arrow {
            opacity: 1;
            border-color: rgba(255, 255, 255, 0.8);
        }

        .close-button {
            position: fixed;
            top: 2rem;
            right: 3rem;
            width: 60px;
            height: 60px;
            background: none;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            color: white;
            font-size: 2rem;
            opacity: 0.5;
            mix-blend-mode: difference;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: none;
            z-index: 4;
        }

        .close-button:hover {
            opacity: 1;
            transform: scale(1.1);
            border-color: rgba(255, 255, 255, 0.8);
        }

        .swiper-slide {
            transition: filter 0.3s ease;
            will-change: transform, filter;
            z-index: 3;
        }

        .swiper-zoom-container {
            z-index: 3;
        }
    `;
    document.head.appendChild(style);

    // Initialize on first load
    lightbox = createLightbox();
    setupGallery();

    // Add these functions for Swup integration
    window.initializeLightbox = function () {
        if (swiper) {
            swiper.destroy(true, true);
            swiper = null;
        }
        if (lightbox) {
            lightbox.remove();
            lightbox = null;
        }

        lightbox = createLightbox();
        setupGallery();
    };

    window.lightboxCleanup = function () {
        if (swiper) {
            swiper.destroy(true, true);
            swiper = null;
        }
        if (lightbox) {
            lightbox.remove();
            lightbox = null;
        }
    };
});