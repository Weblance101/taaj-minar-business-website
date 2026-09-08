/**
 * TAJ MINAR & TAJ SALES - Master Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initStatsCounter();
    initFaqAccordion();
    initGlobalSearch();
    initBackToTop();
    initLightboxHandlers();
    initWhatsAppHelper();
});

// Header Sticky & Navigation Setup
function initHeader() {
    const navbar = document.querySelector('.navbar-taj');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Fix Dropdown auto-closing behavior on desktop hover
    const dropdowns = document.querySelectorAll('.nav-item.dropdown');
    dropdowns.forEach(dropdown => {
        let timer;
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(timer);
            const menu = dropdown.querySelector('.mega-menu-content, .dropdown-menu-standard');
            if (menu) menu.style.display = 'block';
        });
        dropdown.addEventListener('mouseleave', () => {
            timer = setTimeout(() => {
                const menu = dropdown.querySelector('.mega-menu-content, .dropdown-menu-standard');
                if (menu) menu.style.display = '';
            }, 250);
        });
    });

    // Dynamically update site header phone and whatsapp links from SITE_CONFIG
    const phoneElements = document.querySelectorAll('.site-phone-val');
    phoneElements.forEach(el => el.textContent = SITE_CONFIG.phoneNumber);

    const emailElements = document.querySelectorAll('.site-email-val');
    emailElements.forEach(el => el.textContent = SITE_CONFIG.email);

    const addressElements = document.querySelectorAll('.site-address-val');
    addressElements.forEach(el => el.textContent = SITE_CONFIG.address);
}

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (!statNumbers.length) return;

    let animated = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    let count = 0;
                    const increment = Math.ceil(target / 40);
                    const timer = setInterval(() => {
                        count += increment;
                        if (count >= target) {
                            stat.textContent = target + '+';
                            clearInterval(timer);
                        } else {
                            stat.textContent = count + '+';
                        }
                    }, 40);
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) observer.observe(statsSection);
}

// FAQ Accordion Setup
function initFaqAccordion() {
    const faqContainer = document.getElementById('faqAccordionContainer');
    if (!faqContainer || typeof FAQ_DATA === 'undefined') return;

    let html = '';
    FAQ_DATA.forEach((faq, index) => {
        const isFirst = index === 0;
        html += `
        <div class="accordion-item">
            <h2 class="accordion-header" id="faqHead${index}">
                <button class="accordion-button ${isFirst ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#faqCollapse${index}" aria-expanded="${isFirst}" aria-controls="faqCollapse${index}">
                    <i class="fas fa-question-circle text-gold me-2"></i> ${faq.question}
                </button>
            </h2>
            <div id="faqCollapse${index}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" aria-labelledby="faqHead${index}" data-bs-parent="#faqAccordionContainer">
                <div class="accordion-body text-secondary" style="font-size:14.5px;">
                    ${faq.answer}
                </div>
            </div>
        </div>`;
    });
    faqContainer.innerHTML = html;
}

// Global Search Overlay Modal
function initGlobalSearch() {
    const searchTriggerBtns = document.querySelectorAll('.trigger-global-search');
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('globalSearchInput');
    const searchResults = document.getElementById('globalSearchResults');
    const searchClose = document.getElementById('searchModalClose');

    if (!searchModal) return;

    searchTriggerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.classList.add('active');
            if (searchInput) searchInput.focus();
        });
    });

    if (searchClose) {
        searchClose.addEventListener('click', () => searchModal.classList.remove('active'));
    }

    if (searchInput && searchResults && typeof PRODUCTS_DATA !== 'undefined') {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                searchResults.innerHTML = '<p class="text-center text-muted py-3">Type at least 2 characters to search catalog...</p>';
                return;
            }

            const matches = PRODUCTS_DATA.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                p.subcategory.toLowerCase().includes(query) ||
                p.shortDesc.toLowerCase().includes(query)
            );

            if (matches.length === 0) {
                searchResults.innerHTML = '<p class="text-center text-muted py-3">No matching products found.</p>';
                return;
            }

            let html = '';
            matches.slice(0, 8).forEach(p => {
                html += `
                <a href="product-detail.html?id=${p.id}" class="search-result-item">
                    <img src="${p.images[0]}" alt="${p.name}" class="search-result-thumb">
                    <div>
                        <div class="fw-bold text-dark" style="font-size:14px;">${p.name}</div>
                        <div class="text-gold" style="font-size:12px;">${p.category} &bull; ${p.subcategory}</div>
                    </div>
                </a>`;
            });
            searchResults.innerHTML = html;
        });
    }
}

// Back to Top Button
function initBackToTop() {
    const backBtn = document.querySelector('.back-to-top');
    if (!backBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backBtn.classList.add('visible');
        } else {
            backBtn.classList.remove('visible');
        }
    });

    backBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Global Lightbox Close & Backdrop Handler
function initLightboxHandlers() {
    const lightboxModal = document.getElementById('lightboxModal');
    if (!lightboxModal) return;

    const closeLightbox = () => {
        lightboxModal.classList.remove('active');
    };

    // Close button click
    const closeBtns = lightboxModal.querySelectorAll('.lightbox-close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });
    });

    // Backdrop click (click outside image)
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal || e.target.classList.contains('lightbox-img-wrap')) {
            closeLightbox();
        }
    });

    // Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// WhatsApp Helper
function buildWhatsAppLink(productName = '') {
    const number = SITE_CONFIG.whatsappNumber;
    let text = `Hello ${SITE_CONFIG.companyName},\n\nI am reaching out regarding complete mosque architectural solutions and products.`;
    if (productName) {
        text = `Hello ${SITE_CONFIG.companyName},\n\nI am interested in:\n${productName}\n\nPlease share price, details and availability.`;
    }
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function initWhatsAppHelper() {
    const genericWaBtns = document.querySelectorAll('.btn-general-whatsapp');
    genericWaBtns.forEach(btn => {
        btn.setAttribute('href', buildWhatsAppLink());
        btn.setAttribute('target', '_blank');
    });

    // Dynamically inject floating WhatsApp and Call buttons if not present
    if (!document.querySelector('.floating-quick-actions')) {
        const floatContainer = document.createElement('div');
        floatContainer.className = 'floating-quick-actions';
        floatContainer.innerHTML = `
            <a href="${buildWhatsAppLink()}" target="_blank" class="float-btn float-whatsapp" title="Chat on WhatsApp">
                <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='%23ffffff' d='M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.9-186.6 184.9zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z'/></svg>" alt="WhatsApp">
            </a>
            <a href="tel:+919800183455" class="float-btn float-phone" title="Call Us Now">
                <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='%23ffffff' d='M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 400C234.6 364.2 147.8 277.4 112 207.3l41.1-40.4c13.7-11.1 18.4-30 11.6-46.3l-40-96z'/></svg>" alt="Phone Call">
            </a>
        `;
        document.body.appendChild(floatContainer);
    }
}
