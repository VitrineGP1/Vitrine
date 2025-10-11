const express = require('express');

module.exports = (pool) => {
    const router = express.Router();

    const requireAuth = (requiredTypes = []) => {
        return async (req, res, next) => {
            try {
                if (!req.session.userId) {
                    return res.status(401).json({ 
                        success: false,
                        error: 'Não autorizado. Faça login.' 
                    });
                }

                if (requiredTypes.length > 0 && !requiredTypes.includes(req.session.userType)) {
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

    // Função genérica para perfis
    const getProfile = (userType, tableName, message) => {
        return async (req, res) => {
            try {
                const [result] = await pool.execute(
                    `SELECT t.*, u.* FROM ${tableName} t 
                     JOIN USUARIOS u ON t.ID_USUARIO = u.ID_USUARIO 
                     WHERE u.ID_USUARIO = ?`,
                    [req.session.userId]
                );

                res.json({
                    success: true,
                    message,
                    user: {
                        id: req.session.userId,
                        nome: req.session.userName,
                        tipo: req.session.userType
                    },
                    [`dados${userType}`]: result[0] || {}
                });
            } catch (error) {
                res.status(500).json({ 
                    success: false,
                    error: 'Erro ao carregar perfil' 
                });
            }
        };
    };

    // Rotas de perfil usando função genérica
    router.get('/cliente/perfil', requireAuth(['C']), getProfile('Cliente', 'CLIENTES', 'Perfil do Cliente'));
    router.get('/vendedor/perfil', requireAuth(['V']), getProfile('Vendedor', 'VENDEDORES', 'Perfil do Vendedor'));
    router.get('/admin/perfil', requireAuth(['A']), getProfile('Admin', 'ADMINISTRADORES', 'Perfil do Administrador'));

    return router;
};