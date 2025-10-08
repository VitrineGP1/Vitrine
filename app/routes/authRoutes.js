const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const UserModel = require('../models/userModel');

module.exports = (pool) => {
    const userModel = new UserModel(pool);
    const userController = new UserController(userModel);

    // Rotas de autenticação
    router.post('/cadastrar_usuario', (req, res) => userController.register(req, res));
    router.post('/login_usuario', (req, res) => userController.login(req, res));
    router.post('/recuperar_senha', (req, res) => userController.recoverPassword(req, res));

    return router;
};