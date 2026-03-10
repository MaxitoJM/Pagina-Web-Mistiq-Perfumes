import { products as rawProducts } from './products.js';

const CATEGORY_VIEW_CONFIG = {
    all: {
        label: 'Todos los perfumes',
        description: 'Explora toda la colección de fragancias exclusivas de Mistiq.',
        matches: () => true
    },
    hombre: {
        label: 'Perfumes para hombre',
        description: 'Selección masculina con aromas frescos, intensos y elegantes.',
        matches: product => product.audience === 'men'
    },
    mujer: {
        label: 'Perfumes para mujer',
        description: 'Fragancias femeninas con perfiles florales, dulces y sofisticados.',
        matches: product => product.audience === 'women'
    },
    unisex: {
        label: 'Perfumes unisex',
        description: 'Aromas versátiles para quienes buscan una firma olfativa sin etiquetas.',
        matches: product => product.audience === 'unisex'
    },
    arabe: {
        label: 'Perfumes árabes',
        description: 'Fragancias orientales y modernas con gran presencia y excelente duración.',
        matches: product => product.collectionType === 'arabic'
    },
    disenador: {
        label: 'Perfumes de diseñador',
        description: 'Casas reconocidas internacionalmente con firmas olfativas icónicas.',
        matches: product => product.collectionType === 'designer'
    },
    nicho: {
        label: 'Perfumes nicho',
        description: 'Referencias de perfil exclusivo para quienes buscan algo distinto.',
        matches: product => product.collectionType === 'niche'
    }
};

const FAMILY_LABELS = {
    aromatico: 'Aromática',
    avainillado: 'Avainillada',
    vainillado: 'Avainillada',
    ambar: 'Ámbar',
    amaderada: 'Amaderada',
    amaderado: 'Amaderada',
    afrutado: 'Afrutada',
    afrutada: 'Afrutada',
    canela: 'Canela',
    calido: 'Cálida',
    chipre: 'Chipre',
    citrica: 'Cítrica',
    citrico: 'Cítrica',
    coco: 'Coco',
    dulce: 'Dulce',
    especiado: 'Especiada',
    floral: 'Floral',
    fougere: 'Fougère',
    fresca: 'Fresca',
    fresco: 'Fresca',
    frutal: 'Frutal',
    gourmand: 'Gourmand',
    marino: 'Marina',
    oriental: 'Oriental',
    verde: 'Verde'
};

const BEST_SELLER_IDS = new Set([2, 5, 7, 9, 15, 16, 21, 26, 29, 31, 32, 33]);
const NEW_ARRIVAL_IDS = new Set(rawProducts.filter(product => product.id >= 34).map(product => product.id));
const OFFER_IDS = new Set([1, 7, 12, 22, 35, 40]);
const ARABIC_IDS = new Set([1, 7, 8, 9, 10, 12, 15, 17, 18, 19, 20, 22, 23, 24, 25, 26, 35, 36, 37, 38, 40, 41]);
const NICHE_IDS = new Set([3, 10, 19, 25]);
const VIEW_ALIASES = {
    men: 'hombre',
    women: 'mujer',
    arabic: 'arabe',
    designer: 'disenador',
    niche: 'nicho'
};

function normalizeText(value = '') {
    return value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function normalizeAudience(value = '') {
    const normalized = normalizeText(value);

    if (normalized.includes('mujer') || normalized.includes('femen')) {
        return 'women';
    }

    if (normalized.includes('unisex')) {
        return 'unisex';
    }

    return 'men';
}

function getAudienceLabel(audience) {
    if (audience === 'women') {
        return 'Mujer';
    }

    if (audience === 'unisex') {
        return 'Unisex';
    }

    return 'Hombre';
}

function normalizeMoment(value = '') {
    const normalized = normalizeText(value);

    if (!normalized) {
        return 'day';
    }

    const mentionsDay = normalized.includes('dia');
    const mentionsNight = normalized.includes('noche');
    const mentionsAllDay = normalized.includes('todo') || normalized.includes('versatil');

    if ((mentionsDay && mentionsNight) || mentionsAllDay) {
        return 'versatile';
    }

    if (mentionsNight) {
        return 'night';
    }

    return 'day';
}

function getMomentLabel(moment) {
    if (moment === 'night') {
        return 'Noche';
    }

    if (moment === 'versatile') {
        return 'Todo el día';
    }

    return 'Día';
}

function titleCase(value) {
    return value
        .split(' ')
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function normalizeFamilyLabel(value = '') {
    const rawValue = value || 'Colección exclusiva';
    const normalizedValue = normalizeText(rawValue);

    if (
        normalizedValue.includes('eau de parfum') ||
        normalizedValue.includes('eau de toilette') ||
        normalizedValue.includes('parfum intense')
    ) {
        return rawValue.trim();
    }

    const parts = normalizedValue
        .split(/[-/,]/)
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => FAMILY_LABELS[part] || titleCase(part));

    return parts.length ? parts.join(' · ') : 'Colección exclusiva';
}

function createGalleryVariant(image, name, caption, position) {
    const imageUrl = typeof window !== 'undefined' ? new URL(image, window.location.href).href : image;
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#050505" />
                    <stop offset="100%" stop-color="#1f1a12" />
                </linearGradient>
                <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="rgba(212,175,55,0.18)" />
                    <stop offset="100%" stop-color="rgba(245,245,220,0.08)" />
                </linearGradient>
            </defs>
            <rect width="900" height="1100" fill="url(#bg)" />
            <circle cx="${position === 'left' ? '180' : '720'}" cy="160" r="180" fill="rgba(212,175,55,0.10)" />
            <rect x="70" y="70" width="760" height="960" rx="36" fill="url(#panel)" stroke="#d4af37" stroke-width="3" />
            <rect x="120" y="150" width="660" height="620" rx="28" fill="rgba(255,255,255,0.04)" />
            <image href="${imageUrl}" x="150" y="130" width="600" height="650" preserveAspectRatio="xMidYMid meet" />
            <text x="120" y="850" fill="#d4af37" font-size="28" font-family="Poppins, Arial, sans-serif" letter-spacing="4">MISTIQ PERFUMES</text>
            <text x="120" y="905" fill="#f5f5dc" font-size="52" font-family="Playfair Display, Georgia, serif">${name}</text>
            <text x="120" y="965" fill="#ffffff" font-size="28" font-family="Poppins, Arial, sans-serif">${caption}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildGallery(product) {
    return [
        {
            src: product.image,
            alt: `${product.name} vista principal`,
            label: 'Principal'
        },
        {
            src: createGalleryVariant(product.image, product.name, 'Detalle del frasco', 'left'),
            alt: `${product.name} detalle del frasco`,
            label: 'Detalle'
        },
        {
            src: createGalleryVariant(product.image, product.name, 'Notas y textura', 'right'),
            alt: `${product.name} inspiración olfativa`,
            label: 'Notas'
        },
        {
            src: createGalleryVariant(product.image, product.name, 'Presentación Mistiq', 'left'),
            alt: `${product.name} presentación Mistiq`,
            label: 'Presentación'
        }
    ];
}

export const categoryViews = [
    { slug: 'all', label: 'Todos', href: './catalog.html' },
    { slug: 'hombre', label: 'Hombre', href: './catalog.html?view=hombre' },
    { slug: 'mujer', label: 'Mujer', href: './catalog.html?view=mujer' },
    { slug: 'unisex', label: 'Unisex', href: './catalog.html?view=unisex' },
    { slug: 'arabe', label: 'Árabe', href: './catalog.html?view=arabe' },
    { slug: 'disenador', label: 'Diseñador', href: './catalog.html?view=disenador' },
    { slug: 'nicho', label: 'Nicho', href: './catalog.html?view=nicho' }
];

function getCollectionType(product) {
    if (NICHE_IDS.has(product.id)) {
        return 'niche';
    }

    if (ARABIC_IDS.has(product.id)) {
        return 'arabic';
    }

    return 'designer';
}

function getCollectionLabel(collectionType) {
    if (collectionType === 'arabic') {
        return 'Árabe';
    }

    if (collectionType === 'niche') {
        return 'Nicho';
    }

    return 'Diseñador';
}

function getOptimizedImagePath(imagePath = '') {
    return imagePath.replace(/\.png$/i, '.webp');
}

export const products = rawProducts.map((product, index) => {
    const audience = normalizeAudience(product.gender);
    const moment = normalizeMoment(product.moment);
    const familyLabel = normalizeFamilyLabel(product.category);
    const isNewArrival = NEW_ARRIVAL_IDS.has(product.id);
    const isBestSeller = BEST_SELLER_IDS.has(product.id);
    const isOnSale = OFFER_IDS.has(product.id);
    const collectionType = getCollectionType(product);
    const collectionLabel = getCollectionLabel(collectionType);
    const optimizedImage = getOptimizedImagePath(product.image);
    const badges = [];

    if (isOnSale) {
        badges.push('Oferta');
    }

    if (isBestSeller) {
        badges.push('Más vendido');
    }

    if (isNewArrival) {
        badges.push('Nuevo');
    }

    return {
        ...product,
        image: optimizedImage,
        audience,
        audienceLabel: getAudienceLabel(audience),
        collectionType,
        collectionLabel,
        familyLabel,
        moment,
        momentLabel: getMomentLabel(moment),
        isNewArrival,
        isBestSeller,
        isOnSale,
        badges,
        catalogOrder: index,
        gallery: buildGallery({ ...product, image: optimizedImage }),
        searchText: [
            product.name,
            product.reference,
            familyLabel,
            getAudienceLabel(audience),
            getMomentLabel(moment),
            collectionLabel
        ]
            .join(' ')
            .toLowerCase()
    };
});

export const olfactiveFamilies = [...new Set(products.map(product => product.familyLabel))].sort((a, b) => a.localeCompare(b, 'es'));

export function getCatalogView(view = 'all') {
    return CATEGORY_VIEW_CONFIG[VIEW_ALIASES[view] || view] || CATEGORY_VIEW_CONFIG.all;
}

export function getProductById(productId) {
    return products.find(product => product.id === Number(productId));
}

export function getRelatedProducts(currentProduct, limit = 4) {
    return products
        .filter(product => product.id !== currentProduct.id)
        .filter(product => product.audience === currentProduct.audience || product.familyLabel === currentProduct.familyLabel)
        .slice(0, limit);
}
