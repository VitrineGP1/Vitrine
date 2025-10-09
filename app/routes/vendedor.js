const express = require('express');
const router = express.Router();
const { requireVendedor } = require('../middleware/auth');

// Apenas Vendedor (TIPO_USUARIO = 'V')
router.get('/perfil', requireVendedor, async (req, res) => {
    try {
        const pool = require('../config/database');
        
        // Buscar dados específicos do vendedor
        const [vendedor] = await pool.execute(
            `SELECT v.*, u.* 
             FROM VENDEDORES v 
             JOIN USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO 
             WHERE u.ID_USUARIO = ?`,
            [req.user.ID_USUARIO]
        );

        res.json({
            success: true,
            message: 'Perfil do Vendedor',
            user: req.user,
            dadosVendedor: vendedor[0] || {}
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar perfil' });
    }
});

// Produtos do vendedor
router.get('/meus-produtos', requireVendedor, async (req, res) => {
    try {
        const pool = require('../config/database');
        const [produtos] = await pool.execute(
            `SELECT p.*, c.NOME_CATEGORIA 
             FROM PRODUTOS p 
             LEFT JOIN CATEGORIAS c ON p.ID_CATEGORIA = c.ID_CATEGORIA 
             WHERE p.ID_VENDEDOR = ? 
             ORDER BY p.DATA_CADASTRO DESC`,
            [req.user.ID_USUARIO]
        );

        res.json({
            success: true,
            produtos: produtos
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

module.exports = router;