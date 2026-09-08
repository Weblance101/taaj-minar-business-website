/**
 * TAJ MINAR & TAJ SALES - Dynamic Product Detail Page Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    const detailContainer = document.getElementById('productDetailContent');
    if (!detailContainer || typeof PRODUCTS_DATA === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 'minar-01'; // Default fallback

    const product = PRODUCTS_DATA.find(p => p.id === productId) || PRODUCTS_DATA[0];

    // Page Title Update
    document.title = `${product.name} | ${SITE_CONFIG.companyName}`;

    // Render Breadcrumbs
    const breadcrumbs = document.getElementById('productBreadcrumb');
    if (breadcrumbs) {
        breadcrumbs.innerHTML = `
        <li class="breadcrumb-item"><a href="index.html" class="text-gold">Home</a></li>
        <li class="breadcrumb-item"><a href="products.html" class="text-gold">Products</a></li>
        <li class="breadcrumb-item"><a href="products.html?category=${encodeURIComponent(product.category.toLowerCase())}" class="text-gold">${product.category}</a></li>
        <li class="breadcrumb-item active text-muted" aria-current="page">${product.name}</li>`;
    }

    // Render Main Product Detail Content
    let thumbnailsHtml = '';
    product.images.forEach((img, idx) => {
        thumbnailsHtml += `
        <div class="thumb-card-box ${idx === 0 ? 'active' : ''}" data-src="${img}">
            <img src="${img}" alt="${product.name} Angle ${idx + 1}">
        </div>`;
    });

    let featuresHtml = '';
    if (product.features && product.features.length) {
        featuresHtml = '<ul class="list-unstyled my-3">';
        product.features.forEach(f => {
            featuresHtml += `<li class="mb-2"><i class="fas fa-check-circle text-gold me-2"></i> ${f}</li>`;
        });
        featuresHtml += '</ul>';
    }

    const waLink = buildWhatsAppLink(product.name);

    detailContainer.innerHTML = `
    <div class="row g-4">
        <!-- Left: Image Gallery Card Box -->
        <div class="col-lg-6">
            <div class="detail-gallery-card-box">
                <div class="detail-main-img-box" id="mainDetailImgWrap">
                    <img src="${product.images[0]}" id="mainDetailImg" alt="${product.name}">
                    <span class="gallery-category-badge">${product.category}</span>
                    <div class="img-zoom-hint"><i class="fas fa-search-plus me-1"></i> Click to Enlarge</div>
                </div>
                <div class="detail-thumb-strip-box">
                    ${thumbnailsHtml}
                </div>
            </div>
        </div>

        <!-- Right: Information & Call to Action -->
        <div class="col-lg-6">
            <span class="top-header-badge mb-2 d-inline-block">${product.category} &bull; ${product.subcategory}</span>
            <h1 class="h2 font-heading text-green font-weight-bold mb-3">${product.name}</h1>
            <p class="text-secondary lead fs-6">${product.shortDesc}</p>

            <hr class="my-3 opacity-10">

            <h5 class="font-heading text-dark mt-4">Key Specifications</h5>
            <table class="product-specs-table">
                <tbody>
                    <tr><th>Material</th><td>${product.material || 'Premium Architectural Grade Material'}</td></tr>
                    <tr><th>Available Sizes / Height</th><td>${product.height || 'Customizable to specifications'}</td></tr>
                    <tr><th>Finish & Finish Options</th><td>${product.finish || 'Weather-proof Marble / Gold Details'}</td></tr>
                    <tr><th>Design Style</th><td>${product.design || 'Traditional Indo-Islamic / Mughal Architecture'}</td></tr>
                    <tr><th>Customization</th><td>${product.customization || 'Available upon request'}</td></tr>
                    <tr><th>Installation</th><td>${product.installation || 'Nationwide installation team available'}</td></tr>
                </tbody>
            </table>

            <h5 class="font-heading text-dark mt-4">Features & Highlights</h5>
            ${featuresHtml}

            <div class="d-flex flex-wrap gap-3 mt-4 pt-2">
                <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-lg px-4 fs-6">
                    <i class="fab fa-whatsapp fs-4"></i> Enquire on WhatsApp
                </a>
                <a href="contact.html?product=${encodeURIComponent(product.name)}" class="btn btn-taj-gold btn-lg px-4 fs-6">
                    <i class="fas fa-envelope"></i> Request Quotation
                </a>
            </div>
        </div>
    </div>`;

    // Thumbnail Switcher Listener
    const mainImg = document.getElementById('mainDetailImg');
    const thumbItems = document.querySelectorAll('.thumb-card-box');
    thumbItems.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbItems.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            const newSrc = thumb.getAttribute('data-src');
            if (mainImg) mainImg.src = newSrc;
        });
    });

    // Lightbox Zoom Handler
    const mainImgWrap = document.getElementById('mainDetailImgWrap');
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    if (mainImgWrap && lightboxModal) {
        mainImgWrap.addEventListener('click', () => {
            lightboxModal.classList.add('active');
            if (lightboxImg) lightboxImg.src = mainImg.src;
            if (lightboxCaption) lightboxCaption.textContent = product.name;
        });
    }

    // Render "You May Also Like" (Related Products)
    renderRelatedProducts(product);
});

function renderRelatedProducts(currentProduct) {
    const relatedContainer = document.getElementById('relatedProductsGrid');
    if (!relatedContainer || typeof PRODUCTS_DATA === 'undefined') return;

    // Select exactly 2 related products
    let related = PRODUCTS_DATA.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 2);
    if (related.length < 2) {
        // Fallback to any other products if same category has less than 2
        const extra = PRODUCTS_DATA.filter(p => p.id !== currentProduct.id && !related.includes(p)).slice(0, 2 - related.length);
        related = related.concat(extra);
    }

    if (related.length === 0) {
        relatedContainer.parentElement.style.display = 'none';
        return;
    }

    let html = '';
    related.forEach((p, idx) => {
        const waLink = buildWhatsAppLink(p.name);
        html += `
        <div class="col-md-6 mb-4">
            <div class="related-product-card-box">
                <div class="related-card-img-wrap">
                    <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
                    <span class="gallery-category-badge">${p.subcategory}</span>
                </div>
                <div class="related-card-body">
                    <h5 class="related-card-title">${p.name}</h5>
                    <p class="related-card-desc">${p.shortDesc.substring(0, 85)}...</p>
                    <div class="d-flex gap-2 mt-3 pt-2 border-top">
                        <a href="product-detail.html?id=${p.id}" class="btn btn-taj-gold btn-sm w-50">View Details</a>
                        <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-sm w-50 justify-content-center">
                            Enquire on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
    });

    relatedContainer.innerHTML = html;
}
