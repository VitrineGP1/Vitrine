document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalPriceSpan = document.getElementById('subtotal-price');
    const totalPriceSpan = document.getElementById('total-price');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    // Mostrar aviso se storage não estiver disponível
    if (window.storageHelper) {
        window.storageHelper.showStorageWarning();
    }

    function loadCartItems() {
        const storage = window.storageHelper || { getItem: (k) => localStorage.getItem(k), setItem: (k,v) => localStorage.setItem(k,v) };
        const user = JSON.parse(storage.getItem('loggedUser')) || null;
        let cart = [];
        
        if (user) {
            // Usuário logado - carregar carrinho do usuário
            cart = JSON.parse(storage.getItem(`cart_${user.ID_USUARIO}`)) || [];
        } else {
            // Usuário não logado - carregar carrinho de sessão
            cart = JSON.parse(storage.getItem('cart_session')) || [];
        }
        
        // Manter compatibilidade
        storage.setItem('cart', JSON.stringify(cart));
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            cartItemsContainer.style.display = 'none';
        } else {
            emptyCartMessage.style.display = 'none';
            cartItemsContainer.style.display = 'table-row-group';
            cart.forEach(item => {
                const row = document.createElement('tr');
                row.setAttribute('data-product-id', item.id);

                const itemTotal = item.price * item.quantity;

                row.innerHTML = `
                    <td>
                        <div class="product">
                            <img src="${item.image}" alt="${item.name}" />
                            <div class="info">
                                <div class="name">${item.name}</div>
                                <div class="category">Artesanato</div>
                            </div>
                        </div>
                    </td>
                    <td>R$ ${item.price.toFixed(2).replace('.', ',')}</td>
                    <td>
                        <div class="qty">
                            <button class="qty-minus" aria-label="Diminuir quantidade de ${item.name}"><i class="bx bx-minus"></i></button>
                            <span>${item.quantity}</span>
                            <button class="qty-plus" aria-label="Aumentar quantidade de ${item.name}"><i class="bx bx-plus"></i></button>
                        </div>
                    </td>
                    <td>R$ ${itemTotal.toFixed(2).replace('.', ',')}</td>
                    <td>
                        <button class="remove-item" aria-label="Remover ${item.name} do carrinho">
                            <i class="bx bx-x"></i>
                        </button>
                    </td>
                `;
                cartItemsContainer.appendChild(row);
            });
        }
        updateCartTotals();
        updateCheckoutButton();
    }

    function updateCartTotals() {
        const storage = window.storageHelper || { getItem: (k) => localStorage.getItem(k) };
        const cart = JSON.parse(storage.getItem('cart')) || [];
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        const shippingCost = 0;
        const total = subtotal + shippingCost;

        subtotalPriceSpan.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        totalPriceSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    function updateCheckoutButton() {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            const storage = window.storageHelper || { getItem: (k) => localStorage.getItem(k) };
            const cart = JSON.parse(storage.getItem('cart')) || [];
            checkoutBtn.disabled = cart.length === 0;
        }
    }

    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr[data-product-id]');
        if (!row) return;

        const productId = row.getAttribute('data-product-id');
        const storage = window.storageHelper || { getItem: (k) => localStorage.getItem(k), setItem: (k,v) => localStorage.setItem(k,v) };
        let cart = JSON.parse(storage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex === -1) return;

        if (target.classList.contains('qty-plus') || target.closest('.qty-plus')) {
            cart[itemIndex].quantity += 1;
        } else if (target.classList.contains('qty-minus') || target.closest('.qty-minus')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }
        } else if (target.classList.contains('remove-item') || target.closest('.remove-item')) {
            cart.splice(itemIndex, 1);
        } else {
            return;
        }

        // Salvar carrinho baseado no status de login
        const user = JSON.parse(storage.getItem('loggedUser')) || null;
        if (user) {
            storage.setItem(`cart_${user.ID_USUARIO}`, JSON.stringify(cart));
        } else {
            storage.setItem('cart_session', JSON.stringify(cart));
        }
        storage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
    });

    loadCartItems();
});