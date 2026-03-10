import { categoryViews } from './catalog-data.js';
import { addToCart, getCartCount, subscribeToCart } from './cart-store.js';

const moneyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
});

let revealObserver;

function getNavLink(path, label, currentPage) {
    const isHome = currentPage === 'home';
    const href = isHome ? `#${path}` : `./index.html#${path}`;

    return `<li><a href="${href}" class="nav-link">${label}</a></li>`;
}

function getDropdownMarkup(currentPage) {
    const isCatalogSection = ['catalog', 'product'].includes(currentPage);

    return `
        <li class="nav-dropdown ${isCatalogSection ? 'active' : ''}">
            <button class="nav-link nav-dropdown-toggle" type="button" aria-expanded="false">
                Perfumes
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu">
                ${categoryViews
                    .map(view => `<a href="${view.href}" class="dropdown-link">${view.label}</a>`)
                    .join('')}
            </div>
        </li>
    `;
}

function buildHeader(currentPage) {
    return `
        <nav class="navbar">
            <div class="nav-container">
                <div class="logo">
                    <a href="./index.html" class="logo-link">
                        <img src="./img/logo-mistiq.svg" alt="Logo Mistiq Perfumes" class="site-logo" width="52" height="52">
                        <h1>MistiQ Perfumes</h1>
                    </a>
                </div>
                <ul class="nav-menu">
                    ${getNavLink('inicio', 'Inicio', currentPage)}
                    ${getDropdownMarkup(currentPage)}
                    ${getNavLink('atencion', 'Atención Personalizada', currentPage)}
                    ${getNavLink('contacto', 'Contacto', currentPage)}
                    <li>
                        <a href="./cart.html" class="cart-link nav-link" aria-label="Ver carrito">
                            <i class="fas fa-bag-shopping"></i>
                            <span class="cart-count">0</span>
                        </a>
                    </li>
                </ul>
                <button class="hamburger" type="button" aria-label="Abrir menú">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    `;
}

function buildFooter() {
    return `
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-logo">
                        <h3>MISTIQ</h3>
                        <p>Fragancias Exclusivas</p>
                    </div>
                    <div class="footer-links">
                        <h4>Enlaces Rápidos</h4>
                        <ul>
                            <li><a href="./index.html#inicio">Inicio</a></li>
                            <li><a href="./catalog.html">Catálogo</a></li>
                            <li><a href="./index.html#atencion">Atención Personalizada</a></li>
                            <li><a href="./cart.html">Carrito</a></li>
                            <li><a href="./index.html#contacto">Contacto</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 Mistiq Perfumes. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    `;
}

function buildFloatingUi() {
    return `
        <div class="floating-ui">
            <a href="https://wa.me/573103727936?text=Hola,%20quiero%20asesoría%20para%20elegir%20un%20perfume%20en%20Mistiq." target="_blank" class="whatsapp-float" aria-label="Contactar por WhatsApp">
                <i class="fab fa-whatsapp"></i>
            </a>
            <button id="backToTop" class="back-to-top" aria-label="Volver arriba">
                <i class="fas fa-arrow-up"></i>
            </button>
            <div id="toastContainer" class="toast-container" aria-live="polite" aria-atomic="true"></div>
        </div>
    `;
}

function updateCartBadges() {
    const count = getCartCount();

    document.querySelectorAll('.cart-count').forEach(counter => {
        counter.textContent = count;
        counter.classList.toggle('has-items', count > 0);
    });
}

function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const dropdown = document.querySelector('.nav-dropdown');
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    const navLinks = document.querySelectorAll('.nav-menu a, .dropdown-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    if (dropdown && dropdownToggle) {
        dropdownToggle.addEventListener('click', () => {
            const isOpen = dropdown.classList.toggle('open');
            dropdownToggle.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('click', event => {
            if (!dropdown.contains(event.target)) {
                dropdown.classList.remove('open');
                dropdownToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
            dropdown?.classList.remove('open');
            dropdownToggle?.setAttribute('aria-expanded', 'false');
        });
    });
}

function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    if (!backToTopBtn) {
        return;
    }

    const toggleButton = () => {
        backToTopBtn.classList.toggle('show', window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleButton);
    toggleButton();

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

export function formatPrice(value) {
    return moneyFormatter.format(value);
}

export function renderProductCard(product) {
    const badges = product.badges
        .map(badge => `<span class="product-badge">${badge}</span>`)
        .join('');

    return `
        <article class="product-card reveal-on-scroll">
            <a href="./product.html?id=${product.id}" class="product-card-link">
                <div class="product-media">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" decoding="async">
                    ${badges ? `<div class="product-badge-row">${badges}</div>` : ''}
                </div>
                <div class="product-info">
                    <p class="product-category-label">${product.audienceLabel} · ${product.familyLabel}</p>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-reference">Ref: ${product.reference}</p>
                    <p class="product-price">${formatPrice(product.price)}</p>
                </div>
            </a>
            <div class="product-card-actions">
                <a href="./product.html?id=${product.id}" class="btn-secondary btn-small">Ver detalle</a>
                <button type="button" class="btn-primary btn-small" data-add-to-cart="${product.id}">Agregar</button>
            </div>
        </article>
    `;
}

export function renderScrollStackCard(product, index) {
    const accentLabel = product.badges[0] || product.audienceLabel;

    return `
        <article class="scroll-stack-card" data-stack-card="${product.id}" style="--stack-index:${index}">
            <div class="scroll-stack-card-media">
                <img src="${product.image}" alt="${product.name}" class="scroll-stack-image" loading="lazy" decoding="async">
            </div>
            <div class="scroll-stack-card-content">
                <span class="scroll-stack-pill">${accentLabel}</span>
                <p class="scroll-stack-category">${product.audienceLabel} · ${product.familyLabel}</p>
                <h3>${product.name}</h3>
                <p class="scroll-stack-description">${product.description}</p>
                <div class="scroll-stack-meta">
                    <span>Ref: ${product.reference}</span>
                    <strong>${formatPrice(product.price)}</strong>
                </div>
                <div class="scroll-stack-actions">
                    <a href="./product.html?id=${product.id}" class="btn-secondary">Ver detalle</a>
                    <button type="button" class="btn-primary" data-add-to-cart="${product.id}">Agregar</button>
                </div>
            </div>
        </article>
    `;
}

export function attachCatalogActions(container) {
    if (!container) {
        return;
    }

    container.addEventListener('click', event => {
        const addButton = event.target.closest('[data-add-to-cart]');

        if (!addButton) {
            return;
        }

        const productId = Number(addButton.dataset.addToCart);
        addToCart(productId, 1);
        showToast('Perfume agregado al carrito.');
    });
}

export function renderQuantitySelector(quantity = 1) {
    return `
        <div class="quantity-selector">
            <button type="button" class="quantity-btn" data-quantity-action="decrease" aria-label="Reducir cantidad">-</button>
            <input type="number" class="quantity-input" min="1" max="99" value="${quantity}">
            <button type="button" class="quantity-btn" data-quantity-action="increase" aria-label="Aumentar cantidad">+</button>
        </div>
    `;
}

export function setupRevealObserver() {
    if (revealObserver) {
        revealObserver.disconnect();
    }

    revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach(element => {
        revealObserver.observe(element);
    });
}

export function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');

    if (!toastContainer) {
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add('visible');
    }, 10);

    window.setTimeout(() => {
        toast.classList.remove('visible');
        window.setTimeout(() => toast.remove(), 250);
    }, 2400);
}

export function mountSiteShell(currentPage) {
    const header = document.getElementById('site-header');
    const footer = document.getElementById('site-footer');
    const floatingUi = document.getElementById('site-floating');

    if (header) {
        header.innerHTML = buildHeader(currentPage);
    }

    if (footer) {
        footer.innerHTML = buildFooter();
    }

    if (floatingUi) {
        floatingUi.innerHTML = buildFloatingUi();
    }

    setupNavigation();
    setupBackToTop();
    updateCartBadges();
    subscribeToCart(updateCartBadges);
}
