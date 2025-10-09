// config/pool-conexoes.js - VERSÃO FINAL FUNCIONAL
const mysql = require('mysql2');

console.log(' Iniciando conexão com Railway...');
console.log(' DB_HOST:', process.env.DB_HOST);
console.log(' DB_NAME:', process.env.DB_NAME);
console.log(' DB_PORT:', process.env.DB_PORT);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  
  // Configurações válidas para MySQL2:
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Converta para Promise interface
const promisePool = pool.promise();

// Teste de conexão assíncrono
async function initializeDatabase() {
  try {
    console.log(' Conexão adquirida do pool');
    
    // ✅ FORMA CORRETA com Promise interface
    const [rows] = await promisePool.execute('SELECT 1 + 1 AS result');
    console.log('  CONEXÃO BEM-SUCEDIDA com Railway MySQL!');
    console.log('   Database:', process.env.DB_NAME);
    console.log('   Test query result:', rows[0].result);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error.message);
    return false;
  }
}

// Inicialize o banco
initializeDatabase();

// Exporte o pool com Promise interface
module.exports = promisePool;