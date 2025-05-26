const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear o corpo das requisições (sejam JSON ou URL-encoded)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar e usar suas rotas (se você tiver um router.js separado)
const apiRoutes = require('./router'); // Assumindo que router.js está na mesma pasta que app.js
app.use('/api', apiRoutes); // Prefixo para suas rotas de API no Node.js

// Rota para a página inicial (se tiver uma)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor Node.js rodando em http://localhost:${port}`);
    console.log(`Acesse seu formulário de login/cadastro em http://localhost:${port}/index.html`);
});

/*const express = require("express");
const app = express();
const port = process.env.PORT || 3030;

app.use(express.static("app/public"));

app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

var rotas = require("./app/routes/router");
app.use("/", rotas);


app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}\nhttp://localhost:${port}`);
});*/
