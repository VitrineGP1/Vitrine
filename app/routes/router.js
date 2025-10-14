const express = require("express");
const router = express.Router();

// Mapeamento de rotas para páginas (apenas arquivos que existem)
const routes = {
    "/": "home",
    "/carrinho": "carrinho",
    "/login": "login",
    "/cadcliente": "cadcliente",
    "/cadvendedor": "cadvendedor",

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

};

// Criar rotas automaticamente
Object.entries(routes).forEach(([path, page]) => {
    router.get(path, async (req, res) => {
        try {
            if (page === 'home') {
                // Carregar produtos para a home
                const pool = require('../config/pool-conexoes');
                try {
                    const result = await pool.request().query(`
                        SELECT p.*, u.NOME_USUARIO as NOME_VENDEDOR 
                        FROM PRODUTO p 
                        LEFT JOIN USUARIO u ON p.ID_VENDEDOR = u.ID_USUARIO 
                        WHERE p.ATIVO = 1
                        ORDER BY p.ID_PROD DESC
                    `);
                    res.render(`pages/${page}`, { produtos: result.recordset });
                } catch (dbError) {
                    console.error('Erro ao carregar produtos:', dbError);
                    res.render(`pages/${page}`, { produtos: [] });
                }
            } else {
                res.render(`pages/${page}`);
            }
        } catch (error) {
            console.error(`Erro ao renderizar ${page}:`, error);
            res.status(404).send('Página não encontrada');
        }
    });
});

// Rota unificada de perfil
router.get('/perfil', (req, res) => res.render('pages/perfil'));
router.get('/cadastro', (req, res) => res.render('pages/cadcliente'));



// SDK do Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { pedidoController } = require("../controllers/pedidoController");
const pool = require('../config/pool-conexoes');

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