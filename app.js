const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware'); 
const app = express();
const port = process.env.PORT || 3030;


app.use('*.php', createProxyMiddleware({
  target: 'http://localhost:9000', 
  changeOrigin: true, 
  ws: true, 
  logLevel: 'debug', 
  onProxyReq: (proxyReq, req, res) => {
    
    proxyReq.setHeader('X-Original-URL', req.originalUrl);
  },
  onError: (err, req, res) => {
    console.error('Erro no proxy para PHP:', err);
    res.status(500).send('Erro interno do servidor ao processar requisição PHP.');
  }
}));


app.use('/api', createProxyMiddleware({
  target: 'http://localhost:9000', 
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-Original-URL', req.originalUrl);
  },
  onError: (err, req, res) => {
    console.error('Erro no proxy para API PHP:', err);
    res.status(500).send('Erro interno do servidor ao processar requisição da API PHP.');
  }
}));


app.use(express.static("app/public"));


app.set("view engine", "ejs");
app.set("views", "./app/views");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


var rotas = require("./app/routes/router");
app.use("/", rotas);



app.listen(port, () => {
    console.log(`Servidor Node.js ouvindo na porta ${port}\nhttp://localhost:${port}`);
    console.log('Verifique se o PHP-CGI está rodando na porta 9000 para que o proxy funcione.');
});