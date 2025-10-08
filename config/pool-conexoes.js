const mysql = require('mysql2');

// Use createPool em vez de createConnection para melhor performance
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Teste da conexão
pool.getConnection((err, connection) => {
    if (err) {
        console.log("Falha ao estabelecer a conexão!");
        console.log(err);
    } else {
        console.log("Conexão estabelecida com sucesso!");
        connection.release(); // Libera a conexão de volta para o pool
    }
});

// Exporta o pool com interface de promises
module.exports = pool.promise();