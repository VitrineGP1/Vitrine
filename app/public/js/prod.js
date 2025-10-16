document.addEventListener('DOMContentLoaded', () => {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const productImage = document.getElementById('product-image');
    const productTitle = document.getElementById('product-main-heading');
    const productPrice = document.getElementById('product-price');
    const cartFeedbackMessage = document.getElementById('cart-feedback-message');

    function showCartFeedback(message, type) {
        cartFeedbackMessage.textContent = message;
        cartFeedbackMessage.className = `message ${type}-message`;
        cartFeedbackMessage.style.display = 'block';
        setTimeout(() => {
            cartFeedbackMessage.style.display = 'none';
        }, 3000);
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            // Verificar se usuário está logado
            const loggedUser = localStorage.getItem('loggedUser');

            if (!loggedUser) {
                alert('Você precisa fazer login para adicionar produtos ao carrinho!');
                window.location.href = '/login';
                return;
            }

            try {
                const user = JSON.parse(loggedUser);
                if (!user || !user.id) {
                    alert('Sessão inválida. Faça login novamente.');
                    window.location.href = '/login';
                    return;
                }
            } catch (e) {
                alert('Erro na sessão. Faça login novamente.');
                window.location.href = '/login';
                return;
            }

            // Extrai informações do produto do HTML
            const productId = addToCartBtn.getAttribute('data-product-id') || 'produto-' + Date.now();
            const name = productTitle ? productTitle.textContent.trim() : '';
            const priceText = productPrice ? productPrice.textContent.trim().replace('R$', '').replace(',', '.') : '';
            const price = parseFloat(priceText);
            const image = productImage ? productImage.src : '';
            const quantityInput = document.getElementById('product-quantity');
            const quantity = parseInt(quantityInput ? quantityInput.value : 1);
            const sizeSelect = document.getElementById('product-size');
            const size = sizeSelect ? sizeSelect.value : null;

            if (!name || isNaN(price) || !image) {
                showCartFeedback('Erro: Não foi possível obter os detalhes do produto.', 'cart-error');
                return;
            }

            const product = {
                id: productId + (size ? '-' + size : ''),
                name: name,
                price: price,
                image: image,
                quantity: quantity,
                size: size
            };

            // Obtém o carrinho atual do localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Verifica se o produto já está no carrinho
            const existingProductIndex = cart.findIndex(item => item.id === product.id);

            if (existingProductIndex > -1) {
                // Se o produto já existe, aumenta a quantidade
                cart[existingProductIndex].quantity += quantity;
                const displayName = product.name + (size ? ' - Tamanho ' + size : '');
                showCartFeedback(`${displayName} (x${cart[existingProductIndex].quantity}) adicionado ao carrinho!`, 'cart-success');
            } else {
                // Se o produto não existe, adiciona-o
                cart.push(product);
                const displayName = product.name + (size ? ' - Tamanho ' + size : '');
                showCartFeedback(`${displayName} ${quantity > 1 ? '(x' + quantity + ')' : ''} adicionado ao carrinho!`, 'cart-success');
            }

            // Salva o carrinho atualizado no localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
        });
    } else {
        console.error('Botão adicionar ao carrinho não encontrado');
    }
});
