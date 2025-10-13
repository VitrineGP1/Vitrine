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
            const currentPath = window.location.pathname;
            const productId = currentPath.replace('/', '') || 'produto-home'; // Usa a URL como ID único
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

            // Gerenciar carrinho baseado no status de login
            const storage = window.storageHelper || { getItem: (k) => localStorage.getItem(k), setItem: (k,v) => localStorage.setItem(k,v) };
            const user = JSON.parse(storage.getItem('loggedUser')) || null;
            let cart = [];
            
            if (user) {
                // Usuário logado - usar carrinho associado ao usuário
                cart = JSON.parse(storage.getItem(`cart_${user.ID_USUARIO}`)) || [];
            } else {
                // Usuário não logado - usar carrinho de sessão
                cart = JSON.parse(storage.getItem('cart_session')) || [];
            }

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

            // Salvar carrinho baseado no status de login
            if (user) {
                storage.setItem(`cart_${user.ID_USUARIO}`, JSON.stringify(cart));
            } else {
                storage.setItem('cart_session', JSON.stringify(cart));
            }
            
            // Manter compatibilidade com carrinho.js
            storage.setItem('cart', JSON.stringify(cart));

            console.log('Carrinho atual:', cart);
        });
    }
});