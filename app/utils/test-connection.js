require('dotenv').config();

console.log('=== TESTE DE CONEXÃO RAILWAY ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***definida***' : 'UNDEFINED');

const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        console.log('\n🔗 Tentando conectar...');
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('✅ CONEXÃO SUCESSO!');
        
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('✅ QUERY TESTE:', rows[0].result);
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📊 TABELAS EXISTENTES:', tables.length);
        tables.forEach(table => console.log('  -', Object.values(table)[0]));
        
        await connection.end();
        console.log('✅ TESTE COMPLETO!');
        
    } catch (error) {
        console.error('❌ ERRO:', error.message);
        console.error('Stack:', error.stack);
    }
}

testConnection();