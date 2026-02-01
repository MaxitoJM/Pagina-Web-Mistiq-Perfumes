import { products } from './products.js';

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const backToTopBtn = document.getElementById('backToTop');
const productDetailContainer = document.getElementById('productDetailContainer');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

const product = products.find(p => p.id === productId);

if (!product) {
    productDetailContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <h2>Producto no encontrado</h2>
            <p style="margin: 2rem 0;">Lo sentimos, no pudimos encontrar el producto que buscas.</p>
            <a href="/#catalogo" class="btn-primary">Volver al Catálogo</a>
        </div>
    `;
} else {
    const categoryLabels = {
        citrica: 'Cítrica',
        floral: 'Floral',
        amaderada: 'Amaderada',
        fresca: 'Fresca',
        frutal: 'Frutal',
        verde: 'Verde',
        aromatico: 'Aromático',
        especiado: 'Especiado',
        dulce : 'Dulce',
        avainillado: 'Avainillado',
        ambar : 'Ámbar',
        canela : 'Canela',
        marino : 'Marino',
    };

    const genderLabels = {
        femenino: 'Femenino',
        masculino: 'Masculino',
        unisex: 'Unisex'
    };

    const momentLabels = {
        dia: 'Día',
        noche: 'Noche'
    };

    productDetailContainer.innerHTML = `
        <a href="/#catalogo" class="btn-back">
            <i class="fas fa-arrow-left"></i> Volver al Catálogo
        </a>
        <div class="product-detail-grid">
            <div class="product-gallery">
                <img id="mainImage" src="${product.gallery[0]}" alt="${product.name}" class="main-image">
                <div class="thumbnail-grid">
                    ${product.gallery.map((img, index) => `
                        <img src="${img}" alt="${product.name} ${index + 1}"
                             class="thumbnail ${index === 0 ? 'active' : ''}"
                             data-index="${index}">
                    `).join('')}
                </div>
            </div>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <p class="product-detail-reference">Ref: ${product.reference}</p>
                <p class="product-detail-price">$${product.price.toLocaleString('es-CO')}</p>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <div class="meta-item">
                        <span class="meta-label">Categoría Olfativa:</span>
                        <span>${categoryLabels[product.category]}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Género:</span>
                        <span>${genderLabels[product.gender]}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Momento del Día:</span>
                        <span>${momentLabels[product.moment]}</span>
                    </div>
                </div>
                <a href="https://wa.me/573113094285?text=Hola,%20me%20interesa%20el%20perfume%20${encodeURIComponent(product.name)}%20(Ref:%20${product.reference})"
                   target="_blank"
                   class="btn-whatsapp-large">
                    <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                </a>
            </div>
        </div>
    `;

    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const index = parseInt(thumbnail.dataset.index);
            mainImage.src = product.gallery[index];

            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    });
}
