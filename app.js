const express = require("express");
const app = express();
const port = process.env.PORT || 3030;
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Middlewares padrão do Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Mude para a URL do seu frontend em produção
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// --- Configuração do Banco de Dados MySQL (Clever Cloud) ---
const dbConfig = {
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_BDD,
    port: process.env.MYSQL_ADDON_PORT || 3306
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Pool de conexões MySQL criado com sucesso.');
    pool.getConnection()
        .then(connection => {
            console.log('Conectado ao banco de dados MySQL via Node.js!');
            connection.release();
        })
        .catch(err => {
            console.error('ERRO: Não foi possível conectar ao banco de dados MySQL:', err.message);
        });
} catch (err) {
    console.error('ERRO: Falha ao criar o pool de conexões MySQL:', err.message);
    process.exit(1);
}

// --- Servir Arquivos Estáticos e Views ---
app.use(express.static("app/public"));
app.set("view engine", "ejs");
app.set("views", "./app/views");

// Suas rotas para páginas HTML/EJS (router.js)
var rotas = require("./app/routes/router");
app.use("/", rotas);

// --- IMPORTAR E USAR AS NOVAS ROTAS DE API ---
// Note que passamos o 'pool' de conexão para os módulos de rota
const authRoutes = require('./app/routes/api/authRoutes')(pool); // Passa o pool de conexões
const userRoutes = require('./app/routes/api/userRoutes')(pool); // Passa o pool de conexões

// Prefixo '/api' para todas as rotas dentro desses módulos
app.use('/api', authRoutes); // Ex: /api/cadastrar_usuario, /api/login_usuario
app.use('/api', userRoutes); // Ex: /api/buscar_usuario, /api/atualizar_usuario

// --- Início do Servidor Node.js ---
app.listen(port, () => {
    console.log(`Servidor Node.js ouvindo na porta ${port}\nhttp://localhost:${port}`);
});