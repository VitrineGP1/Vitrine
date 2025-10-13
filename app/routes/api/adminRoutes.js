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