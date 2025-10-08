const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const UserModel = require('../models/userModel');

module.exports = (pool) => {
    const userModel = new UserModel(pool);
    const userController = new UserController(userModel);

    // Rotas de perfil
    router.get('/buscar_usuario', (req, res) => userController.getProfile(req, res));
    router.put('/atualizar_usuario', (req, res) => userController.updateProfile(req, res));

    return router;
};