function is_youtubelink(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false;
}

function is_imagelink(url) {
    var p = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/i;
    return (url.match(p)) ? true : false;
}

function is_vimeolink(url, el) {
    var id = false;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                var response = JSON.parse(xmlhttp.responseText);
                id = response.video_id;
                console.log(id);
                el.classList.add('lightbox-vimeo');
                el.setAttribute('data-id', id);

                el.addEventListener("click", function (event) {
                    event.preventDefault();
                    openLightbox(this, 'vimeo');
                });
            }
            else if (xmlhttp.status == 400) {
                console.error('There was an error 400');
            }
            else {
                console.error('Something other than 200 was returned');
            }
        }
    };
    xmlhttp.open("GET", 'https://vimeo.com/api/oembed.json?url=' + url, true);
    xmlhttp.send();
}

function setGallery(element) {
    var galleryContainer = element.closest('.columns.is-multiline.gallery');
    if (!galleryContainer) return;

    var galleryImages = Array.from(galleryContainer.querySelectorAll('a.lightbox-image'));
    var currentIndex = galleryImages.indexOf(element);

    var lightbox = document.getElementById('lightbox');
    lightbox.classList.add('gallery');

    function navigate(delta) {
        currentIndex = (currentIndex + delta + galleryImages.length) % galleryImages.length;
        openLightbox(galleryImages[currentIndex]);
    }

    var prevButton = document.getElementById('prev');
    var nextButton = document.getElementById('next');

    prevButton.style.display = 'flex';
    nextButton.style.display = 'flex';

    prevButton.onclick = function(e) {
        e.stopPropagation();
        navigate(-1);
    };

    nextButton.onclick = function(e) {
        e.stopPropagation();
        navigate(1);
    };
}

function openLightbox(element, type = 'image') {
    var lightbox = document.getElementById('lightbox');

    if (type === 'image') {
        lightbox.innerHTML = `
            <a id="close"></a>
            <a id="next"></a>
            <a id="prev"></a>
            <div class="img" style="background: url('${element.href}') center center / contain no-repeat;">
                <img src="${element.href}" alt="${element.title}" />
            </div>
            <span>${element.title}</span>
        `;
    } else if (type === 'vimeo') {
        lightbox.innerHTML = `
            <a id="close"></a>
            <div class="videoWrapperContainer">
                <div class="videoWrapper">
                    <iframe src="https://player.vimeo.com/video/${element.getAttribute('data-id')}/?autoplay=1&byline=0&title=0&portrait=0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                </div>
            </div>
        `;
    } else if (type === 'youtube') {
        lightbox.innerHTML = `
            <a id="close"></a>
            <div class="videoWrapperContainer">
                <div class="videoWrapper">
                    <iframe src="https://www.youtube.com/embed/${element.getAttribute('data-id')}?autoplay=1&showinfo=0&rel=0" allowfullscreen></iframe>
                </div>
            </div>
        `;
    }

    lightbox.style.display = 'flex';

    // Set initial opacity to 0 and trigger reflow
    var imgElement = lightbox.querySelector('.img');
    if (imgElement) {
        imgElement.style.opacity = 0;
        void imgElement.offsetWidth;

        // Fade in the image
        imgElement.style.opacity = 1;
    }

    // Re-attach event listeners
    var closeButton = lightbox.querySelector('#close');
    if (closeButton) {
        closeButton.onclick = function (e) {
            e.stopPropagation();
            closeLightbox();
        };
    }

    lightbox.onclick = function (e) {
        if (e.target.id === 'lightbox') {
            closeLightbox();
        }
    };

    // Set up gallery navigation for images
    if (type === 'image') {
        setGallery(element);
    }

    // Add keyboard navigation
    document.addEventListener('keydown', keyboardNavigation);
}

function keyboardNavigation(e) {
    if (document.getElementById('lightbox').style.display === 'block') {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            document.getElementById('prev').click();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            document.getElementById('next').click();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeLightbox();
        }
    }
}

function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    lightbox.innerHTML = '';
    lightbox.classList.remove('gallery');
    
    // Remove keyboard event listener when closing lightbox
    document.removeEventListener('keydown', keyboardNavigation);
}

document.addEventListener("DOMContentLoaded", function () {
    var lightbox = document.getElementById('lightbox') || createLightboxElement();

    var elements = document.querySelectorAll('a');
    elements.forEach(element => {
        var url = element.getAttribute('href');
        if (url) {
            if (url.indexOf('vimeo') !== -1 && !element.classList.contains('no-lightbox')) {
                is_vimeolink(url, element);
            }
            if (is_youtubelink(url) && !element.classList.contains('no-lightbox')) {
                element.classList.add('lightbox-youtube');
                element.setAttribute('data-id', is_youtubelink(url));
            }
            if (is_imagelink(url) && !element.classList.contains('no-lightbox')) {
                element.classList.add('lightbox-image');
                var href = element.getAttribute('href');
                var filename = href.split('/').pop();
                var split = filename.split(".");
                var name = split[0];
                element.setAttribute('title', name);
            }
        }
    });

    // Add the youtube lightbox on click
    var youtubeElements = document.querySelectorAll('a.lightbox-youtube');
    youtubeElements.forEach(element => {
        element.addEventListener("click", function (event) {
            event.preventDefault();
            openLightbox(this, 'youtube');
        });
    });

    // Add the image lightbox on click
    var imageElements = document.querySelectorAll('a.lightbox-image');
    imageElements.forEach((element, index) => {
        element.addEventListener("click", function (event) {
            event.preventDefault();
            openLightbox(this, 'image');
        });
    });
});


function createLightboxElement() {
    var lightbox = document.createElement("div");
    lightbox.setAttribute('id', "lightbox");
    document.body.appendChild(lightbox);
    return lightbox;
}