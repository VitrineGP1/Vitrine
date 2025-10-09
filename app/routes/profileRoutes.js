// app/routes/profileRoutes.js
const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    // Middleware de autenticação
    const requireAuth = (requiredTypes = []) => {
        return async (req, res, next) => {
            try {
                if (!req.session.userId) {
                    return res.status(401).json({ 
                        success: false,
                        error: 'Não autorizado. Faça login.' 
                    });
                }

                const userType = req.session.userType;
                
                if (requiredTypes.length > 0 && !requiredTypes.includes(userType)) {
                    return res.status(403).json({ 
                        success: false,
                        error: 'Acesso não autorizado para seu tipo de conta.' 
                    });
                }

                next();
            } catch (error) {
                res.status(500).json({ 
                    success: false,
                    error: 'Erro de autenticação' 
                });
            }
        };
    };

    // Rota do cliente
    router.get('/cliente/perfil', requireAuth(['C']), async (req, res) => {
        try {
            const [cliente] = await pool.execute(
                `SELECT c.*, u.* 
                 FROM CLIENTES c 
                 JOIN USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO 
                 WHERE u.ID_USUARIO = ?`,
                [req.session.userId]
            );

            res.json({
                success: true,
                message: 'Perfil do Cliente',
                user: {
                    id: req.session.userId,
                    nome: req.session.userName,
                    tipo: req.session.userType
                },
                dadosCliente: cliente[0] || {}
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: 'Erro ao carregar perfil' 
            });
        }
    });

    // Rota do vendedor
    router.get('/vendedor/perfil', requireAuth(['V']), async (req, res) => {
        try {
            const [vendedor] = await pool.execute(
                `SELECT v.*, u.* 
                 FROM VENDEDORES v 
                 JOIN USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO 
                 WHERE u.ID_USUARIO = ?`,
                [req.session.userId]
            );

            res.json({
                success: true,
                message: 'Perfil do Vendedor',
                user: {
                    id: req.session.userId,
                    nome: req.session.userName,
                    tipo: req.session.userType
                },
                dadosVendedor: vendedor[0] || {}
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: 'Erro ao carregar perfil' 
            });
        }
    });

    // Rota do admin
    router.get('/admin/perfil', requireAuth(['A']), async (req, res) => {
        try {
            const [admin] = await pool.execute(
                `SELECT a.*, u.* 
                 FROM ADMINISTRADORES a 
                 JOIN USUARIOS u ON a.ID_USUARIO = u.ID_USUARIO 
                 WHERE u.ID_USUARIO = ?`,
                [req.session.userId]
            );

            res.json({
                success: true,
                message: 'Perfil do Administrador',
                user: {
                    id: req.session.userId,
                    nome: req.session.userName,
                    tipo: req.session.userType
                },
                dadosAdmin: admin[0] || {}
            });
        } catch (error) {
            res.status(500).json({ 
                success: false,
                error: 'Erro ao carregar perfil' 
            });
        }
    });

    return router;
};