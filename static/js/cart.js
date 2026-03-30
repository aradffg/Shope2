/**
 * ElectroStore — Shopping Cart JS
 * Handles AJAX requests and side-drawer UI.
 */

// CSRF Token Helper
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', () => {
    const cartToggle = document.getElementById('cart-toggle');
    const cartClose = document.getElementById('cart-close');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartBadgeCount = document.getElementById('cart-badge-count');
    const cartHeaderCount = document.getElementById('cart-count-header');
    const cartTotalPrice = document.getElementById('cart-total-price');

    // Toggle Drawer Open
    if (cartToggle) {
        cartToggle.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }

    // Toggle Drawer Close
    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        fetchCartDetails();
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Format currency to 2 decimal places
    function formatMoney(amount) {
        return `$${parseFloat(amount).toFixed(2)}`;
    }

    // Render the Cart Items
    function renderCart(data) {
        // Update counts and total
        if(cartBadgeCount) cartBadgeCount.textContent = data.cart_total_items;
        if(cartHeaderCount) cartHeaderCount.textContent = data.cart_total_items;
        if(cartTotalPrice) cartTotalPrice.textContent = formatMoney(data.cart_total_price);

        if (data.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty__icon">🛍️</div>
                    <p>Your cart is empty.</p>
                </div>
            `;
            return;
        }

        let html = '';
        data.items.forEach(item => {
            html += `
            <div class="cart-item" data-id="${item.product_id}">
                <div class="cart-item__image-wrap">
                    ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" class="cart-item__image">` : '📦'}
                </div>
                <div class="cart-item__details">
                    <div>
                        <h4 class="cart-item__title">${item.title}</h4>
                        <div class="cart-item__price">${formatMoney(item.price)}</div>
                    </div>
                    <div class="cart-item__actions">
                        <div class="cart-item__qty">
                            <button type="button" class="qty-btn js-qty-minus" data-id="${item.product_id}">-</button>
                            <span class="js-qty-val">${item.quantity}</span>
                            <button type="button" class="qty-btn js-qty-plus" data-id="${item.product_id}">+</button>
                        </div>
                        <button type="button" class="btn--text cart-item__remove js-remove-item" data-id="${item.product_id}">Remove</button>
                    </div>
                </div>
            </div>
            `;
        });
        cartItemsContainer.innerHTML = html;
        attachCartListeners();
    }

    // Fetch Cart Data
    function fetchCartDetails() {
        cartDrawer.classList.add('loading');
        fetch('/cart/')
            .then(response => response.json())
            .then(data => {
                renderCart(data);
            })
            .catch(error => console.error('Error fetching cart:', error))
            .finally(() => {
                cartDrawer.classList.remove('loading');
            });
    }

    // Attach listeners to newly rendered items
    function attachCartListeners() {
        // Remove item buttons
        document.querySelectorAll('.js-remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                updateCartItem(id, 'remove');
            });
        });

        // Quantity Minus buttons
        document.querySelectorAll('.js-qty-minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const valElem = this.closest('.cart-item__qty').querySelector('.js-qty-val');
                let qty = parseInt(valElem.textContent) - 1;
                updateCartItem(id, 'update', qty);
            });
        });

        // Quantity Plus buttons
        document.querySelectorAll('.js-qty-plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const valElem = this.closest('.cart-item__qty').querySelector('.js-qty-val');
                let qty = parseInt(valElem.textContent) + 1;
                updateCartItem(id, 'update', qty);
            });
        });
    }

    // Master function for cart updates (add/remove/update quantity)
    function updateCartItem(productId, action, quantity = 1) {
        cartDrawer.classList.add('loading');
        
        let url = '';
        const formData = new URLSearchParams();
        
        if (action === 'add') {
            url = `/cart/add/${productId}/`;
        } else if (action === 'remove') {
            url = `/cart/remove/${productId}/`;
        } else if (action === 'update') {
            url = `/cart/update/${productId}/`;
            formData.append('quantity', quantity);
        }

        fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Instantly update badge count if successful
                if(cartBadgeCount) cartBadgeCount.textContent = data.cart_total_items;
                // If drawer is open, refetch full details. Otherwise, just update badge.
                if (cartDrawer.classList.contains('open')) {
                    fetchCartDetails();
                } else {
                    cartDrawer.classList.remove('loading');
                    // Show a toast notification
                    if (window.showToast) window.showToast('Added to cart', 'success');
                    openCart(); // Auto-open cart on add
                }
            }
        })
        .catch(error => {
            console.error('Error updating cart:', error);
            cartDrawer.classList.remove('loading');
        });
    }

    // Attach "Add to Cart" functionality to all Add to Cart buttons on the site
    const addToCartBtns = document.querySelectorAll('.js-add-to-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-id');
            if (productId) {
                updateCartItem(productId, 'add');
            }
        });
    });

    // (Toast function removed - now uses global window.showToast from main.js)
});
