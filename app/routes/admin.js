const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

// Apenas Admin (TIPO_USUARIO = 'A')
router.get('/dashboard', requireAdmin, (req, res) => {
    res.json({
        success: true,
        message: 'Bem-vindo ao Painel Administrativo',
        user: req.user
    });
});

// Exemplo: Listar todos os usuários
router.get('/usuarios', requireAdmin, async (req, res) => {
    try {
        const pool = require('../config/database');
        const [users] = await pool.execute(
            `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, TIPO_USUARIO 
             FROM USUARIOS ORDER BY ID_USUARIO DESC`
        );
        
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

module.exports = router;