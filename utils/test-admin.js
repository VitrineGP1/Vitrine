require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('=== VERIFICANDO USUÁRIO ADMIN ===');
        
        // Verificar se existe admin
        const [adminRows] = await connection.execute(
            'SELECT * FROM USUARIOS WHERE TIPO_USUARIO = ? OR TIPO_USUARIO = ?',
            ['admin', 'A']
        );
        
        if (adminRows.length > 0) {
            console.log('✅ Admin encontrado:');
            adminRows.forEach(admin => {
                console.log(`ID: ${admin.ID_USUARIO}`);
                console.log(`Nome: ${admin.NOME_USUARIO}`);
                console.log(`Email: ${admin.EMAIL_USUARIO}`);
                console.log(`Tipo: ${admin.TIPO_USUARIO}`);
                console.log('---');
            });
        } else {
            console.log('❌ Nenhum admin encontrado');
        }
        
        // Verificar todos os usuários
        const [allUsers] = await connection.execute('SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, TIPO_USUARIO FROM USUARIOS');
        console.log('\n=== TODOS OS USUÁRIOS ===');
        allUsers.forEach(user => {
            console.log(`ID: ${user.ID_USUARIO} | Nome: ${user.NOME_USUARIO} | Email: ${user.EMAIL_USUARIO} | Tipo: ${user.TIPO_USUARIO}`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ ERRO:', error.message);
    }
}

testAdmin();