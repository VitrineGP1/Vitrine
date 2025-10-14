const express = require("express");
const router = express.Router();

// Mapeamento de rotas para páginas (apenas arquivos que existem)
const routes = {
    "/": "home",
    "/carrinho": "carrinho",
    "/login": "login",
    "/cadcliente": "cadcliente",
    "/cadvendedor": "cadvendedor",
    "/perfil-cliente": "perfil-cliente",
    "/perfil-vendedor": "perfil-vendedor",
    "/perfil-admin": "perfil-admin",
    "/sobrenos": "sobrenos",
    "/prod1": "produto1",
    "/prod2": "produto2",
    "/prod3": "produto3",
    "/prod4": "produto4",
    "/vendedor": "vendedor",
    "/produtos": "produtos",
    "/rdsenha": "rdsenha",
    "/admin-usuarios": "admin-usuarios",
    "/admin-usuario-detalhes": "admin-usuarios-detalhes",
    "/admin-vendedores": "admin-vendedores",
    "/admin-produto-detalhes": "admin-produtos-detalhes",
    "/admin-produtos": "admin-produtos",
    // Dashboards por tipo de usuário
    "/cliente/dashboard": "perfil-cliente",
    "/vendedor/dashboard": "perfil-vendedor",
    "/admin/dashboard": "perfil-admin",
    // Compatibilidade com rotas antigas
    "/V": "perfil-vendedor",
    "/A": "perfil-admin",
    "/C": "perfil-cliente",
};

// Criar rotas automaticamente
Object.entries(routes).forEach(([path, page]) => {
    router.get(path, (req, res) => {
        try {
            if (page === 'home') {
                res.render(`pages/${page}`, { produtos: [] });
            } else {
                res.render(`pages/${page}`);
            }
        } catch (error) {
            console.error(`Erro ao renderizar ${page}:`, error);
            res.status(404).send('Página não encontrada');
        }
    });
});

// Rotas adicionais que podem não ter arquivos de view
router.get('/perfil', (req, res) => res.render('pages/perfil-cliente'));
router.get('/cadastro', (req, res) => res.render('pages/cadcliente'));
router.get('/dashboard-vendedor', (req, res) => res.render('pages/perfil-vendedor'));
router.get('/admin-dashboard', (req, res) => res.render('pages/perfil-admin'));
router.get('/criar-produto', (req, res) => res.render('pages/perfil-vendedor'));
router.get('/meus-pedidos', (req, res) => res.render('pages/perfil-cliente'));



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