document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    
    if (!user.id || user.type !== 'client') {
        window.location.href = '/login';
        return;
    }

    loadClientData();
    setupForms();
});

async function loadClientData() {
    try {
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        const response = await fetch(`/api/buscar_usuario?id=${user.id}`);
        const data = await response.json();
        
        if (data.success) {
            const userData = data.user;
            document.getElementById('nome').value = userData.NOME_USUARIO || '';
            document.getElementById('email').value = userData.EMAIL_USUARIO || '';
            document.getElementById('celular').value = userData.CELULAR_USUARIO || '';
            document.getElementById('data-nascimento').value = userData.DT_NASC_USUARIO || '';
            document.getElementById('cep').value = userData.CEP_USUARIO || '';
            document.getElementById('logradouro').value = userData.LOGRADOURO_USUARIO || '';
            document.getElementById('bairro').value = userData.BAIRRO_USUARIO || '';
            document.getElementById('cidade').value = userData.CIDADE_USUARIO || '';
            document.getElementById('uf').value = userData.UF_USUARIO || '';
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function setupForms() {
    document.getElementById('client-profile-form').addEventListener('submit', updateClientData);
    document.getElementById('address-form').addEventListener('submit', updateAddress);
    document.getElementById('cep').addEventListener('blur', buscarCEP);
}

async function updateClientData(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        celular: formData.get('celular'),
        data_nascimento: formData.get('data_nascimento')
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
            alert('Dados atualizados com sucesso!');
        } else {
            alert('Erro ao atualizar dados: ' + result.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar dados');
    }
}

async function updateAddress(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const addressData = {
        cep: formData.get('cep'),
        logradouro: formData.get('logradouro'),
        bairro: formData.get('bairro'),
        cidade: formData.get('cidade'),
        uf: formData.get('uf')
    };

    try {
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        const response = await fetch('/api/update_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, ...addressData })
        });

        const result = await response.json();
        if (result.success) {
            alert('Endereço atualizado com sucesso!');
        } else {
            alert('Erro ao atualizar endereço: ' + result.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar endereço');
    }
}

async function buscarCEP() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    if (cep.length === 8) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                document.getElementById('logradouro').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('uf').value = data.uf;
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    }
}

function logout() {
    localStorage.removeItem('loggedUser');
    window.location.href = '/login';
}