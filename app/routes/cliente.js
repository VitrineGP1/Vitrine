const express = require('express');
const router = express.Router();
const { requireCliente } = require('../middleware/auth');

// Apenas Cliente (TIPO_USUARIO = 'C')
router.get('/perfil', requireCliente, async (req, res) => {
    try {
        const pool = require('../config/database');
        
        // Buscar dados específicos do cliente
        const [cliente] = await pool.execute(
            `SELECT c.*, u.* 
             FROM CLIENTES c 
             JOIN USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO 
             WHERE u.ID_USUARIO = ?`,
            [req.user.ID_USUARIO]
        );

        res.json({
            success: true,
            message: 'Perfil do Cliente',
            user: req.user,
            dadosCliente: cliente[0] || {}
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar perfil' });
    }
});

// Pedidos do cliente
router.get('/meus-pedidos', requireCliente, async (req, res) => {
    try {
        const pool = require('../config/database');
        const [pedidos] = await pool.execute(
            `SELECT p.* 
             FROM PEDIDOS p 
             JOIN CLIENTES c ON p.ID_CLIENTE = c.ID_CLIENTE 
             WHERE c.ID_USUARIO = ? 
             ORDER BY p.DT_PEDIDO DESC`,
            [req.user.ID_USUARIO]
        );

        res.json({
            success: true,
            pedidos: pedidos
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
});

module.exports = router;