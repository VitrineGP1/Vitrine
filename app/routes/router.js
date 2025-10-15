var express = require("express");
var router = express.Router();

// Usar o pool centralizado
const pool = require('../../config/pool-conexoes');
const fetch = require('node-fetch');


router.get("/", async function (req, res) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [produtos] = await connection.execute(
            'SELECT p.ID_PROD, p.NOME_PROD, p.DESCRICAO_PROD, p.VALOR_UNITARIO, p.IMAGEM_URL, p.IMAGEM_BASE64, p.ID_VENDEDOR, v.NOME_LOJA as NOME_VENDEDOR FROM PRODUTOS p LEFT JOIN VENDEDORES v ON p.ID_VENDEDOR = v.ID_VENDEDOR'
        );
        console.log('Produtos encontrados:', produtos.length);
        res.render("pages/home-dynamic", { produtos });
    } catch (error) {
        console.error('Erro ao buscar produtos na home:', error);
        console.error('Detalhes do erro:', error.message);
        // Renderiza a home estática em caso de erro de conexão
        res.render("pages/home", {});
    } finally {
        if (connection) connection.release();
    }
});

router.get("/home-perfil", function (req, res) {
    res.render("pages/home-perfil", )
});

router.get("/home-perfil-carrinho", function (req, res) {
    res.render("pages/home-perfil-carrinho", )
});

router.get("/home-carrinho", function (req, res) {
    res.render("pages/home-carrinho", )
});

router.get("/carrinho", function (req, res) {
    res.render("pages/carrinho", )
});

router.get("/checkout", function (req, res) {
    res.render("pages/checkout", )
});

// Rota para criar preferência do Mercado Pago
router.post("/create-preference", async function (req, res) {
    try {
        const { items } = req.body;
        
        const preference = {
            items: items,
            back_urls: {
                success: `${req.protocol}://${req.get('host')}/payment/success`,
                failure: `${req.protocol}://${req.get('host')}/payment/failure`,
                pending: `${req.protocol}://${req.get('host')}/payment/pending`
            },
            auto_return: "approved"
        };
        
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer APP_USR-6476532723991254-101421-04db4f53bda4904c9c087f81982c17e1-2908927997`
            },
            body: JSON.stringify(preference)
        });
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.get("/carrinho-vazio", function (req, res) {
    res.render("pages/carrinho-vazio", )
});

router.get("/login", function (req, res) {
    res.render("pages/login", )
});

router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro", )
});

router.get("/perfil", function (req, res) {
    res.render("pages/perfil", )
});

router.get("/sobrenos", function (req, res) {
    res.render("pages/sobrenos", )
});

router.get("/prod1", function (req, res) {
    res.render("pages/produto1", )
});

router.get("/prod2", function (req, res) {
    res.render("pages/produto2", )
});

router.get("/prod3", function (req, res) {
    res.render("pages/produto3", )
});

router.get("/prod4", function (req, res) {
    res.render("pages/produto4", )
});

router.get("/vendedor", function (req, res) {
    res.render("pages/vendedor", )
});

router.get("/prod", async function (req, res) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [produtos] = await connection.execute(
            'SELECT p.ID_PROD, p.NOME_PROD, p.DESCRICAO_PROD, p.VALOR_UNITARIO, p.IMAGEM_URL, p.IMAGEM_BASE64, p.ID_VENDEDOR, v.NOME_LOJA as NOME_VENDEDOR FROM PRODUTOS p LEFT JOIN VENDEDORES v ON p.ID_VENDEDOR = v.ID_VENDEDOR'
        );
        res.render("pages/produtos", { produtos });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.render("pages/produtos", { produtos: [] });
    } finally {
        if (connection) connection.release();
    }
});

router.get("/rdsenha", function (req, res) {
    res.render("pages/rdsenha", )
});

router.get("/dashboard-vendedor", function (req, res) {
    res.render("pages/dashboard-vendedor", )
});

router.get("/criar-produto", function (req, res) {
    res.render("pages/criar-produto", )
});

router.get("/admin-dashboard", function (req, res) {
    res.render("pages/admin-dashboard", )
});

router.get("/admin-usuarios", function (req, res) {
    res.render("pages/admin-usuarios", )
});

router.get("/admin-usuario-detalhes", function (req, res) {
    res.render("pages/admin-usuario-detalhes", )
});

router.get("/produto/:id", async function (req, res) {
    const productId = req.params.id;
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Buscar produto específico
        const [produto] = await connection.execute(
            'SELECT p.*, v.NOME_LOJA as NOME_VENDEDOR FROM PRODUTOS p LEFT JOIN VENDEDORES v ON p.ID_VENDEDOR = v.ID_VENDEDOR WHERE p.ID_PROD = ?',
            [productId]
        );
        
        if (produto.length === 0) {
            return res.status(404).render('pages/404');
        }
        
        // Buscar outros produtos para "Você também pode gostar"
        const [outrosProdutos] = await connection.execute(
            'SELECT p.*, v.NOME_LOJA as NOME_VENDEDOR FROM PRODUTOS p LEFT JOIN VENDEDORES v ON p.ID_VENDEDOR = v.ID_VENDEDOR WHERE p.ID_PROD != ? LIMIT 5',
            [productId]
        );
        
        // Buscar outros produtos da mesma loja
        const [produtosDaLoja] = await connection.execute(
            'SELECT p.ID_PROD, p.NOME_PROD, p.VALOR_UNITARIO, p.IMAGEM_URL, p.IMAGEM_BASE64 FROM PRODUTOS p WHERE p.ID_VENDEDOR = ? AND p.ID_PROD != ? LIMIT 4',
            [produto[0].ID_VENDEDOR, productId]
        );
        
        res.render("pages/produto-dinamico", { 
            produto: produto[0], 
            outrosProdutos,
            produtosDaLoja
        });
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).render('pages/erro');
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
