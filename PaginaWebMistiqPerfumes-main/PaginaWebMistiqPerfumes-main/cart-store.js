import { getProductById } from './catalog-data.js';

const CART_KEY = 'mistiq-perfumes-cart-v1';
const listeners = new Set();

let cart = loadCart();

function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sanitizeCart(rawCart) {
    if (!Array.isArray(rawCart)) {
        return [];
    }

    return rawCart
        .map(item => ({
            productId: Number(item.productId),
            quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1))
        }))
        .filter(item => Number.isFinite(item.productId) && getProductById(item.productId));
}

function loadCart() {
    if (!canUseStorage()) {
        return [];
    }

    try {
        const savedCart = window.localStorage.getItem(CART_KEY);
        return sanitizeCart(savedCart ? JSON.parse(savedCart) : []);
    } catch {
        return [];
    }
}

function persistCart() {
    if (canUseStorage()) {
        window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    listeners.forEach(listener => listener(getCart()));
}

function findCartItem(productId) {
    return cart.find(item => item.productId === Number(productId));
}

export function getCart() {
    return cart.map(item => ({ ...item }));
}

export function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(productId, quantity = 1) {
    const safeQuantity = Math.max(1, Math.min(99, Number(quantity) || 1));
    const existingItem = findCartItem(productId);

    if (existingItem) {
        existingItem.quantity = Math.min(99, existingItem.quantity + safeQuantity);
    } else if (getProductById(productId)) {
        cart.push({ productId: Number(productId), quantity: safeQuantity });
    }

    persistCart();
}

export function updateCartQuantity(productId, quantity) {
    const safeQuantity = Number(quantity);

    if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const existingItem = findCartItem(productId);

    if (!existingItem) {
        return;
    }

    existingItem.quantity = Math.min(99, Math.max(1, safeQuantity));
    persistCart();
}

export function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== Number(productId));
    persistCart();
}

export function clearCart() {
    cart = [];
    persistCart();
}

export function getCartItemsDetailed() {
    return cart
        .map(item => {
            const product = getProductById(item.productId);

            if (!product) {
                return null;
            }

            return {
                ...item,
                product,
                lineTotal: product.price * item.quantity
            };
        })
        .filter(Boolean);
}

export function getCartTotals() {
    const items = getCartItemsDetailed();
    const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
    const shipping = 0;

    return {
        items,
        subtotal,
        shipping,
        total: subtotal + shipping,
        count: getCartCount()
    };
}

export function subscribeToCart(listener) {
    listeners.add(listener);
    listener(getCart());

    return () => {
        listeners.delete(listener);
    };
}

if (typeof window !== 'undefined') {
    window.addEventListener('storage', event => {
        if (event.key !== CART_KEY) {
            return;
        }

        cart = loadCart();
        listeners.forEach(listener => listener(getCart()));
    });
}
