const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Inicializar modelo de usuário
let userModel;

// Middleware para inicializar o modelo
router.use((req, res, next) => {
    if (!userModel && req.app.locals.pool) {
        userModel = new User(req.app.locals.pool);
    }
    next();
});

// Listar todos os usuários
router.get('/users', async (req, res) => {
    try {
        const users = await userModel.getAll();
        res.json({ success: true, users });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Buscar detalhes de um usuário
router.get('/user-details/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findById(userId);
        
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Listar todos os produtos
router.get('/products', async (req, res) => {
    try {
        const connection = await req.app.locals.pool.getConnection();
        const [products] = await connection.execute(
            `SELECT p.*, u.NOME_USUARIO as VENDEDOR_NOME 
             FROM PRODUTOS p 
             LEFT JOIN USUARIOS u ON p.ID_VENDEDOR = u.ID_USUARIO 
             ORDER BY p.ID_PROD DESC`
        );
        connection.release();
        res.json({ success: true, products });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Buscar detalhes de um produto
router.get('/product-details/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const connection = await req.app.locals.pool.getConnection();
        
        const [products] = await connection.execute(
            `SELECT p.*, u.NOME_USUARIO, u.EMAIL_USUARIO, u.CIDADE_USUARIO 
             FROM PRODUTOS p 
             LEFT JOIN USUARIOS u ON p.ID_VENDEDOR = u.ID_USUARIO 
             WHERE p.ID_PROD = ?`,
            [productId]
        );
        
        connection.release();
        
        if (products.length > 0) {
            const product = products[0];
            const seller = {
                NOME_USUARIO: product.NOME_USUARIO,
                EMAIL_USUARIO: product.EMAIL_USUARIO,
                CIDADE_USUARIO: product.CIDADE_USUARIO
            };
            res.json({ success: true, product, seller });
        } else {
            res.status(404).json({ success: false, message: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Excluir produto
router.delete('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const connection = await req.app.locals.pool.getConnection();
        const [result] = await connection.execute('DELETE FROM PRODUTOS WHERE ID_PROD = ?', [productId]);
        connection.release();
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Produto excluído com sucesso' });
        } else {
            res.status(404).json({ success: false, message: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Buscar perfil de vendedor
router.get('/seller-profile', async (req, res) => {
    try {
        const sellerId = req.query.id_vendedor;
        const connection = await req.app.locals.pool.getConnection();

        const [sellers] = await connection.execute(
            `SELECT v.*, u.NOME_USUARIO, u.EMAIL_USUARIO
             FROM VENDEDORES v
             LEFT JOIN USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO
             WHERE v.ID_USUARIO = ?`,
            [sellerId]
        );

        connection.release();

        if (sellers.length > 0) {
            res.json({ success: true, seller: sellers[0] });
        } else {
            res.status(404).json({ success: false, message: 'Vendedor não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar vendedor:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Atualizar perfil de vendedor (incluindo imagem de perfil da loja)
router.put('/seller-profile', async (req, res) => {
    try {
        const { id_vendedor, IMAGEM_PERFIL_LOJA_BASE64 } = req.body;
        const connection = await req.app.locals.pool.getConnection();

        const [result] = await connection.execute(
            `UPDATE VENDEDORES SET IMAGEM_PERFIL_LOJA_BASE64 = ? WHERE ID_USUARIO = ?`,
            [IMAGEM_PERFIL_LOJA_BASE64, id_vendedor]
        );

        connection.release();

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Perfil do vendedor atualizado com sucesso' });
        } else {
            res.status(404).json({ success: false, message: 'Vendedor não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil do vendedor:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Buscar produtos por vendedor
router.get('/products-by-seller', async (req, res) => {
    try {
        const sellerId = req.query.seller_id;
        const connection = await req.app.locals.pool.getConnection();
        
        const [products] = await connection.execute(
            `SELECT * FROM PRODUTOS WHERE ID_VENDEDOR = ? ORDER BY ID_PROD DESC`,
            [sellerId]
        );
        
        connection.release();
        res.json({ success: true, products });
    } catch (error) {
        console.error('Erro ao buscar produtos do vendedor:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Excluir usuário
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const deleted = await userModel.delete(userId);
        
        if (deleted) {
            res.json({ success: true, message: 'Usuário excluído com sucesso' });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

module.exports = router;