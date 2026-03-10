import { getProductById, getRelatedProducts } from './catalog-data.js';
import { addToCart } from './cart-store.js';
import {
    attachCatalogActions,
    formatPrice,
    mountSiteShell,
    renderProductCard,
    renderQuantitySelector,
    setupRevealObserver,
    showToast
} from './ui.js';

function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    return Number(urlParams.get('id'));
}

function renderMissingProduct() {
    const container = document.getElementById('productDetailContainer');

    container.innerHTML = `
        <div class="empty-product-state">
            <h2>Producto no encontrado</h2>
            <p>No pudimos encontrar el perfume solicitado. Vuelve al catálogo para seguir explorando.</p>
            <a href="./catalog.html" class="btn-primary">Volver al catálogo</a>
        </div>
    `;
}

function renderProduct(product) {
    const container = document.getElementById('productDetailContainer');
    const relatedProducts = getRelatedProducts(product);

    container.innerHTML = `
        <a href="./catalog.html" class="btn-back">
            <i class="fas fa-arrow-left"></i>
            Volver al catálogo
        </a>
        <div class="product-detail-grid">
            <div class="product-gallery">
                <img id="mainImage" src="${product.gallery[0].src}" alt="${product.gallery[0].alt}" class="main-image" decoding="async">
                <div class="thumbnail-grid">
                    ${product.gallery
                        .map(
                            (image, index) => `
                                <button type="button" class="thumbnail ${index === 0 ? 'active' : ''}" data-gallery-index="${index}">
                                    <img src="${image.src}" alt="${image.alt}" loading="lazy" decoding="async">
                                    <span>${image.label}</span>
                                </button>
                            `
                        )
                        .join('')}
                </div>
            </div>
            <div class="product-detail-info">
                <span class="detail-category-pill">${product.audienceLabel}</span>
                <h1>${product.name}</h1>
                <p class="product-detail-reference">Ref: ${product.reference}</p>
                <p class="product-detail-price">${formatPrice(product.price)}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <div class="meta-item">
                        <span class="meta-label">Categoría</span>
                        <span>${product.audienceLabel}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Familia olfativa</span>
                        <span>${product.familyLabel}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Colección</span>
                        <span>${product.collectionLabel}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Ideal para</span>
                        <span>${product.momentLabel}</span>
                    </div>
                </div>
                <div class="product-purchase-box">
                    <div id="productQuantity">${renderQuantitySelector(1)}</div>
                    <div class="product-detail-actions">
                        <button type="button" class="btn-primary" id="addToCartButton">Agregar al carrito</button>
                        <a href="./cart.html" class="btn-secondary">Ver carrito</a>
                    </div>
                </div>
                <a href="https://wa.me/573103727936?text=Hola,%20me%20interesa%20el%20perfume%20${encodeURIComponent(product.name)}%20(Ref:%20${product.reference})" target="_blank" class="btn-whatsapp-large">
                    <i class="fab fa-whatsapp"></i>
                    Consultar por WhatsApp
                </a>
            </div>
        </div>
        <section class="related-products">
            <div class="section-header">
                <div>
                    <h2 class="section-title section-title-left">También te puede interesar</h2>
                    <p class="section-description">Fragancias relacionadas con el mismo estilo y perfil de uso.</p>
                </div>
            </div>
            <div id="relatedProducts" class="product-grid related-grid">
                ${relatedProducts.map(renderProductCard).join('')}
            </div>
        </section>
    `;

    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('[data-gallery-index]');
    const quantityRoot = document.getElementById('productQuantity');
    const quantityInput = quantityRoot.querySelector('.quantity-input');
    const addToCartButton = document.getElementById('addToCartButton');
    const decreaseButton = quantityRoot.querySelector('[data-quantity-action="decrease"]');
    const increaseButton = quantityRoot.querySelector('[data-quantity-action="increase"]');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const nextImage = product.gallery[Number(thumbnail.dataset.galleryIndex)];
            mainImage.src = nextImage.src;
            mainImage.alt = nextImage.alt;

            thumbnails.forEach(item => item.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    });

    const clampQuantity = value => {
        quantityInput.value = Math.max(1, Math.min(99, Number(value) || 1));
    };

    decreaseButton?.addEventListener('click', () => clampQuantity(Number(quantityInput.value) - 1));
    increaseButton?.addEventListener('click', () => clampQuantity(Number(quantityInput.value) + 1));
    quantityInput?.addEventListener('change', () => clampQuantity(quantityInput.value));

    addToCartButton?.addEventListener('click', () => {
        addToCart(product.id, Number(quantityInput.value));
        showToast('Perfume agregado al carrito.');
    });

    attachCatalogActions(document.getElementById('relatedProducts'));
    setupRevealObserver();
}

mountSiteShell('product');

const product = getProductById(getProductId());

if (!product) {
    renderMissingProduct();
} else {
    renderProduct(product);
}
