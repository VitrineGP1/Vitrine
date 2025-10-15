const mysql = require('mysql2/promise');

console.log(' Iniciando conexão com Railway...');
console.log(' DB_HOST:', process.env.DB_HOST);
console.log(' DB_NAME:', process.env.DB_NAME);
console.log(' DB_PORT:', process.env.DB_PORT);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
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

module.exports = pool;

// Teste de conexão simples
async function testConnection() {
  try {
    console.log('🔗 Testando conexão com Railway...');
    const [rows] = await pool.execute('SELECT 1 + 1 AS result');
    console.log('✅ CONEXÃO BEM-SUCEDIDA com Railway MySQL!');
    console.log('📊 Database:', process.env.DB_NAME);
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    return false;
  }
}

// Testar conexão (não-bloqueante)
testConnection().catch(console.error);