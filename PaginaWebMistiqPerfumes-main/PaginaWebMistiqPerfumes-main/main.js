import { products } from './products.js';

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const backToTopBtn = document.getElementById('backToTop');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const filterGender = document.getElementById('filterGender');
const filterMoment = document.getElementById('filterMoment');
const resetFilters = document.getElementById('resetFilters');
const productGrid = document.getElementById('productGrid');

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

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

document.querySelectorAll('.contact-item, .product-card').forEach(el => {
    observer.observe(el);
});

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const categoryValue = filterCategory.value;
    const genderValue = filterGender.value;
    const momentValue = filterMoment.value;

    const filteredProducts = products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(searchTerm) ||
                           product.reference.toLowerCase().includes(searchTerm);
        const matchCategory = !categoryValue || product.category === categoryValue;
        const matchGender = !genderValue || product.gender === genderValue;
        const matchMoment = !momentValue || product.moment === momentValue;

        return matchSearch && matchCategory && matchGender && matchMoment;
    });

    renderProducts(filteredProducts);
}

function renderProducts(list) {
    productGrid.innerHTML = list.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" class="product-image">
            <h3 class="product-name">${p.name}</h3>
            <p class="product-price">$${p.price.toLocaleString('es-CO')}</p>
            <a href="product.html?id=${p.id}" class="btn-primary">Ver Detalle</a>
        </div>
    `).join('');
}

searchInput.addEventListener('input', filterProducts);
filterCategory.addEventListener('change', filterProducts);
filterGender.addEventListener('change', filterProducts);
filterMoment.addEventListener('change', filterProducts);

resetFilters.addEventListener('click', () => {
    searchInput.value = '';
    filterCategory.value = '';
    filterGender.value = '';
    filterMoment.value = '';
    filterProducts();
});

// Render inicial
renderProducts(products);