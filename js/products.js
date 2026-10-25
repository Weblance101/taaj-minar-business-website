/**
 * TAJ MINAR & TAJ SALES - Product Catalog Dynamic List View Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('productsCatalogGrid')) return;

    let activeCategory = 'all';
    let activeSubcategory = 'all';
    let searchQuery = '';
    let sortOption = 'featured';

    const categoryListContainer = document.getElementById('sidebarCategoryList');
    const subcategoryGroup = document.getElementById('sidebarSubcategoryGroup');
    const subcategorySelect = document.getElementById('sidebarSubcategorySelect');
    const searchInput = document.getElementById('catalogSearchInput');
    const sortSelect = document.getElementById('catalogSortSelect');
    const gridContainer = document.getElementById('productsCatalogGrid');
    const resultsCount = document.getElementById('catalogResultsCount');

    // Parse URL params for pre-filtered category (e.g. products.html?category=minars)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('category')) {
        activeCategory = urlParams.get('category');
    }

    renderCategorySidebar();
    applyFiltersAndRender();

    // Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            applyFiltersAndRender();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortOption = e.target.value;
            applyFiltersAndRender();
        });
    }

    if (subcategorySelect) {
        subcategorySelect.addEventListener('change', (e) => {
            activeSubcategory = e.target.value;
            applyFiltersAndRender();
        });
    }

    // Render Sidebar Categories
    function renderCategorySidebar() {
        if (!categoryListContainer || typeof PRODUCT_CATEGORIES === 'undefined') return;

        let html = `
        <div class="category-list-item ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">
            <span>All Categories</span>
            <span class="category-count">${PRODUCTS_DATA.length}</span>
        </div>`;

        PRODUCT_CATEGORIES.forEach(cat => {
            const count = PRODUCTS_DATA.filter(p => p.category.toLowerCase() === cat.name.toLowerCase() || cat.id === activeCategory).length;
            const isSelected = activeCategory === cat.id || activeCategory === cat.name.toLowerCase();

            html += `
            <div class="category-list-item ${isSelected ? 'active' : ''}" data-cat="${cat.id}">
                <span>${cat.name}</span>
                <span class="category-count">${count}</span>
            </div>`;
        });

        categoryListContainer.innerHTML = html;

        // Click Handler
        categoryListContainer.querySelectorAll('.category-list-item').forEach(item => {
            item.addEventListener('click', () => {
                categoryListContainer.querySelectorAll('.category-list-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');

                activeCategory = item.getAttribute('data-cat');
                activeSubcategory = 'all';
                updateSubcategoryDropdown();
                applyFiltersAndRender();
            });
        });

        updateSubcategoryDropdown();
    }

    // Update Subcategories Dropdown
    function updateSubcategoryDropdown() {
        if (!subcategorySelect || !subcategoryGroup) return;

        if (activeCategory === 'all') {
            subcategoryGroup.style.display = 'none';
            return;
        }

        const catObj = PRODUCT_CATEGORIES.find(c => c.id === activeCategory || c.name.toLowerCase() === activeCategory.toLowerCase());
        if (!catObj || !catObj.subcategories || catObj.subcategories.length === 0) {
            subcategoryGroup.style.display = 'none';
            return;
        }

        let options = '<option value="all">All Subcategories</option>';
        catObj.subcategories.forEach(sub => {
            options += `<option value="${sub}" ${activeSubcategory === sub ? 'selected' : ''}>${sub}</option>`;
        });
        subcategorySelect.innerHTML = options;
        subcategoryGroup.style.display = 'block';
    }

    // Apply Filters & Render Professional List View
    function applyFiltersAndRender() {
        if (!gridContainer || typeof PRODUCTS_DATA === 'undefined') return;

        let filtered = PRODUCTS_DATA.filter(p => {
            // Category Filter
            let matchCat = true;
            if (activeCategory !== 'all') {
                const catObj = PRODUCT_CATEGORIES.find(c => c.id === activeCategory);
                const targetCatName = catObj ? catObj.name.toLowerCase() : activeCategory.toLowerCase();
                matchCat = p.category.toLowerCase() === targetCatName;
            }

            // Subcategory Filter
            let matchSub = true;
            if (activeSubcategory !== 'all') {
                matchSub = p.subcategory.toLowerCase() === activeSubcategory.toLowerCase();
            }

            // Search Query
            let matchSearch = true;
            if (searchQuery !== '') {
                matchSearch = p.name.toLowerCase().includes(searchQuery) ||
                              p.category.toLowerCase().includes(searchQuery) ||
                              p.subcategory.toLowerCase().includes(searchQuery) ||
                              p.shortDesc.toLowerCase().includes(searchQuery);
            }

            return matchCat && matchSub && matchSearch;
        });

        // Sorting
        if (sortOption === 'az') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'za') {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortOption === 'featured') {
            filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }

        // Update Results Count
        if (resultsCount) {
            resultsCount.textContent = `Showing ${filtered.length} Architectural Products`;
        }

        // Render List Items
        if (filtered.length === 0) {
            gridContainer.innerHTML = `
            <div class="col-12 text-center py-5 bg-white border rounded">
                <h4 class="text-muted">No products match your search criteria.</h4>
                <p class="text-secondary small mb-3">Try searching for different terms or reset your filters.</p>
                <button class="btn btn-taj-gold btn-sm" onclick="location.reload();">Reset All Filters</button>
            </div>`;
            return;
        }

        let html = '<div class="product-list-container">';
        filtered.forEach(p => {
            const waLink = buildWhatsAppLink(p.name);
            
            // Build Thumbnail Bar
            let thumbBarHtml = '';
            p.images.forEach((img, idx) => {
                thumbBarHtml += `<img src="${img}" class="${idx === 0 ? 'active' : ''}" data-main-target="main_img_${p.id}" alt="${p.name} Angle ${idx + 1}">`;
            });

            html += `
            <div class="product-list-item">
                <!-- Left Image Box with Thumbnails -->
                <div class="product-list-image-box">
                    <img src="${p.images[0]}" id="main_img_${p.id}" class="product-list-main-img" alt="${p.name}">
                    <div class="product-list-thumb-bar">
                        ${thumbBarHtml}
                    </div>
                </div>

                <!-- Right Information Details -->
                <div class="product-list-details">
                    <div class="product-list-badges">
                        <span class="product-list-badge">${p.category}</span>
                        // <span class="product-list-badge">${p.subcategory}</span>
                    </div>

                    <h3 class="product-list-title">${p.name}</h3>
                    <p class="product-list-desc">${p.shortDesc}</p>

                    <div class="product-list-specs">
                        <span><strong>Material:</strong> ${p.material || 'Architectural Grade'}</span>
                        <span><strong>Height/Size:</strong> ${p.height || 'Customizable'}</span>
                        <span><strong>Finish:</strong> ${p.finish || 'Weather-proof'}</span>
                    </div>

                    <div class="product-list-actions">
                        <a href="product-detail.html?id=${p.id}" class="btn btn-taj-gold btn-sm">View Specifications</a>
                        <a href="${waLink}" target="_blank" class="btn btn-whatsapp btn-sm">Enquire on WhatsApp</a>
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';

        gridContainer.innerHTML = html;

        // Add Thumbnail Switcher Listeners for List Items
        gridContainer.querySelectorAll('.product-list-thumb-bar img').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const targetId = thumb.getAttribute('data-main-target');
                const mainImg = document.getElementById(targetId);
                if (mainImg) {
                    mainImg.src = thumb.src;
                    thumb.parentElement.querySelectorAll('img').forEach(img => img.classList.remove('active'));
                    thumb.classList.add('active');
                }
            });
        });
    }
});
