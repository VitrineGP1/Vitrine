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
        // Opcional: Ocultar a mensagem após alguns segundos
        setTimeout(() => {
            cartFeedbackMessage.style.display = 'none';
        }, 3000);
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            // Extrai informações do produto do HTML
            const productId = 'cesto-organizador-1'; // ID fixo para este produto, idealmente viria do backend/URL
            const name = productTitle.textContent.trim();
            const priceText = productPrice.textContent.trim().replace('R$', '').replace(',', '.');
            const price = parseFloat(priceText);
            const image = productImage.src;

            if (!name || isNaN(price) || !image) {
                showCartFeedback('Erro: Não foi possível obter os detalhes do produto.', 'cart-error');
                console.error('Dados do produto ausentes:', { name, price, image });
                return;
            }

            const product = {
                id: productId,
                name: name,
                price: price,
                image: image,
                quantity: 1 // Inicia com 1 unidade no carrinho
            };

            // Obtém o carrinho atual do localStorage
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Verifica se o produto já está no carrinho
            const existingProductIndex = cart.findIndex(item => item.id === product.id);

            if (existingProductIndex > -1) {
                // Se o produto já existe, aumenta a quantidade
                cart[existingProductIndex].quantity += 1;
                showCartFeedback(`${name} (x${cart[existingProductIndex].quantity}) adicionado ao carrinho!`, 'cart-success');
            } else {
                // Se o produto não existe, adiciona-o
                cart.push(product);
                showCartFeedback(`${name} adicionado ao carrinho!`, 'cart-success');
            }

            // Salva o carrinho atualizado no localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            console.log('Carrinho atual:', cart);
        });
    }
});