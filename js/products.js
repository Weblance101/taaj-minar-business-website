
/**
 * =========================================================
 * TAJ MINAR & TAJ SALES
 * PRODUCT CATALOG - DYNAMIC LIST VIEW HANDLER
 * =========================================================
 *
 * Features:
 * 1. Dynamic category sidebar
 * 2. Category filtering
 * 3. Subcategory filtering (future-ready)
 * 4. Live product search
 * 5. Featured / A-Z / Z-A sorting
 * 6. Product image thumbnails
 * 7. WhatsApp enquiry
 * 8. URL-based category filtering
 * 9. Reset filters without page reload
 * 10. Safe handling of missing product data
 *
 * Requires:
 * data.js loaded before products.js
 */

document.addEventListener('DOMContentLoaded', () => {

    // Run only on the product catalog page
    const gridContainer = document.getElementById('productsCatalogGrid');

    if (!gridContainer) return;

    // -----------------------------------------------------
    // 1. INITIAL STATE
    // -----------------------------------------------------

    let activeCategory = 'all';
    let activeSubcategory = 'all';
    let searchQuery = '';
    let sortOption = 'featured';

    // -----------------------------------------------------
    // 2. DOM ELEMENTS
    // -----------------------------------------------------

    const categoryListContainer =
        document.getElementById('sidebarCategoryList');

    const subcategoryGroup =
        document.getElementById('sidebarSubcategoryGroup');

    const subcategorySelect =
        document.getElementById('sidebarSubcategorySelect');

    const searchInput =
        document.getElementById('catalogSearchInput');

    const sortSelect =
        document.getElementById('catalogSortSelect');

    const resultsCount =
        document.getElementById('catalogResultsCount');

    // -----------------------------------------------------
    // 3. DATA VALIDATION
    // -----------------------------------------------------

    if (
        typeof PRODUCTS_DATA === 'undefined' ||
        !Array.isArray(PRODUCTS_DATA)
    ) {
        gridContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <h4>Product data is unavailable.</h4>
                <p>Please check whether js/data.js is loaded correctly.</p>
            </div>
        `;
        return;
    }

    const products = PRODUCTS_DATA;

    const categories =
        typeof PRODUCT_CATEGORIES !== 'undefined' &&
        Array.isArray(PRODUCT_CATEGORIES)
            ? PRODUCT_CATEGORIES
            : [];

    // -----------------------------------------------------
    // 4. HELPER FUNCTIONS
    // -----------------------------------------------------

    function normalize(value) {
        return String(value ?? '')
            .toLowerCase()
            .trim();
    }

    // Prevent HTML injection in dynamically generated content
    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => {
            const entities = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };

            return entities[char];
        });
    }

    function getProductCategoryId(product) {
        return normalize(
            product.categoryId || product.category
        );
    }

    function getProductImages(product) {
        if (!Array.isArray(product.images)) return [];

        return product.images.filter(image =>
            typeof image === 'string' && image.trim() !== ''
        );
    }

    function getProductDescription(product) {
        return product.description ||
            product.shortDesc ||
            'Contact us for more product details.';
    }

    function getCategoryObject(categoryId) {
        return categories.find(category =>
            normalize(category.id) === normalize(categoryId) ||
            normalize(category.name) === normalize(categoryId) ||
            normalize(category.slug) === normalize(categoryId)
        );
    }

    function getWhatsAppLink(productName) {

        const message =
            `Hello TAJ MINAR & TAJ SALES, I am interested in ${productName}. Please share more details.`;

        if (typeof getWhatsAppUrl === 'function') {
            return getWhatsAppUrl(message);
        }

        // Fallback if the helper function is unavailable
        const number = '919800183455';

        return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    }

    // -----------------------------------------------------
    // 5. URL CATEGORY FILTER
    // -----------------------------------------------------

    function initializeURLFilters() {

        const urlParams = new URLSearchParams(
            window.location.search
        );

        const requestedCategory = urlParams.get('category');

        if (!requestedCategory) return;

        const category = getCategoryObject(requestedCategory);

        if (category) {
            activeCategory = category.id;
        }
    }

    // -----------------------------------------------------
    // 6. CATEGORY SIDEBAR
    // -----------------------------------------------------

    function renderCategorySidebar() {

        if (!categoryListContainer) return;

        const allCount = products.length;

        let html = `
            <div
                class="category-list-item ${activeCategory === 'all' ? 'active' : ''}"
                data-cat="all"
                role="button"
                tabindex="0"
            >
                <span>All Categories</span>
                <span class="category-count">${allCount}</span>
            </div>
        `;

        categories.forEach(category => {

            const count = products.filter(product =>
                getProductCategoryId(product) === normalize(category.id) ||
                normalize(product.category) === normalize(category.name)
            ).length;

            const isSelected =
                normalize(activeCategory) === normalize(category.id);

            html += `
                <div
                    class="category-list-item ${isSelected ? 'active' : ''}"
                    data-cat="${escapeHTML(category.id)}"
                    role="button"
                    tabindex="0"
                >
                    <span>${escapeHTML(category.name)}</span>
                    <span class="category-count">${count}</span>
                </div>
            `;
        });

        categoryListContainer.innerHTML = html;

        updateSubcategoryDropdown();
    }

    // -----------------------------------------------------
    // 7. CATEGORY CLICK HANDLER
    // -----------------------------------------------------

    if (categoryListContainer) {

        categoryListContainer.addEventListener('click', event => {

            const item = event.target.closest('.category-list-item');

            if (!item || !categoryListContainer.contains(item)) return;

            selectCategory(item.dataset.cat);
        });

        categoryListContainer.addEventListener('keydown', event => {

            if (event.key !== 'Enter' && event.key !== ' ') return;

            const item = event.target.closest('.category-list-item');

            if (!item) return;

            event.preventDefault();

            selectCategory(item.dataset.cat);
        });
    }

    function selectCategory(categoryId) {

        activeCategory = categoryId || 'all';
        activeSubcategory = 'all';

        if (categoryListContainer) {

            categoryListContainer
                .querySelectorAll('.category-list-item')
                .forEach(item => {

                    item.classList.toggle(
                        'active',
                        item.dataset.cat === activeCategory
                    );
                });
        }

        updateSubcategoryDropdown();
        applyFiltersAndRender();
    }

    // -----------------------------------------------------
    // 8. SUBCATEGORY DROPDOWN
    // -----------------------------------------------------

    function updateSubcategoryDropdown() {

        if (!subcategorySelect || !subcategoryGroup) return;

        if (activeCategory === 'all') {

            subcategoryGroup.style.display = 'none';
            subcategorySelect.innerHTML =
                '<option value="all">All Subcategories</option>';

            return;
        }

        const category = getCategoryObject(activeCategory);

        const subcategories =
            category && Array.isArray(category.subcategories)
                ? category.subcategories
                : [];

        if (subcategories.length === 0) {

            subcategoryGroup.style.display = 'none';

            subcategorySelect.innerHTML =
                '<option value="all">All Subcategories</option>';

            activeSubcategory = 'all';

            return;
        }

        let options = `
            <option value="all">All Subcategories</option>
        `;

        subcategories.forEach(subcategory => {

            options += `
                <option
                    value="${escapeHTML(subcategory)}"
                    ${normalize(activeSubcategory) === normalize(subcategory) ? 'selected' : ''}
                >
                    ${escapeHTML(subcategory)}
                </option>
            `;
        });

        subcategorySelect.innerHTML = options;
        subcategoryGroup.style.display = 'block';
    }

    // -----------------------------------------------------
    // 9. SEARCH EVENT
    // -----------------------------------------------------

    if (searchInput) {

        searchInput.addEventListener('input', event => {

            searchQuery = normalize(event.target.value);

            applyFiltersAndRender();
        });
    }

    // -----------------------------------------------------
    // 10. SORT EVENT
    // -----------------------------------------------------

    if (sortSelect) {

        sortSelect.addEventListener('change', event => {

            sortOption = event.target.value;

            applyFiltersAndRender();
        });
    }

    // -----------------------------------------------------
    // 11. SUBCATEGORY EVENT
    // -----------------------------------------------------

    if (subcategorySelect) {

        subcategorySelect.addEventListener('change', event => {

            activeSubcategory = event.target.value || 'all';

            applyFiltersAndRender();
        });
    }

    // -----------------------------------------------------
    // 12. PRODUCT FILTERING
    // -----------------------------------------------------

    function applyFiltersAndRender() {

        let filteredProducts = products.filter(product => {

            // Category filter
            let matchCategory = true;

            if (activeCategory !== 'all') {

                const productCategoryId = getProductCategoryId(product);

                matchCategory =
                    productCategoryId === normalize(activeCategory);
            }

            // Subcategory filter
            let matchSubcategory = true;

            if (activeSubcategory !== 'all') {

                matchSubcategory =
                    normalize(product.subcategory) ===
                    normalize(activeSubcategory);
            }

            // Search filter
            let matchSearch = true;

            if (searchQuery !== '') {

                const searchableText = [
                    product.name,
                    product.category,
                    product.categoryId,
                    product.description,
                    product.shortDesc,
                    product.subcategory,
                    product.material,
                    product.height,
                    product.finish
                ].map(normalize).join(' ');

                matchSearch = searchableText.includes(searchQuery);
            }

            return (
                matchCategory &&
                matchSubcategory &&
                matchSearch
            );
        });

        // -------------------------------------------------
        // 13. SORT PRODUCTS
        // -------------------------------------------------

        if (sortOption === 'az') {

            filteredProducts.sort((a, b) =>
                String(a.name || '').localeCompare(
                    String(b.name || '')
                )
            );

        } else if (sortOption === 'za') {

            filteredProducts.sort((a, b) =>
                String(b.name || '').localeCompare(
                    String(a.name || '')
                )
            );

        } else {

            // Featured products first
            filteredProducts.sort((a, b) =>
                Number(Boolean(b.featured)) -
                Number(Boolean(a.featured))
            );
        }

        // -------------------------------------------------
        // 14. RESULTS COUNT
        // -------------------------------------------------

        if (resultsCount) {

            resultsCount.textContent =
                `Showing ${filteredProducts.length} Architectural Products`;
        }

        // -------------------------------------------------
        // 15. EMPTY RESULTS
        // -------------------------------------------------

        if (filteredProducts.length === 0) {

            gridContainer.innerHTML = `
                <div class="col-12 text-center py-5 bg-white border rounded">

                    <h4 class="text-muted">
                        No products match your search criteria.
                    </h4>

                    <p class="text-secondary small mb-3">
                        Try searching for different terms or reset your filters.
                    </p>

                    <button
                        type="button"
                        class="btn btn-taj-gold btn-sm"
                        id="resetCatalogFilters"
                    >
                        Reset All Filters
                    </button>

                </div>
            `;

            return;
        }

        // -------------------------------------------------
        // 16. RENDER PRODUCT LIST
        // -------------------------------------------------

        let html = '<div class="product-list-container">';

        filteredProducts.forEach(product => {

            const productName = escapeHTML(product.name || 'Unnamed Product');

            const productId = encodeURIComponent(product.id || '');

            const categoryName = escapeHTML(
                product.category || 'Architectural Products'
            );

            const description = escapeHTML(
                getProductDescription(product)
            );

            const images = getProductImages(product);

            const mainImage = images.length > 0
                ? images[0]
                : 'assets/others/placeholder.webp';

            const safeMainImage = escapeHTML(mainImage);

            const waLink = escapeHTML(
                getWhatsAppLink(product.name || 'Product')
            );

            // Build thumbnail images
            let thumbBarHtml = '';

            if (images.length > 1) {

                images.forEach((image, index) => {

                    thumbBarHtml += `
                        <img
                            src="${escapeHTML(image)}"
                            class="${index === 0 ? 'active' : ''}"
                            data-main-target="main_img_${escapeHTML(product.id)}"
                            alt="${productName} Angle ${index + 1}"
                            loading="lazy"
                        >
                    `;
                });
            }

            html += `
                <div class="product-list-item">

                    <!-- Product Image -->
                    <div class="product-list-image-box">

                        <img
                            src="${safeMainImage}"
                            id="main_img_${escapeHTML(product.id)}"
                            class="product-list-main-img"
                            alt="${productName}"
                            loading="lazy"
                        >

                        <div class="product-list-thumb-bar">
                            ${thumbBarHtml}
                        </div>

                    </div>

                    <!-- Product Details -->
                    <div class="product-list-details">

                        <div class="product-list-badges">

                            <span class="product-list-badge">
                                ${categoryName}
                            </span>

                            ${product.featured ? `
                                <span class="product-list-badge">
                                    Featured
                                </span>
                            ` : ''}

                        </div>

                        <h3 class="product-list-title">
                            ${productName}
                        </h3>

                        <p class="product-list-description">
                            ${description}
                        </p>

                        <div class="product-list-actions">

                            <a
                                href="product-detail.html?id=${productId}"
                                class="btn btn-taj-gold btn-sm"
                            >
                                View Specifications
                            </a>

                            <a
                                href="${waLink}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn btn-whatsapp btn-sm"
                            >
                                Enquire on WhatsApp
                            </a>

                        </div>

                    </div>

                </div>
            `;
        });

        html += '</div>';

        gridContainer.innerHTML = html;
    }

    // -----------------------------------------------------
    // 17. THUMBNAIL SWITCHER
    // -----------------------------------------------------

    gridContainer.addEventListener('click', event => {

        const thumbnail = event.target.closest(
            '.product-list-thumb-bar img'
        );

        if (!thumbnail || !gridContainer.contains(thumbnail)) return;

        const targetId = thumbnail.dataset.mainTarget;

        const mainImage = document.getElementById(targetId);

        if (!mainImage) return;

        mainImage.src = thumbnail.src;

        const thumbnailBar = thumbnail.parentElement;

        thumbnailBar
            .querySelectorAll('img')
            .forEach(image => {
                image.classList.remove('active');
            });

        thumbnail.classList.add('active');
    });

    // -----------------------------------------------------
    // 18. RESET FILTERS
    // -----------------------------------------------------

    function resetFilters() {

        activeCategory = 'all';
        activeSubcategory = 'all';
        searchQuery = '';
        sortOption = 'featured';

        if (searchInput) {
            searchInput.value = '';
        }

        if (sortSelect) {
            sortSelect.value = 'featured';
        }

        if (subcategorySelect) {
            subcategorySelect.value = 'all';
        }

        // Remove category parameter from URL without reload
        const url = new URL(window.location.href);

        url.searchParams.delete('category');

        window.history.replaceState({}, '', url);

        renderCategorySidebar();
        applyFiltersAndRender();
    }

    // Reset button event delegation
    gridContainer.addEventListener('click', event => {

        const resetButton = event.target.closest(
            '#resetCatalogFilters'
        );

        if (!resetButton) return;

        resetFilters();
    });

    // -----------------------------------------------------
    // 19. INITIALIZE CATALOG
    // -----------------------------------------------------

    initializeURLFilters();

    if (searchInput) {
        searchQuery = normalize(searchInput.value);
    }

    if (sortSelect) {
        sortOption = sortSelect.value || 'featured';
    }

    renderCategorySidebar();

    applyFiltersAndRender();

});
