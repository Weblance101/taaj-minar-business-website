/**
 * TAJ MINAR & TAJ SALES - Gallery 30/70 Category Filter & Lightbox Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid || typeof GALLERY_DATA === 'undefined') return;

    let currentFilter = 'ALL';
    let currentIndex = 0;

    renderGalleryNav();
    renderGallery();

    function renderGalleryNav() {
        const categories = ['ALL', 'MOSQUE', 'MINARS', 'GUMBAD', 'MARBLE WORK', 'FLOORING', 'PRODUCTS', 'INSTALLATION', 'PROJECTS'];
        const filterNav = document.getElementById('galleryFilterNav');

        if (!filterNav) return;

        let navHtml = '';
        categories.forEach(cat => {
            const count = cat === 'ALL' ? GALLERY_DATA.length : GALLERY_DATA.filter(g => g.category === cat).length;
            navHtml += `
            <div class="category-list-item ${cat === 'ALL' ? 'active' : ''}" data-filter="${cat}">
                <span>${cat}</span>
                <span class="category-count">${count}</span>
            </div>`;
        });
        filterNav.innerHTML = navHtml;

        filterNav.querySelectorAll('.category-list-item').forEach(item => {
            item.addEventListener('click', () => {
                filterNav.querySelectorAll('.category-list-item').forEach(b => b.classList.remove('active'));
                item.classList.add('active');
                currentFilter = item.getAttribute('data-filter');
                renderGallery();
            });
        });
    }

    function renderGallery() {
        let filtered = GALLERY_DATA;
        if (currentFilter !== 'ALL') {
            filtered = GALLERY_DATA.filter(g => g.category === currentFilter);
        }

        if (filtered.length === 0) {
            galleryGrid.innerHTML = `
            <div class="col-12 text-center py-5 bg-white border rounded">
                <h5 class="text-muted">No images found in this category.</h5>
            </div>`;
            return;
        }

        let html = '';
        filtered.forEach((item, idx) => {
            html += `
            <div class="col-sm-6 col-md-4 col-lg-4 mb-4">
                <div class="gallery-card-box" data-idx="${idx}">
                    <div class="gallery-card-img-wrap">
                        <img src="${item.image}" alt="${item.title}" loading="lazy">
                        <span class="gallery-category-badge">${item.category}</span>
                    </div>
                    <div class="gallery-card-content">
                        <h6 class="gallery-card-title">${item.title}</h6>
                        <p class="gallery-card-desc">${item.desc}</p>
                    </div>
                </div>
            </div>`;
        });

        galleryGrid.innerHTML = html;

        // Lightbox Click Handler
        galleryGrid.querySelectorAll('.gallery-card-box').forEach(card => {
            card.addEventListener('click', () => {
                const idx = parseInt(card.getAttribute('data-idx'));
                openLightbox(filtered, idx);
            });
        });
    }

    function openLightbox(list, startIndex) {
        const lightboxModal = document.getElementById('lightboxModal');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxCaption = document.getElementById('lightboxCaption');

        if (!lightboxModal) return;

        currentIndex = startIndex;

        function updateLightboxView() {
            const currentItem = list[currentIndex];
            if (lightboxImg) lightboxImg.src = currentItem.image;
            if (lightboxCaption) lightboxCaption.textContent = `${currentItem.title} (${currentItem.category}) - ${currentItem.desc}`;
        }

        updateLightboxView();
        lightboxModal.classList.add('active');

        const prevBtn = lightboxModal.querySelector('.lightbox-prev');
        const nextBtn = lightboxModal.querySelector('.lightbox-next');
        const closeBtn = lightboxModal.querySelector('.lightbox-close');

        if (prevBtn) {
            prevBtn.onclick = () => {
                currentIndex = (currentIndex - 1 + list.length) % list.length;
                updateLightboxView();
            };
        }
        if (nextBtn) {
            nextBtn.onclick = () => {
                currentIndex = (currentIndex + 1) % list.length;
                updateLightboxView();
            };
        }
        if (closeBtn) {
            closeBtn.onclick = () => {
                lightboxModal.classList.remove('active');
            };
        }
    }
});
