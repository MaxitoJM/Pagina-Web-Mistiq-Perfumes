import { categoryViews, getCatalogView, olfactiveFamilies, products } from './catalog-data.js';
import { createScrollStack } from './scroll-stack.js';
import { attachCatalogActions, renderProductCard, renderScrollStackCard, setupRevealObserver } from './ui.js';

function getInitialView() {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'all';
}

function getFilteredProducts(state) {
    const view = getCatalogView(state.view);
    const searchTerm = state.search.trim().toLowerCase();

    const filteredProducts = products
        .filter(product => view.matches(product))
        .filter(product => !state.family || product.familyLabel === state.family)
        .filter(product => !state.audience || product.audience === state.audience)
        .filter(product => !state.moment || product.moment === state.moment)
        .filter(product => !searchTerm || product.searchText.includes(searchTerm));

    if (state.sort === 'price-asc') {
        return filteredProducts.sort((a, b) => a.price - b.price);
    }

    if (state.sort === 'price-desc') {
        return filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (state.sort === 'name') {
        return filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    }

    if (state.view === 'new-arrivals') {
        return filteredProducts.sort((a, b) => b.id - a.id);
    }

    if (state.view === 'best-sellers') {
        return filteredProducts.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller) || a.catalogOrder - b.catalogOrder);
    }

    return filteredProducts.sort((a, b) => a.catalogOrder - b.catalogOrder);
}

function renderViewPills(activeView) {
    return categoryViews
        .map(view => {
            const isActive = activeView === view.slug;
            return `<a href="${view.href}" class="catalog-pill ${isActive ? 'active' : ''}">${view.label}</a>`;
        })
        .join('');
}

export function initCatalogExperience(options = {}) {
    const searchInput = document.querySelector(options.searchSelector || '#searchInput');
    const familySelect = document.querySelector(options.familySelector || '#filterCategory');
    const audienceSelect = document.querySelector(options.audienceSelector || '#filterAudience');
    const collectionSelect = document.querySelector(options.collectionSelector || '#filterCollection');
    const momentSelect = document.querySelector(options.momentSelector || '#filterMoment');
    const sortSelect = document.querySelector(options.sortSelector || '#sortProducts');
    const resetButton = document.querySelector(options.resetSelector || '#resetFilters');
    const productGrid = document.querySelector(options.gridSelector || '#productGrid');
    const summary = document.querySelector(options.summarySelector || '#catalogSummary');
    const title = document.querySelector(options.titleSelector || '#catalogTitle');
    const description = document.querySelector(options.descriptionSelector || '#catalogDescription');
    const viewPills = document.querySelector(options.viewPillsSelector || '#catalogViews');
    const showcaseContainer = document.querySelector(options.showcaseSelector || '#scrollStackShowcase');
    let scrollStack = null;

    if (!productGrid) {
        return;
    }

    const state = {
        view: options.initialView || getInitialView(),
        search: '',
        family: '',
        audience: '',
        collection: '',
        moment: '',
        sort: 'featured'
    };

    if (familySelect) {
        familySelect.innerHTML = `
            <option value="">Todas</option>
            ${olfactiveFamilies.map(family => `<option value="${family}">${family}</option>`).join('')}
        `;
    }

    if (viewPills) {
        viewPills.innerHTML = renderViewPills(state.view);
    }

    if (showcaseContainer) {
        scrollStack = createScrollStack(showcaseContainer);
        attachCatalogActions(showcaseContainer);
    }

    const render = () => {
        const view = getCatalogView(state.view);
        const filteredProducts = getFilteredProducts(state).filter(product => !state.collection || product.collectionType === state.collection);
        const showcaseProducts = filteredProducts.slice(0, 4);

        if (title) {
            title.textContent = view.label;
        }

        if (description) {
            description.textContent = view.description;
        }

        if (summary) {
            summary.textContent = `${filteredProducts.length} perfume${filteredProducts.length === 1 ? '' : 's'} disponibles`;
        }

        productGrid.innerHTML = filteredProducts.length
            ? filteredProducts.map(renderProductCard).join('')
            : `
                <div class="empty-catalog-state">
                    <h3>No encontramos perfumes con esos filtros</h3>
                    <p>Prueba con otra búsqueda o limpia los filtros para volver a ver toda la colección.</p>
                </div>
            `;

        if (showcaseContainer) {
            showcaseContainer.innerHTML = showcaseProducts.length
                ? `
                    <div class="scroll-stack-shell">
                        <div class="scroll-stack-inner">
                            ${showcaseProducts.map((product, index) => renderScrollStackCard(product, index)).join('')}
                            <div class="scroll-stack-end" aria-hidden="true"></div>
                        </div>
                    </div>
                `
                : '';

            scrollStack?.refresh();
        }

        setupRevealObserver();
    };

    searchInput?.addEventListener('input', event => {
        state.search = event.target.value;
        render();
    });

    familySelect?.addEventListener('change', event => {
        state.family = event.target.value;
        render();
    });

    audienceSelect?.addEventListener('change', event => {
        state.audience = event.target.value;
        render();
    });

    collectionSelect?.addEventListener('change', event => {
        state.collection = event.target.value;
        render();
    });

    momentSelect?.addEventListener('change', event => {
        state.moment = event.target.value;
        render();
    });

    sortSelect?.addEventListener('change', event => {
        state.sort = event.target.value;
        render();
    });

    resetButton?.addEventListener('click', () => {
        state.search = '';
        state.family = '';
        state.audience = '';
        state.collection = '';
        state.moment = '';
        state.sort = 'featured';

        if (searchInput) {
            searchInput.value = '';
        }

        if (familySelect) {
            familySelect.value = '';
        }

        if (audienceSelect) {
            audienceSelect.value = '';
        }

        if (collectionSelect) {
            collectionSelect.value = '';
        }

        if (momentSelect) {
            momentSelect.value = '';
        }

        if (sortSelect) {
            sortSelect.value = 'featured';
        }

        render();
    });

    attachCatalogActions(productGrid);
    render();
}
