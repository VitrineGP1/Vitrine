const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/AuthController');

module.exports = (pool) => {
    const authController = new AuthController(pool);

    router.post('/cadastrar_usuario', (req, res) => {
        authController.register(req, res);
    });

    router.post('/login_usuario', (req, res) => {
        authController.login(req, res);
    });

    router.get('/user/:id', (req, res) => {
        authController.getUserById(req, res);
    });
    
    router.post('/reset_password', (req, res) => {
        authController.resetPassword(req, res);
    });

    router.put('/atualizar_usuario', (req, res) => {
        authController.updateUser(req, res);
    });



    return router;
};