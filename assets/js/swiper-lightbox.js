document.addEventListener("DOMContentLoaded", function () {
    let swiper = null;

    function createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'swiper-lightbox';
        lightbox.style.display = 'none';
        lightbox.innerHTML = `
            <div class="swiper-container">
                <div class="swiper-wrapper"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
                <div class="swiper-pagination"></div>
                <a id="close"></a>
            </div>
        `;
        document.body.appendChild(lightbox);
        return lightbox;
    }

    // Initial setup - create lightbox and add click handlers
    const lightbox = createLightbox();

    // Add click handlers to all lightbox images
    function setupGallery() {
        const imageElements = document.querySelectorAll('a.lightbox-image');
        imageElements.forEach(element => {
            element.addEventListener("click", function (event) {
                event.preventDefault();
                openLightbox(this);
            });
        });
    }

    function openLightbox(clickedElement) {
        // Get featured image and gallery images
        const featuredImage = document.querySelector('.featured-image-container .lightbox-image');
        const galleryImages = Array.from(document.querySelectorAll('.gallery .lightbox-image'));

        // Combine images, filter out nulls
        const allImages = [featuredImage, ...galleryImages].filter(Boolean);
        const currentIndex = allImages.indexOf(clickedElement);

        // Initialize Swiper if not already done
        if (!swiper) {
            initializeSwiper(allImages);
        }

        // Show lightbox and go to correct slide
        lightbox.style.display = 'flex';
        swiper.slideTo(currentIndex, 0);

        // Add keyboard event listener
        document.addEventListener('keydown', keyboardNavigation);
    }

    function initializeSwiper(images) {
        // Clear and populate swiper wrapper
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

        // Initialize Swiper
        swiper = new Swiper(lightbox.querySelector('.swiper-container'), {
            loop: true,
            zoom: {
                maxRatio: 2,
            },
            keyboard: {
                enabled: true,
                onlyInViewport: false,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'fraction',
            }
        });
    }

    function keyboardNavigation(e) {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                swiper.slidePrev();
            } else if (e.key === 'ArrowRight') {
                swiper.slideNext();
            } else if (e.key === 'Escape') {
                closeLightbox();
            }
        }
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        document.removeEventListener('keydown', keyboardNavigation);
    }

    // Close lightbox when clicking close button or outside
    lightbox.querySelector('#close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Set up initial gallery
    setupGallery();
});