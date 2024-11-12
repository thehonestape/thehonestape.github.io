document.addEventListener("DOMContentLoaded", function () {
    let swiper = null;

    function createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'swiper-lightbox';
        lightbox.innerHTML = `
            <div class="swiper-container">
                <div class="swiper-wrapper"></div>
                <div class="swiper-pagination"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
                <button class="swiper-close"></button>
            </div>
        `;
        document.body.appendChild(lightbox);
        return lightbox;
    }

    function initializeSwiper(images, startIndex) {
        const lightbox = document.querySelector('.swiper-lightbox') || createLightbox();
        const swiperWrapper = lightbox.querySelector('.swiper-wrapper');

        if (swiper) {
            swiper.destroy(true, true);
            swiper = null;
        }

        swiperWrapper.innerHTML = '';

        images.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="carousel-wrapper">
                    <div class="swiper-zoom-container">
                        <img src="${img.href}" alt="${img.title || ''}">
                    </div>
                    <div class="carousel-caption">${img.title || ''}</div>
                </div>
            `;
            swiperWrapper.appendChild(slide);
        });

        lightbox.style.display = 'block';
        void lightbox.offsetWidth;
        lightbox.classList.add('is-active');

        swiper = new Swiper(lightbox.querySelector('.swiper-container'), {
            slidesPerView: 'auto',
            centeredSlides: true,
            spaceBetween: 30,
            initialSlide: startIndex,
            loop: true,
            zoom: {
                maxRatio: 3,
                minRatio: 1,
                toggle: true
            },
            keyboard: { enabled: true },
            navigation: {
                nextEl: '.swiper-button-prev',
                prevEl: '.swiper-button-next'
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'progressbar'
            },
            speed: 600,
            grabCursor: true,
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
                setTranslate: function () {
                    const slides = this.slides;
                    for (let i = 0; i < slides.length; i++) {
                        const slide = slides[i];
                        const progress = slide.progress;
                        const scale = 1 - Math.min(Math.abs(progress * 0.15), 1);

                        slide.style.transform = `scale(${scale})`;
                        slide.style.zIndex = slides.length - Math.abs(Math.round(progress));
                    }
                },
                setTransition: function (speed) {
                    const slides = this.slides;
                    for (let i = 0; i < slides.length; i++) {
                        slides[i].style.transition = `${speed}ms`;
                    }
                }
            }
        });

        lightbox.querySelector('.swiper-close').onclick = closeLightbox;
    }

    function closeLightbox() {
        const lightbox = document.querySelector('.swiper-lightbox');
        if (lightbox) {
            lightbox.classList.remove('is-active');
            setTimeout(() => {
                lightbox.style.display = 'none';
                if (swiper) {
                    swiper.destroy(true, true);
                    swiper = null;
                }
            }, 300);
        }
    }

    document.addEventListener('click', function (e) {
        const clickedImage = e.target.closest('a.lightbox-image');
        if (!clickedImage) return;

        e.preventDefault();
        const featuredImage = document.querySelector('.featured-image-container .lightbox-image');
        const galleryImages = Array.from(document.querySelectorAll('a.lightbox-image'))
            .filter(img => img !== featuredImage);
        const allImages = featuredImage ? [featuredImage, ...galleryImages] : galleryImages;
        const startIndex = allImages.indexOf(clickedImage);

        initializeSwiper(allImages, startIndex);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });
});