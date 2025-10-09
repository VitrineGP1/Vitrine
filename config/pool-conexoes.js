// config/pool-conexoes.js
const mysql = require('mysql2');

console.log('🔧 Iniciando conexão com Railway...');
console.log('📊 DB_HOST:', process.env.DB_HOST);
console.log('📊 DB_NAME:', process.env.DB_NAME);
console.log('📊 DB_PORT:', process.env.DB_PORT);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000,
    acquireTimeout: 30000,
    timeout: 30000,
    ssl: { rejectUnauthorized: false }, // OBRIGATÓRIO para Railway
    charset: 'utf8mb4'
});

// Teste de conexão com mais detalhes
pool.getConnection((err, connection) => {
    if (err) {
        console.log('❌ ERRO de conexão com Railway:');
        console.log('   Código:', err.code);
        console.log('   Mensagem:', err.message);
        console.log('   Host:', process.env.DB_HOST);
        console.log('   Porta:', process.env.DB_PORT);
        
        if (err.code === 'ETIMEDOUT') {
            console.log('💡 Dicas:');
            console.log('   1. Verifique se o host do Railway está correto');
            console.log('   2. Confirme a senha no Railway → Variables');
            console.log('   3. Verifique se o banco está "Deployed"');
        }
    } else {
        console.log('✅ CONEXÃO BEM-SUCEDIDA com Railway MySQL!');
        console.log('   Database:', process.env.DB_NAME);
        
        // Testa uma query simples
        connection.execute('SELECT 1 as test')
            .then(() => console.log('   ✅ Query test funcionou'))
            .catch(e => console.log('   ❌ Query test falhou:', e.message))
            .finally(() => connection.release());
    }
});

module.exports = pool.promise();