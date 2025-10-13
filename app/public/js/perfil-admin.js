document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    
    if (!user.id || user.type !== 'admin') {
        //window.location.href = '/login';
        //return;
    }

    loadAdminData();
    loadSystemStats();
    loadRecentActivity();
    setupForms();
});

async function loadAdminData() {
    try {
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        const response = await fetch(`/api/admin/user-details/${user.id}`);
        const data = await response.json();
        
        if (data.success) {
            const userData = data.user;
            document.getElementById('nome').value = userData.NOME_USUARIO || '';
            document.getElementById('email').value = userData.EMAIL_USUARIO || '';
            document.getElementById('celular').value = userData.CELULAR_USUARIO || '';
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

async function loadSystemStats() {
    try {
        // Carregar usuários
        const usersResponse = await fetch('/api/admin/users');
        const usersData = await usersResponse.json();
        
        if (usersData.success) {
            const totalUsers = usersData.users.length;
            const totalSellers = usersData.users.filter(user => user.TIPO_USUARIO === 'V').length;
            
            document.getElementById('total-users').textContent = totalUsers;
            document.getElementById('total-sellers').textContent = totalSellers;
        }

        // Carregar produtos
        const productsResponse = await fetch('/api/admin/products');
        const productsData = await productsResponse.json();
        
        if (productsData.success) {
            const totalProducts = productsData.products.length;
            const totalRevenue = productsData.products.reduce((sum, product) => 
                sum + parseFloat(product.VALOR_UNITARIO), 0
            );
            
            document.getElementById('total-products').textContent = totalProducts;
            document.getElementById('total-revenue').textContent = 
                `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function loadRecentActivity() {
    // Simulação de atividade recente - implementar API real
    const activities = [
        { type: 'user', action: 'Novo usuário cadastrado', time: '2 horas atrás' },
        { type: 'product', action: 'Produto adicionado', time: '4 horas atrás' },
        { type: 'sale', action: 'Nova venda realizada', time: '6 horas atrás' }
    ];

    const activityList = document.getElementById('recent-activity');
    activityList.innerHTML = activities.map(activity => `
        <article class="activity-item">
            <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            <section class="activity-info">
                <p>${activity.action}</p>
                <small>${activity.time}</small>
            </section>
        </article>
    `).join('');
}

function getActivityIcon(type) {
    const icons = {
        user: 'user-plus',
        product: 'box',
        sale: 'shopping-cart'
    };
    return icons[type] || 'info-circle';
}

function setupForms() {
    document.getElementById('admin-profile-form').addEventListener('submit', updateAdminData);
}

async function updateAdminData(e) {
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
            alert('Dados atualizados com sucesso!');
        } else {
            alert('Erro ao atualizar dados: ' + result.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar dados');
    }
}

function exportData() {
    // Implementar exportação de dados
    alert('Funcionalidade de exportação em desenvolvimento');
}

function logout() {
    localStorage.removeItem('loggedUser');
    window.location.href = '/login';
}