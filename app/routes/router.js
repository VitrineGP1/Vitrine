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
    "/cadastro": "cadastro",
    "/perfil": "perfil",
    "/perfil-cliente": "perfil-cliente",
    "/perfil-vendedor": "perfil-vendedor",
    "/perfil-admin": "perfil-admin",
    "/sobrenos": "sobrenos",
    "/prod1": "produto1",
    "/prod2": "produto2",
    "/prod3": "produto3",
    "/prod4": "produto4",
    "/vendedor": "vendedor",
    "/prod": "produtos",
    "/rdsenha": "rdsenha",
    "/dashboard-vendedor": "dashboard-vendedor",
    "/criar-produto": "criar-produto",
    "/admin-dashboard": "admin-dashboard",
    "/admin-usuarios": "admin-usuarios",
    "/admin-usuario-detalhes": "admin-usuario-detalhes",
    "/admin-vendedores": "admin-vendedores",
    "/admin-produto-detalhes": "admin-produto-detalhes",
    "/admin-produtos": "admin-produtos",
    "/meus-pedidos": "meus-pedidos",
    // Dashboards por tipo de usuário
    "/cliente/dashboard": "perfil-cliente",
    "/vendedor/dashboard": "dashboard-vendedor",
    "/admin/dashboard": "admin-dashboard",
    // Compatibilidade com rotas antigas
    "/V": "perfil-vendedor",
    "/A": "perfil-admin",
    "/C": "perfil-cliente",
};

// Criar rotas automaticamente
Object.entries(routes).forEach(([path, page]) => {
    router.get(path, (req, res) => res.render(`pages/${page}`));
});

// Controlador de páginas
const pageController = require('../controllers/pageController');

// Rota especial para produtos com controller
router.get("/produtos", function (req, res) {
    pageController.produtos(req, res);
});

// SDK do Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { pedidoController } = require("../controllers/pedidoController");

// Verificar se accessToken existe
if (!process.env.accessToken) {
    console.warn('⚠️  ACCESS TOKEN do Mercado Pago não configurado!');
}

const client = new MercadoPagoConfig({
    accessToken: process.env.accessToken
});

router.post("/create-preference", async (req, res) => {
    console.log('=== CREATE PREFERENCE CHAMADO ===');
    console.log('Body recebido:', req.body);
    console.log('Access Token existe:', !!process.env.accessToken);
    
    try {
        // Validações básicas
        if (!req.body || !req.body.items) {
            console.log('Items não fornecidos');
            return res.status(400).json({ error: 'Items são obrigatórios' });
        }

        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            console.log('Items inválidos:', req.body.items);
            return res.status(400).json({ error: 'Items devem ser um array não vazio' });
        }

        if (!process.env.accessToken) {
            console.error('Access token não configurado');
            return res.status(500).json({ error: 'Token de pagamento não configurado' });
        }

        console.log('Criando preferência com items:', req.body.items);
        
        const preference = new Preference(client);
        const feedbackUrl = `${process.env.URL_BASE || 'https://vitrine-lljl.onrender.com'}/feedback`;
        
        const preferenceData = {
            items: req.body.items,
            back_urls: {
                success: feedbackUrl,
                failure: feedbackUrl,
                pending: feedbackUrl
            },
            auto_return: "approved"
        };
        
        console.log('Dados da preferência:', preferenceData);
        
        const result = await preference.create({ body: preferenceData });
        
        console.log('Preferência criada com sucesso:', result.id);
        res.json(result);
        
    } catch (error) {
        console.error('=== ERRO DETALHADO ===');
        console.error('Tipo:', error.constructor.name);
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Erro ao processar pagamento',
            message: error.message,
            type: error.constructor.name
        });
    }
});

router.get("/feedback", function (req, res) {
    pedidoController.gravarPedido(req, res);
});

module.exports = router;