require('dotenv').config();

const express = require("express");
const session = require('express-session');
const app = express();
const path = require('path');

const port = process.env.PORT || 3000;

console.log(' Iniciando servidor...');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Mude para true em produção com HTTPS
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Arquivos estáticos e EJS
app.use(express.static(path.join(__dirname, 'app', 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'app', 'views'));

// Importa o pool
console.log(' Conectando ao banco...');
const pool = require("./config/pool-conexoes");

// Importa rotas
console.log(' Carregando rotas...');
const authRoutes = require("./app/routes/authRoutes")(pool);
const profileRoutes = require("./app/routes/profileRoutes")(pool);
const mainRoutes = require("./app/routes/router");

// Configura rotas
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/", mainRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando',
        session: req.session
    });
});

// Rota de teste do banco
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1 + 1 as result');
        res.json({ success: true, db: 'Conectado', result: rows[0].result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(` Servidor rodando na porta ${port}`);
    console.log(` http://localhost:${port}`);
    console.log(` NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});