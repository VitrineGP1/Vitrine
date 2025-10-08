require('dotenv').config();

const express = require("express");
const app = express();
const path = require('path');

const port = process.env.PORT || 3306;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos e configuração do EJS
app.use(express.static(path.join(__dirname, 'app', 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'app', 'views'));

// Importa o pool de conexões
const pool = require("./config/pool_conexoes");

// Importa e configura as rotas de AUTENTICAÇÃO
const authRoutes = require("./app/routes/authRoutes")(pool);
app.use("/api", authRoutes); // Rotas de login/cadastro

// Importa e configura as rotas de PERFIL
const profileRoutes = require("./app/controllers/profileRoutes")(pool); // Seu novo arquivo
app.use("/api", profileRoutes); // Mesmo prefixo /api

// Importa rotas principais (para as views EJS)
var rotas = require("./app/routes/router");
app.use("/", rotas);

app.listen(port, () => {
    console.log(`Servidor Node.js ouvindo na porta ${port}\nhttp://localhost:${port}`);
});