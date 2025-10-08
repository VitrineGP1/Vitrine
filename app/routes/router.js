require('dotenv').config();

const express = require("express");
const app = express();
const path = require('path');

const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos e EJS
app.use(express.static(path.join(__dirname, 'app', 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'app', 'views'));

// Importa o pool
const pool = require("./config/pool-conexoes");

// Importa rotas
const authRoutes = require("./app/routes/authRoutes")(pool);
const profileRoutes = require("./app/routes/profileRoutes")(pool);
const mainRoutes = require("./app/routes/router");

// Configura rotas
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/", mainRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando' });
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
    console.log(`📊 http://localhost:${port}`);
});