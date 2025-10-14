document.addEventListener('DOMContentLoaded', async () => {
    const productForm = document.getElementById('product-form');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productDescriptionInput = document.getElementById('product-description');
    const productPriceInput = document.getElementById('product-price');
    const productImageUrlInput = document.getElementById('product-image-url');
    const productImageFileInput = document.getElementById('product-image-file'); // Input de arquivo do produto
    const productImagePreview = document.getElementById('product-image-preview'); // Pré-visualização da imagem do produto
    const saveProductBtn = document.getElementById('save-product-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const productsList = document.getElementById('products-list');
    const formFeedbackMessage = document.getElementById('form-feedback-message');
    const noProductsMessage = document.getElementById('no-products-message');
    const sellerLogoutBtn = document.getElementById('seller-logout-btn');

    // NOVOS ELEMENTOS para a foto de perfil da loja
    const storeProfileImageDisplay = document.getElementById('storeProfileImageDisplay');
    const storeProfileImageUpload = document.getElementById('storeProfileImageUpload');
    const saveStoreProfileBtn = document.getElementById('saveStoreProfileBtn');
    const storeProfileFeedbackMessage = document.getElementById('storeProfileFeedbackMessage');

    const API_PRODUCTS_URL = '/api/products';
    // NOVA ROTA: Para buscar e atualizar dados do perfil do vendedor (incluindo a foto da loja)
    const API_SELLER_PROFILE_URL = '/api/admin/seller-profile';
    const API_LOGIN_URL = '/api/login_usuario'; // Mantido para redirecionamento

    let currentSellerId = null;
    let currentProductImageBase64 = null; // Variável para armazenar a imagem Base64 do produto
    let currentStoreProfileImageBase64 = null; // Variável para armazenar a imagem Base64 da loja

    // Função para exibir mensagens de feedback
    function showFeedback(element, message, type) {
        element.textContent = message;
        element.className = `feedback-message ${type}-message`;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    // Função para limpar o formulário de produto
    function clearProductForm() {
        productIdInput.value = '';
        productNameInput.value = '';
        productDescriptionInput.value = '';
        productPriceInput.value = '';
        productImageUrlInput.value = '';
        productImageFileInput.value = ''; // Limpa o input de arquivo do produto
        productImagePreview.src = 'https://placehold.co/150x150/cccccc/333333?text=Pré-visualização'; // Reseta a pré-visualização do produto
        currentProductImageBase64 = null; // Limpa a imagem Base64 do produto
        saveProductBtn.textContent = 'Adicionar Produto';
        cancelEditBtn.style.display = 'none';
        formFeedbackMessage.style.display = 'none';
    }

    // Função para carregar os produtos do vendedor
    async function loadSellerProducts() {
        if (!currentSellerId) {
            productsList.innerHTML = '';
            noProductsMessage.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${API_PRODUCTS_URL}?seller_id=${currentSellerId}`);
            const result = await response.json();

            if (result.success && result.products.length > 0) {
                productsList.innerHTML = ''; // Limpa a lista atual
                noProductsMessage.style.display = 'none'; // Oculta a mensagem de "sem produtos"

                result.products.forEach(product => {
                    const row = document.createElement('tr');
                    // Decide qual imagem usar: Base64 (se existir) ou URL
                    const imageUrlToDisplay = product.IMAGEM_BASE64 || product.IMAGEM_URL || 'https://placehold.co/80x80/cccccc/333333?text=Sem+Imagem';
                    row.innerHTML = `
                        <td><img src="${imageUrlToDisplay}" alt="${product.NOME_PROD}" onerror="this.onerror=null;this.src='https://placehold.co/80x80/cccccc/333333?text=Sem+Imagem';"></td>
                        <td>${product.NOME_PROD}</td>
                        <td>R$ ${parseFloat(product.VALOR_UNITARIO).toFixed(2).replace('.', ',')}</td>
                        <td class="product-actions">
                            <button class="edit-btn" data-id="${product.ID_PROD}">Editar</button>
                            <button class="delete-btn" data-id="${product.ID_PROD}">Excluir</button>
                        </td>
                    `;
                    row.setAttribute('data-product-id', product.ID_PROD); // Adiciona data-id para fácil acesso
                    productsList.appendChild(row);
                });
            } else if (result.success && result.products.length === 0) {
                productsList.innerHTML = '';
                noProductsMessage.style.display = 'block'; // Mostra a mensagem de "sem produtos"
            } else {
                showFeedback(formFeedbackMessage, result.message || 'Erro ao carregar produtos.', 'error');
                productsList.innerHTML = '';
                noProductsMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Erro na requisição de produtos:', error);
            showFeedback(formFeedbackMessage, 'Erro de conexão ao carregar produtos.', 'error');
            productsList.innerHTML = '';
            noProductsMessage.style.display = 'block';
        }
    }

    // Função para carregar a imagem de perfil da loja (agora busca da nova API)
    async function loadStoreProfileImage() {
        if (!currentSellerId) {
            storeProfileImageDisplay.src = 'https://placehold.co/150x150/cccccc/333333?text=Sem+Foto+Loja';
            return;
        }
        try {
            const response = await fetch(`${API_SELLER_PROFILE_URL}?id_vendedor=${currentSellerId}`);
            const result = await response.json();

            if (result.success && result.seller && result.seller.IMAGEM_PERFIL_LOJA_BASE64) {
                storeProfileImageDisplay.src = result.seller.IMAGEM_PERFIL_LOJA_BASE64;
                currentStoreProfileImageBase64 = result.seller.IMAGEM_PERFIL_LOJA_BASE64;
            } else {
                storeProfileImageDisplay.src = 'https://placehold.co/150x150/cccccc/333333?text=Sem+Foto+Loja';
                currentStoreProfileImageBase64 = null;
            }
        } catch (error) {
            console.error('Erro ao carregar foto de perfil da loja:', error);
            storeProfileImageDisplay.src = 'https://placehold.co/150x150/cccccc/333333?text=Erro+Foto';
            currentStoreProfileImageBase64 = null;
        }
    }

    // --- Event Listeners ---

    // 1. Verificação de autenticação do vendedor e carregamento inicial
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        if (user.type === 'seller' || user.type === 'admin') { // Ajuste o tipo conforme seu BD
            currentSellerId = user.id;
            loadSellerProducts(); // Carrega produtos
            loadStoreProfileImage(); // Carrega foto de perfil da loja
        } else {
            showFeedback(formFeedbackMessage, 'Acesso negado. Você não é um vendedor.', 'error');
            setTimeout(() => { window.location.href = '/login'; }, 2000);
        }
    } else {
        showFeedback(formFeedbackMessage, 'Você não está logado. Redirecionando para o login...', 'error');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
    }

    // Pré-visualização da imagem do PRODUTO e conversão para Base64
    productImageFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validações básicas (tamanho e tipo)
            if (file.size > 2 * 1024 * 1024) { // Limite de 2MB
                showFeedback(formFeedbackMessage, 'A imagem do produto deve ter no máximo 2MB.', 'error');
                productImageFileInput.value = ''; // Limpa o input
                productImagePreview.src = 'https://placehold.co/150x150/cccccc/333333?text=Pré-visualização';
                currentProductImageBase64 = null;
                return;
            }
            if (!file.type.startsWith('image/')) {
                showFeedback(formFeedbackMessage, 'Por favor, selecione um arquivo de imagem válido para o produto.', 'error');
                productImageFileInput.value = '';
                productImagePreview.src = 'https://placehold.co/150x150/cccccc/333333?text=Pré-visualização';
                currentProductImageBase64 = null;
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                productImagePreview.src = e.target.result; // Pré-visualiza
                currentProductImageBase64 = e.target.result; // Armazena a string Base64
                productImageUrlInput.value = ''; // Limpa o campo de URL se um arquivo for importado
            };
            reader.readAsDataURL(file); // Lê o arquivo como Base64
        } else {
            productImagePreview.src = 'https://placehold.co/150x150/cccccc/333333?text=Pré-visualização';
            currentProductImageBase64 = null;
        }
    });

    // Pré-visualização da imagem de PERFIL DA LOJA e conversão para Base64
    if (storeProfileImageUpload) { // Verifica se o elemento existe no HTML
        storeProfileImageUpload.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                // Validações básicas (tamanho e tipo)
                if (file.size > 1 * 1024 * 1024) { // Limite de 1MB para perfil
                    showFeedback(storeProfileFeedbackMessage, 'A imagem de perfil deve ter no máximo 1MB.', 'error');
                    storeProfileImageUpload.value = '';
                    storeProfileImageDisplay.src = 'https://placehold.co/150x150/cccccc/333333?text=Sem+Foto+Loja';
                    currentStoreProfileImageBase64 = null;
                    return;
                }
                if (!file.type.startsWith('image/')) {
                    showFeedback(storeProfileFeedbackMessage, 'Por favor, selecione um arquivo de imagem válido para o perfil.', 'error');
                    storeProfileImageUpload.value = '';
                    storeProfileImageDisplay.src = 'https://placehold.co/150x150/cccccc/333333?text=Sem+Foto+Loja';
                    currentStoreProfileImageBase64 = null;
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    storeProfileImageDisplay.src = e.target.result;
                    currentStoreProfileImageBase64 = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                storeProfileImageDisplay.src = 'https://placehold.co/150x150/cccccc/333333?text=Sem+Foto+Loja';
                currentStoreProfileImageBase64 = null;
            }
        });
    }

    // Envio do formulário (Adicionar/Editar Produto)
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        formFeedbackMessage.style.display = 'none';

        const productId = productIdInput.value;
        const productName = productNameInput.value.trim();
        const productDescription = productDescriptionInput.value.trim();
        const productPrice = parseFloat(productPriceInput.value);
        let productImageUrl = productImageUrlInput.value.trim(); // Pode ser vazio se usar Base64

        if (!productName || isNaN(productPrice) || productPrice <= 0) {
            showFeedback(formFeedbackMessage, 'Por favor, preencha nome e preço válidos.', 'error');
            return;
        }

        // Se uma imagem foi carregada via arquivo, ela tem precedência sobre a URL
        if (currentProductImageBase64) {
            productImageUrl = ''; // Garante que a URL não seja enviada se Base64 for usado
        } else if (!productImageUrl) {
            // Se nem Base64 nem URL foram fornecidos, pode ser um erro ou produto sem imagem
            // Depende da sua regra de negócio se a imagem é obrigatória
            // Por enquanto, permite sem imagem
        }

        const method = productId ? 'PUT' : 'POST';
        const url = productId ? `${API_PRODUCTS_URL}/${productId}` : API_PRODUCTS_URL;

        const productData = {
            NOME_PROD: productName,
            DESCRICAO_PROD: productDescription,
            VALOR_UNITARIO: productPrice,
            IMAGEM_URL: productImageUrl,
            IMAGEM_BASE64: currentProductImageBase64, // Envia a imagem Base64 do produto
            ID_VENDEDOR: currentSellerId,
            ID_CATEGORIA: null // Você pode adicionar um campo para categoria no HTML se precisar
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showFeedback(formFeedbackMessage, result.message, 'success');
                clearProductForm(); // Limpa apenas o formulário de produto
                loadSellerProducts(); // Recarrega a lista de produtos
            } else {
                showFeedback(formFeedbackMessage, result.message || 'Erro ao salvar produto.', 'error');
            }
        } catch (error) {
            console.error('Erro na requisição de salvar produto:', error);
            showFeedback(formFeedbackMessage, 'Erro de conexão com o servidor.', 'error');
        }
    });

    // Envio do formulário para salvar a foto de perfil da loja (agora usa a nova API)
    if (saveStoreProfileBtn) {
        saveStoreProfileBtn.addEventListener('click', async () => {
            if (!currentSellerId) {
                showFeedback(storeProfileFeedbackMessage, 'Erro: ID do vendedor não encontrado.', 'error');
                return;
            }

            if (!currentStoreProfileImageBase64) {
                showFeedback(storeProfileFeedbackMessage, 'Por favor, selecione uma imagem para o perfil da loja.', 'error');
                return;
            }

            try {
                const response = await fetch(API_SELLER_PROFILE_URL, { // Usa a nova API para perfil do vendedor
                    method: 'PUT', // Ou POST se for a primeira vez
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_vendedor: currentSellerId, // Envia o ID do vendedor
                        IMAGEM_PERFIL_LOJA_BASE64: currentStoreProfileImageBase64,
                        // Se houver outros campos de perfil do vendedor na tabela VENDEDORES, adicione-os aqui
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showFeedback(storeProfileFeedbackMessage, 'Foto de perfil da loja atualizada com sucesso!', 'success');
                    // Opcional: Atualiza o localStorage se a imagem for usada em outros lugares
                    let user = JSON.parse(localStorage.getItem('loggedInUser'));
                    if (user) {
                        user.IMAGEM_PERFIL_LOJA_BASE64 = currentStoreProfileImageBase64; // Adiciona/atualiza no localStorage do usuário logado
                        localStorage.setItem('loggedInUser', JSON.stringify(user));
                    }
                } else {
                    showFeedback(storeProfileFeedbackMessage, result.message || 'Erro ao atualizar foto de perfil da loja.', 'error');
                }
            } catch (error) {
                console.error('Erro na requisição de atualização de perfil da loja:', error);
                showFeedback(storeProfileFeedbackMessage, 'Erro de conexão com o servidor.', 'error');
            }
        });
    }

    // Botões de Editar/Excluir na lista de produtos
    productsList.addEventListener('click', async (event) => {
        const target = event.target;
        const productId = target.dataset.id; // Pega o ID do atributo data-id

        if (!productId) return;

        if (target.classList.contains('edit-btn')) {
            // Lógica para preencher o formulário para edição
            const productToEditRow = Array.from(productsList.children).find(row => row.dataset.productId === productId);
            if (productToEditRow) {
                productIdInput.value = productId;
                productNameInput.value = productToEditRow.children[1].textContent; // Nome
                productPriceInput.value = parseFloat(productToEditRow.children[2].textContent.replace('R$', '').replace(',', '.')); // Preço

                // Tenta pegar a URL da imagem da linha
                const imgElement = productToEditRow.querySelector('img');
                if (imgElement && !imgElement.src.includes('placehold.co')) { // Evita placeholders
                    // Se a imagem atual é Base64, preenche a pré-visualização e a variável Base64
                    // Se a imagem atual é uma URL, preenche o campo de URL e a pré-visualização
                    if (imgElement.src.startsWith('data:image/')) {
                        productImagePreview.src = imgElement.src;
                        currentProductImageBase64 = imgElement.src;
                        productImageUrlInput.value = ''; // Garante que o campo de URL esteja vazio
                    } else {
                        productImageUrlInput.value = imgElement.src;
                        productImagePreview.src = imgElement.src;
                        currentProductImageBase64 = null; // Garante que não envie Base64 antigo
                    }
                } else {
                    productImageUrlInput.value = '';
                    productImagePreview.src = 'https://placehold.co/150x150/cccccc/333333?text=Pré-visualização';
                    currentProductImageBase64 = null;
                }
                
                // Para descrição, você precisaria de um atributo data-description na linha ou buscar via API.
                // productDescriptionInput.value = productToEditRow.dataset.description || ''; 

                saveProductBtn.textContent = 'Salvar Edição';
                cancelEditBtn.style.display = 'inline-block';
                showFeedback(formFeedbackMessage, 'Preencha os campos para editar o produto.', 'success');
            }
        } else if (target.classList.contains('delete-btn')) {
            // Lógica para excluir produto
            if (confirm('Tem certeza que deseja excluir este produto?')) {
                try {
                    const response = await fetch(`${API_PRODUCTS_URL}/${productId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ID_VENDEDOR: currentSellerId }) // Envia o ID do vendedor para verificação
                    });
                    const result = await response.json();

                    if (response.ok && result.success) {
                        showFeedback(formFeedbackMessage, result.message, 'success');
                        loadSellerProducts(); // Recarrega a lista
                    } else {
                        showFeedback(formFeedbackMessage, result.message || 'Erro ao excluir produto.', 'error');
                    }
                } catch (error) {
                    console.error('Erro na requisição de exclusão:', error);
                    showFeedback(formFeedbackMessage, 'Erro de conexão ao excluir produto.', 'error');
                }
            }
        }
    });

    // Botão Cancelar Edição
    cancelEditBtn.addEventListener('click', clearProductForm); // Agora limpa apenas o formulário de produto

    // Botão Sair da Área do Vendedor (Logout)
    sellerLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser'); // Remove o usuário logado
        showFeedback(formFeedbackMessage, 'Saindo...', 'success');
        setTimeout(() => { window.location.href = '/login'; }, 500); // Redireciona para o login
    });
});