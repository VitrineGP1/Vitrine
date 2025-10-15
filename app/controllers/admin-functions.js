// Funções da Área Admin
async function loadAdminData() {
    try {
        const response = await fetch('/api/check_users');
        const data = await response.json();
        
        if (data.success) {
            const buyers = data.users.filter(user => user.TIPO_USUARIO === 'C');
            const sellers = data.users.filter(user => user.TIPO_USUARIO === 'S');
            
            document.getElementById('admin-total-users').textContent = data.users.length;
            document.getElementById('admin-total-sellers').textContent = sellers.length;
            
            const productsResponse = await fetch('/api/products');
            const productsData = await productsResponse.json();
            if (productsData.success) {
                document.getElementById('admin-total-products').textContent = productsData.products.length;
            }
            
            const buyersTable = document.getElementById('buyers-table');
            if (buyers.length > 0) {
                buyersTable.innerHTML = buyers.map(buyer => `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${buyer.ID_USUARIO}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${buyer.NOME_USUARIO}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${buyer.EMAIL_USUARIO}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">N/A</td>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">
                            <button onclick="viewUser(${buyer.ID_USUARIO})" style="background: #3498db; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">Ver</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                buyersTable.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #666;">Nenhum comprador encontrado</td></tr>';
            }
            
            const sellersTable = document.getElementById('sellers-table');
            if (sellers.length > 0) {
                sellersTable.innerHTML = sellers.map(seller => `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${seller.ID_USUARIO}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${seller.NOME_USUARIO}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${seller.EMAIL_USUARIO}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">CPF/CNPJ</td>
                        <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">
                            <button onclick="viewSeller(${seller.ID_USUARIO})" style="background: #3498db; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">Ver</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                sellersTable.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #666;">Nenhum vendedor encontrado</td></tr>';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar dados administrativos:', error);
    }
}

function viewUser(userId) {
    alert(`Visualizar usuário ID: ${userId}`);
}

function viewSeller(sellerId) {
    alert(`Visualizar vendedor ID: ${sellerId}`);
}