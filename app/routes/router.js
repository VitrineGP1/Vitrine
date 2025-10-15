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
    "/produto": "produto-dinamico",

};

// Criar rotas automaticamente
Object.entries(routes).forEach(([path, page]) => {
    router.get(path, async (req, res) => {
        try {
            if (page === 'home') {
                // Carregar produtos para a home
                try {
                    const pool = require('../../config/pool-conexoes');
                    const [rows] = await pool.execute(`
                        SELECT p.*, u.NOME_USUARIO as NOME_VENDEDOR
                        FROM PRODUTOS p
                        LEFT JOIN USUARIOS u ON p.ID_VENDEDOR = u.ID_USUARIO
                        ORDER BY p.ID_PROD DESC
                        LIMIT 20
                    `);
                    console.log('Produtos encontrados:', rows.length);
                    res.render(`pages/${page}`, { produtos: rows });
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

// Rota específica para produto dinâmico
router.get('/produto/:id', async (req, res) => {
    try {
        const pool = require('../../config/pool-conexoes');
        const produtoId = req.params.id;
        
        // Buscar produto com dados do vendedor
        const [produtos] = await pool.execute(`
            SELECT p.*, u.NOME_USUARIO, u.EMAIL_USUARIO, u.CELULAR_USUARIO, v.NOME_LOJA
            FROM PRODUTOS p
            LEFT JOIN USUARIOS u ON p.ID_VENDEDOR = u.ID_USUARIO
            LEFT JOIN VENDEDORES v ON p.ID_VENDEDOR = v.ID_USUARIO
            WHERE p.ID_PROD = ?
        `, [produtoId]);
        
        if (produtos.length === 0) {
            return res.status(404).send('Produto não encontrado');
        }
        
        // Buscar outros produtos
        const [outrosProdutos] = await pool.execute(`
            SELECT p.*, v.NOME_LOJA
            FROM PRODUTOS p
            LEFT JOIN VENDEDORES v ON p.ID_VENDEDOR = v.ID_USUARIO
            WHERE p.ID_PROD != ?
            ORDER BY RAND()
            LIMIT 5
        `, [produtoId]);
        
        res.render('pages/produto-dinamico', {
            produto: produtos[0],
            outrosProdutos: outrosProdutos
        });
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota unificada de perfil
router.get('/perfil', async (req, res) => {
    try {
        // Por enquanto renderizar sem dados, pois o usuário é carregado via JavaScript
        res.render('pages/perfil', { user: null });
    } catch (error) {
        console.error('Erro ao renderizar perfil:', error);
        res.render('pages/perfil', { user: null });
    }
});
router.get('/cadastro', (req, res) => res.render('pages/cadcliente'));





module.exports = router;