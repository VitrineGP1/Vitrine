document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    
    if (!user.id || user.type !== 'seller') {
        //window.location.href = '/login';
        //return;
    }

    loadSellerData();
    loadProducts();
    loadSalesData();
    setupForms();
});

async function loadSellerData() {
    try {
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        const sellerId = user.sellerId || user.id;
        
        const response = await fetch(`/api/seller_profile?id_vendedor=${sellerId}`);
        const data = await response.json();
        
        if (data.success) {
            const seller = data.seller;
            document.getElementById('nome-loja').value = seller.NOME_LOJA || '';
            document.getElementById('tipo-pessoa').value = seller.TIPO_PESSOA || 'PF';
            document.getElementById('digito-pessoa').value = seller.DIGITO_PESSOA || '';
            
            // Exibir CPF/CNPJ criptografado
            const cpfElement = document.getElementById('cpf-display');
            const cnpjElement = document.getElementById('cnpj-display');
            
            if (seller.TIPO_PESSOA === 'PF' && (seller.CPF_CLIENTE || seller.DIGITO_PESSOA)) {
                const cpf = seller.CPF_CLIENTE || seller.DIGITO_PESSOA;
                cpfElement.textContent = maskCPF(cpf);
                cpfElement.style.display = 'block';
                cnpjElement.style.display = 'none';
            } else if (seller.TIPO_PESSOA === 'PJ' && seller.DIGITO_PESSOA) {
                cnpjElement.textContent = maskCNPJ(seller.DIGITO_PESSOA);
                cnpjElement.style.display = 'block';
                cpfElement.style.display = 'none';
            }
            
            if (seller.IMAGEM_PERFIL_LOJA_BASE64) {
                const preview = document.getElementById('preview-foto-loja');
                preview.src = `data:image/jpeg;base64,${seller.IMAGEM_PERFIL_LOJA_BASE64}`;
                preview.style.display = 'block';
            }
        }

        // Carregar dados pessoais
        const userResponse = await fetch(`/api/buscar_usuario?id=${user.id}`);
        const userData = await userResponse.json();
        
        if (userData.success) {
            const userInfo = userData.user;
            document.getElementById('nome').value = userInfo.NOME_USUARIO || '';
            document.getElementById('email').value = userInfo.EMAIL_USUARIO || '';
            document.getElementById('celular').value = userInfo.CELULAR_USUARIO || '';
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

async function loadProducts() {
    try {
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        const sellerId = user.sellerId || user.id;
        
        const response = await fetch(`/api/products?seller_id=${sellerId}`);
        const data = await response.json();
        
        if (data.success) {
            const productsList = document.getElementById('products-list');
            productsList.innerHTML = data.products.map(product => `
                <article class="product-item">
                    <img src="${product.IMAGEM_BASE64 ? `data:image/jpeg;base64,${product.IMAGEM_BASE64}` : 'imagens/produto-default.jpg'}" alt="${product.NOME_PROD}">
                    <section class="product-info">
                        <h3>${product.NOME_PROD}</h3>
                        <p>R$ ${parseFloat(product.VALOR_UNITARIO).toFixed(2).replace('.', ',')}</p>
                        <button onclick="editProduct(${product.ID_PROD})" class="btn-edit">Editar</button>
                        <button onclick="deleteProduct(${product.ID_PROD})" class="btn-delete">Excluir</button>
                    </section>
                </article>
            `).join('');
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

async function loadSalesData() {
    // Dados simulados - implementar API real
    document.getElementById('total-sales').textContent = '15';
    document.getElementById('total-revenue').textContent = 'R$ 2.450,00';
}

function setupForms() {
    document.getElementById('seller-profile-form').addEventListener('submit', updateSellerData);
    document.getElementById('personal-data-form').addEventListener('submit', updatePersonalData);
    document.getElementById('foto-loja').addEventListener('change', previewImage);
}

async function updateSellerData(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const sellerData = {
        nome_loja: formData.get('nome_loja'),
        tipo_pessoa: formData.get('tipo_pessoa'),
        digito_pessoa: formData.get('digito_pessoa')
    };

    const fotoInput = document.getElementById('foto-loja');
    if (fotoInput.files[0]) {
        const base64 = await fileToBase64(fotoInput.files[0]);
        sellerData.imagem_perfil_loja_base64 = base64.split(',')[1];
    }

    try {
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        const response = await fetch('/api/seller_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_vendedor: user.sellerId || user.id, ...sellerData })
        });

        const result = await response.json();
        if (result.success) {
            alert('Dados da loja atualizados com sucesso!');
        } else {
            alert('Erro ao atualizar dados: ' + result.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar dados');
    }
}

async function updatePersonalData(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        celular: formData.get('celular')
    };

    try {
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        const response = await fetch('/api/update_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, ...userData })
        });

        const result = await response.json();
        if (result.success) {
            alert('Dados pessoais atualizados com sucesso!');
        } else {
            alert('Erro ao atualizar dados: ' + result.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar dados');
    }
}

function previewImage(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview-foto-loja');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function editProduct(id) {
    window.location.href = `/editar-produto/${id}`;
}

async function deleteProduct(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        try {
            const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const result = await response.json();
            
            if (result.success) {
                alert('Produto excluído com sucesso!');
                loadProducts();
            } else {
                alert('Erro ao excluir produto: ' + result.message);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir produto');
        }
    }
}

function maskCPF(cpf) {
    if (!cpf) return 'Não informado';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return 'CPF inválido';
    return `***.***.***-${cleaned.slice(-2)}`;
}

function maskCNPJ(cnpj) {
    if (!cnpj) return 'Não informado';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length !== 14) return 'CNPJ inválido';
    return `**.***.***/****-${cleaned.slice(-2)}`;
}

function logout() {
    localStorage.removeItem('loggedUser');
    window.location.href = '/login';
}