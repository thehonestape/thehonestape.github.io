document.addEventListener("DOMContentLoaded", function () {
    let swiper = null;

    function createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'swiper-lightbox';
        lightbox.innerHTML = `
             <div class="swiper-container">
            <div class="swiper-wrapper"></div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-prev">
                <i class="fa-sharp fa-2xl fa-light fa-arrow-left-long"></i>
            </div>
            <div class="swiper-button-next">
                <i class="fa-sharp fa-2xl fa-light fa-arrow-right-long"></i>
            </div>
            <button class="swiper-close"></button>
        </div>
        `;
        document.body.appendChild(lightbox);
        return lightbox;
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

    function initializeSwiper(images, startIndex) {
        const lightbox = document.querySelector('.swiper-lightbox') || createLightbox();
        const swiperWrapper = lightbox.querySelector('.swiper-wrapper');

        // Destroy old Swiper instance if it exists
        if (swiper) {
            swiper.destroy(true, true);
            swiper = null;
        }

        // Clear existing slides
        swiperWrapper.innerHTML = '';

        // Add all images as slides
        images.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="swiper-zoom-container">
                    <img src="${img.href}" alt="${img.title || ''}">
                </div>
            `;
            swiperWrapper.appendChild(slide);
        });

        // Show lightbox with transition
        lightbox.style.display = 'block';
        // Force a reflow
        void lightbox.offsetWidth;
        lightbox.classList.add('is-active');

        // Initialize new Swiper
        swiper = new Swiper(lightbox.querySelector('.swiper-container'), {
            slidesPerView: 1.5,
            centeredSlides: true,
            spaceBetween: 30,
            initialSlide: startIndex,
            loop: true,
            zoom: {
                maxRatio: 3,
                minRatio: 1,
                toggle: true,
            },
            keyboard: {
                enabled: true,
                onlyInViewport: false,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
                hideOnClick: true
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'progressbar'
            },
            effect: 'slide',
            speed: 400,
            watchSlidesProgress: true,
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
            }
        });

        // Add close button handler
        const closeButton = lightbox.querySelector('.swiper-close');
        if (closeButton) {
            closeButton.onclick = closeLightbox;
        }
    }

    // Handle clicks on lightbox images
    document.addEventListener('click', function (e) {
        const clickedImage = e.target.closest('a.lightbox-image');
        if (!clickedImage) return;

        e.preventDefault();

        // Get featured image and gallery images
        const featuredImage = document.querySelector('.featured-image-container .lightbox-image');
        const galleryImages = Array.from(document.querySelectorAll('a.lightbox-image'))
            .filter(img => img !== featuredImage);

        const allImages = featuredImage ? [featuredImage, ...galleryImages] : galleryImages;
        const startIndex = allImages.indexOf(clickedImage);

        initializeSwiper(allImages, startIndex);
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
});