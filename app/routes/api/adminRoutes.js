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