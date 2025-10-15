require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('=== USUÁRIOS CADASTRADOS ===');
        
        const [users] = await connection.execute('SELECT * FROM USUARIOS');
        
        if (users.length === 0) {
            console.log('❌ Nenhum usuário encontrado');
        } else {
            console.log(`✅ ${users.length} usuário(s) encontrado(s):\n`);
            
            users.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.ID_USUARIO}`);
                console.log(`   Nome: ${user.NOME_USUARIO}`);
                console.log(`   Email: ${user.EMAIL_USUARIO}`);
                console.log(`   Tipo: ${user.TIPO_USUARIO}`);
                console.log(`   Celular: ${user.CELULAR_USUARIO || 'Não informado'}`);
                console.log(`   Endereço: ${user.LOGRADOURO_USUARIO || 'Não informado'}`);
                console.log(`   Data Nasc: ${user.DT_NASC_USUARIO || 'Não informado'}`);
                console.log('   ---');
            });
        }
        
        // Verificar vendedores
        console.log('\n=== VENDEDORES CADASTRADOS ===');
        const [vendedores] = await connection.execute('SELECT * FROM VENDEDORES');
        
        if (vendedores.length === 0) {
            console.log('❌ Nenhum vendedor encontrado');
        } else {
            console.log(`✅ ${vendedores.length} vendedor(es) encontrado(s):\n`);
            
            vendedores.forEach((vendedor, index) => {
                console.log(`${index + 1}. ID Vendedor: ${vendedor.ID_VENDEDOR}`);
                console.log(`   ID Usuário: ${vendedor.ID_USUARIO}`);
                console.log(`   Tipo Pessoa: ${vendedor.TIPO_PESSOA}`);
                console.log(`   Documento: ${vendedor.DIGITO_PESSOA}`);
                console.log(`   Nome Loja: ${vendedor.NOME_LOJA || 'Não informado'}`);
                console.log('   ---');
            });
        }
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ ERRO:', error.message);
    }
}

checkUsers();