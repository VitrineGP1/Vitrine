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
            // Adicionar estado de loading ao botão
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'ADICIONANDO...';
            addToCartBtn.style.backgroundColor = '#ccc';

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

            // Tentar sincronizar com servidor se usuário estiver logado
            syncCartWithServer(product);

            // Atualizar contador do carrinho no header
            updateCartCounter();

            // Resetar botão após 2 segundos
            setTimeout(() => {
                addToCartBtn.disabled = false;
                addToCartBtn.textContent = 'ADICIONAR AO CARRINHO';
                addToCartBtn.style.backgroundColor = '#e47a1b';
            }, 2000);

            // Animação de produto voando para o carrinho
            animateProductToCart();
        });
    } else {
        console.error('Botão adicionar ao carrinho não encontrado');
    }

    // Função para atualizar contador do carrinho
    function updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        // Atualizar badge no header
        const cartLink = document.querySelector('a[href="/carrinho"]');
        if (cartLink) {
            let badge = cartLink.querySelector('.cart-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.style.cssText = `
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #e74c3c;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 10;
                `;
                cartLink.style.position = 'relative';
                cartLink.appendChild(badge);
            }
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // Função para animação do produto voando para o carrinho
    function animateProductToCart() {
        const productImg = document.getElementById('product-image');
        const cartIcon = document.querySelector('a[href="/carrinho"] i');

        if (productImg && cartIcon) {
            // Criar clone da imagem do produto
            const flyingImg = productImg.cloneNode(true);
            flyingImg.id = 'flying-product';
            flyingImg.style.cssText = `
                position: fixed;
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 8px;
                z-index: 9999;
                pointer-events: none;
                transition: all 1s ease-in-out;
            `;

            // Posicionar inicialmente sobre a imagem do produto
            const productRect = productImg.getBoundingClientRect();
            flyingImg.style.left = productRect.left + 'px';
            flyingImg.style.top = productRect.top + 'px';

            document.body.appendChild(flyingImg);

            // Calcular posição final (ícone do carrinho)
            const cartRect = cartIcon.getBoundingClientRect();
            const finalLeft = cartRect.left + cartRect.width / 2 - 40;
            const finalTop = cartRect.top + cartRect.height / 2 - 40;

            // Animação
            setTimeout(() => {
                flyingImg.style.left = finalLeft + 'px';
                flyingImg.style.top = finalTop + 'px';
                flyingImg.style.transform = 'scale(0.3)';
                flyingImg.style.opacity = '0.7';
            }, 100);

            // Remover elemento após animação
            setTimeout(() => {
                if (flyingImg.parentNode) {
                    flyingImg.parentNode.removeChild(flyingImg);
                }
            }, 1100);
        }
    }

    // Função para sincronizar carrinho com servidor
    function syncCartWithServer(product) {
        const loggedUser = localStorage.getItem('loggedUser');
        if (!loggedUser) return; // Usuário não logado, não sincronizar

        try {
            const user = JSON.parse(loggedUser);
            if (!user || !user.id) return;

            // Enviar requisição para API
            fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-logged-user': loggedUser
                },
                body: JSON.stringify({
                    productId: product.id.split('-')[0], // Remover sufixo de tamanho se existir
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: product.quantity,
                    size: product.size
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Carrinho sincronizado com servidor:', data.message);
                } else {
                    console.error('Erro ao sincronizar carrinho:', data.message);
                }
            })
            .catch(error => {
                console.error('Erro na requisição de sincronização:', error);
            });
        } catch (e) {
            console.error('Erro ao sincronizar carrinho:', e);
        }
    }

    // Inicializar contador do carrinho
    updateCartCounter();
});
