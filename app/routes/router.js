const express = require("express");
const router = express.Router();

// Mapeamento de rotas para páginas
const routes = {
    "/": "home",
    "/home-perfil": "home-perfil",
    "/home-perfil-carrinho": "home-perfil-carrinho",
    "/home-carrinho": "home-carrinho",
    "/carrinho": "carrinho",
    "/carrinho-vazio": "carrinho-vazio",
    "/login": "login",
    "/cadcliente": "cadcliente",
    "/cadvendedor": "cadvendedor",
    "/perfil": "perfil",
    "/sobrenos": "sobrenos",
    "/prod1": "produto1",
    "/prod2": "produto2",
    "/prod3": "produto3",
    "/prod4": "produto4",
    "/vendedor": "vendedor",
    "/prod": "produtos",
    "/rdsenha": "rdsenha"
};

// Criar rotas automaticamente
Object.entries(routes).forEach(([path, page]) => {
    router.get(path, (req, res) => res.render(`pages/${page}`));
});

// SDK do Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { pedidoController } = require("../controllers/pedidoController");
// Adicione as credenciais
const client = new MercadoPagoConfig({
    accessToken: process.env.accessToken
});

router.post("/create-preference", async (req, res) => {
    try {
        const preference = new Preference(client);
        const feedbackUrl = `${process.env.URL_BASE}/feedback`;
        
        const result = await preference.create({
            body: {
                items: req.body.items,
                back_urls: {
                    success: feedbackUrl,
                    failure: feedbackUrl,
                    pending: feedbackUrl
                },
                auto_return: "approved"
            }
        });
        
        res.json(result);
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
});

router.get("/feedback", function (req, res) {
    pedidoController.gravarPedido(req, res);
});

module.exports = router;