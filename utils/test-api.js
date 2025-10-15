const fetch = require('node-fetch');

async function testAPI() {
    try {
        console.log('=== TESTANDO API ADMIN/USERS ===');
        
        const response = await fetch('http://localhost:3030/api/admin/users');
        const data = await response.json();
        
        console.log('Status:', response.status);
        console.log('Resposta:', JSON.stringify(data, null, 2));
        
    } catch (error) {
        console.error('Erro:', error.message);
    }
}

testAPI();