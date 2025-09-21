document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalPriceSpan = document.getElementById('subtotal-price');
    const totalPriceSpan = document.getElementById('total-price');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    // Função para carregar e exibir os itens do carrinho
    function loadCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = ''; // Limpa o conteúdo atual da tabela

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block'; // Mostra a mensagem de carrinho vazio
            cartItemsContainer.style.display = 'none'; // Oculta a tabela
        } else {
            emptyCartMessage.style.display = 'none'; // Oculta a mensagem de carrinho vazio
            cartItemsContainer.style.display = 'table-row-group'; // Mostra a tabela (tbody)
            cart.forEach(item => {
                const row = document.createElement('tr');
                row.setAttribute('data-product-id', item.id); // Armazena o ID do produto na linha

                const itemTotal = item.price * item.quantity;

                row.innerHTML = `
                    <td>
                        <div class="product">
                            <img src="${item.image}" alt="${item.name}" />
                            <div class="info">
                                <div class="name">${item.name}</div>
                                <div class="category">Artesanato</div> <!-- Categoria fixa por enquanto -->
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
        updateCartTotals(); // Atualiza os totais após carregar os itens
    }

    // Função para atualizar os totais do carrinho
    function updateCartTotals() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = 0;
        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });

        // Frete fixo para demonstração, pode ser calculado dinamicamente
        const shippingCost = 0; // Gratuito

        const total = subtotal + shippingCost;

        subtotalPriceSpan.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        totalPriceSpan.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // Função para manipular eventos de clique (aumentar/diminuir/remover)
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr[data-product-id]'); // Encontra a linha do produto
        if (!row) return; // Se não encontrou a linha, sai

        const productId = row.getAttribute('data-product-id');
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex === -1) return; // Produto não encontrado no carrinho

        if (target.classList.contains('qty-plus') || target.closest('.qty-plus')) {
            // Aumentar quantidade
            cart[itemIndex].quantity += 1;
        } else if (target.classList.contains('qty-minus') || target.closest('.qty-minus')) {
            // Diminuir quantidade
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                // Se a quantidade for 1 e tentar diminuir, remove o item
                cart.splice(itemIndex, 1);
            }
        } else if (target.classList.contains('remove-item') || target.closest('.remove-item')) {
            // Remover item
            cart.splice(itemIndex, 1);
        } else {
            return; // Não é um botão de quantidade ou remover
        }

        localStorage.setItem('cart', JSON.stringify(cart)); // Salva o carrinho atualizado
        loadCartItems(); // Recarrega os itens e atualiza os totais
    });

    // Carrega os itens do carrinho quando a página é carregada
    loadCartItems();
});
