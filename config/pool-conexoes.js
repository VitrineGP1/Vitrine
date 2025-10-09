// config/pool-conexoes.js
const mysql = require('mysql2');

console.log(' Iniciando conexão com Railway...');
console.log(' DB_HOST:', process.env.DB_HOST);
console.log(' DB_NAME:', process.env.DB_NAME);
console.log(' DB_PORT:', process.env.DB_PORT);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
    ssl: { rejectUnauthorized: false },
    charset: 'utf8mb4'
});

pool.getConnection((err, connection) => {
    if (err) {
        console.log(' ERRO de conexão:');
        console.log('   Código:', err.code);
        console.log('   Mensagem:', err.message);
        console.log('   Host:', process.env.DB_HOST);
        
    } else {
        console.log('  CONEXÃO BEM-SUCEDIDA com Railway MySQL!');
        console.log('   Database:', process.env.DB_NAME);
        
        // Testa uma query para confirmar
        connection.execute('SELECT 1 as test')
            .then(([rows]) => {
                console.log('    Query test funcionou:', rows);
            })
            .catch(e => console.log('    Query test falhou:', e.message))
            .finally(() => {
                connection.release();
                console.log('   Conexão liberada');
            });
    }
});

// Event handlers para monitoramento
pool.on('acquire', (connection) => {
    console.log(' Conexão adquirida do pool');
});

pool.on('release', (connection) => {
    console.log(' Conexão liberada para o pool');
});

pool.on('enqueue', () => {
    console.log(' Aguardando conexão disponível...');
});

module.exports = pool.promise();