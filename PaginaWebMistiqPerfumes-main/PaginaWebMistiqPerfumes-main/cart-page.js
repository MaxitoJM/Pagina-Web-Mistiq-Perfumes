import { clearCart, getCartTotals, removeFromCart, subscribeToCart, updateCartQuantity } from './cart-store.js';
import { formatPrice, renderQuantitySelector, showToast } from './ui.js';

function buildWhatsAppMessage({ items, total }, customerInfo) {
    const lines = [
        'Hola Mistiq, quiero continuar con mi pedido:',
        '',
        ...items.map(item => `- ${item.product.name} x${item.quantity} - ${formatPrice(item.lineTotal)}`),
        '',
        `Total estimado: ${formatPrice(total)}`,
        '',
        `Nombre: ${customerInfo.name || 'Pendiente'}`,
        `Teléfono: ${customerInfo.phone || 'Pendiente'}`,
        `Entrega: ${customerInfo.delivery || 'Pendiente'}`,
        `Instrucciones adicionales para el pedido: ${customerInfo.notes || 'Sin instrucciones adicionales'}`
    ];

    return `https://wa.me/573103727936?text=${encodeURIComponent(lines.join('\n'))}`;
}

function renderCartItems(cartTotals) {
    if (!cartTotals.items.length) {
        return `
            <div class="empty-cart">
                <h2>Tu carrito está vacío</h2>
                <p>Agrega perfumes desde el catálogo para preparar tu pedido.</p>
                <a href="./catalog.html" class="btn-primary">Explorar perfumes</a>
            </div>
        `;
    }

    return cartTotals.items
        .map(item => `
            <article class="cart-item">
                <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image" loading="lazy" decoding="async">
                <div class="cart-item-info">
                    <div>
                        <p class="cart-item-category">${item.product.audienceLabel} · ${item.product.familyLabel}</p>
                        <h3>${item.product.name}</h3>
                        <p class="cart-item-reference">Ref: ${item.product.reference}</p>
                    </div>
                    <div class="cart-item-pricing">
                        <span>Unitario: ${formatPrice(item.product.price)}</span>
                        <strong>${formatPrice(item.lineTotal)}</strong>
                    </div>
                    <div class="cart-item-controls" data-cart-item="${item.product.id}">
                        ${renderQuantitySelector(item.quantity)}
                        <button type="button" class="cart-remove-btn" data-remove-item="${item.product.id}">Eliminar</button>
                    </div>
                </div>
            </article>
        `)
        .join('');
}

function renderSummary(cartTotals) {
    return `
        <div class="summary-row">
            <span>Productos</span>
            <strong>${cartTotals.count}</strong>
        </div>
        <div class="summary-row">
            <span>Subtotal</span>
            <strong>${formatPrice(cartTotals.subtotal)}</strong>
        </div>
        <div class="summary-row">
            <span>Envío</span>
            <strong>${cartTotals.subtotal > 0 ? 'A coordinar' : formatPrice(0)}</strong>
        </div>
        <div class="summary-row total">
            <span>Total estimado</span>
            <strong>${formatPrice(cartTotals.total)}</strong>
        </div>
    `;
}

export function initCartPage() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummaryContainer = document.getElementById('cartSummary');
    const checkoutButton = document.getElementById('checkoutButton');
    const clearCartButton = document.getElementById('clearCartButton');
    const checkoutForm = document.getElementById('checkoutForm');

    if (!cartItemsContainer || !cartSummaryContainer) {
        return;
    }

    const render = () => {
        const cartTotals = getCartTotals();

        cartItemsContainer.innerHTML = renderCartItems(cartTotals);
        cartSummaryContainer.innerHTML = renderSummary(cartTotals);

        if (checkoutButton) {
            checkoutButton.disabled = !cartTotals.items.length;
        }

        document.querySelectorAll('.cart-item-controls').forEach(control => {
            const productId = Number(control.dataset.cartItem);
            const quantityRoot = control.querySelector('.quantity-selector');
            const input = quantityRoot?.querySelector('.quantity-input');

            control.querySelector('[data-quantity-action="decrease"]')?.addEventListener('click', () => {
                updateCartQuantity(productId, Number(input.value) - 1);
            });

            control.querySelector('[data-quantity-action="increase"]')?.addEventListener('click', () => {
                updateCartQuantity(productId, Number(input.value) + 1);
            });

            input?.addEventListener('change', () => {
                updateCartQuantity(productId, input.value);
            });
        });

        document.querySelectorAll('[data-remove-item]').forEach(button => {
            button.addEventListener('click', () => {
                removeFromCart(button.dataset.removeItem);
                showToast('Perfume eliminado del carrito.');
            });
        });
    };

    clearCartButton?.addEventListener('click', () => {
        clearCart();
        showToast('Carrito vaciado.');
    });

    checkoutButton?.addEventListener('click', () => {
        const cartTotals = getCartTotals();

        if (!cartTotals.items.length) {
            return;
        }

        const formData = new FormData(checkoutForm);
        const customerInfo = {
            name: formData.get('name')?.toString().trim(),
            phone: formData.get('phone')?.toString().trim(),
            delivery: formData.get('delivery')?.toString().trim(),
            notes: formData.get('notes')?.toString().trim()
        };

        window.open(buildWhatsAppMessage(cartTotals, customerInfo), '_blank', 'noopener,noreferrer');
    });

    subscribeToCart(render);
}
