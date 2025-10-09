// app/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (pool) => {
    const router = express.Router();

    // Login
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Email e senha são obrigatórios' 
                });
            }

            // Buscar usuário no banco
            const [users] = await pool.execute(
                `SELECT 
                    u.ID_USUARIO,
                    u.NOME_USUARIO,
                    u.EMAIL_USUARIO,
                    u.SENHA_USUARIO,
                    u.TIPO_USUARIO,
                    u.IMAGEM_PERFIL_BASE64,
                    CASE 
                        WHEN u.TIPO_USUARIO = 'C' THEN c.CPF_CLIENTE
                        WHEN u.TIPO_USUARIO = 'V' THEN v.DIGITO_PESSOA
                        WHEN u.TIPO_USUARIO = 'A' THEN a.CPF_ADM
                    END as DOCUMENTO
                 FROM USUARIOS u
                 LEFT JOIN CLIENTES c ON u.ID_USUARIO = c.ID_USUARIO
                 LEFT JOIN VENDEDORES v ON u.ID_USUARIO = v.ID_USUARIO
                 LEFT JOIN ADMINISTRADORES a ON u.ID_USUARIO = a.ID_USUARIO
                 WHERE u.EMAIL_USUARIO = ?`,
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ 
                    success: false,
                    error: 'Email ou senha incorretos' 
                });
            }

            const user = users[0];

            // Verificar senha
            const isPasswordValid = await bcrypt.compare(password, user.SENHA_USUARIO);
            if (!isPasswordValid) {
                return res.status(401).json({ 
                    success: false,
                    error: 'Email ou senha incorretos' 
                });
            }

            // Criar sessão
            req.session.userId = user.ID_USUARIO;
            req.session.userType = user.TIPO_USUARIO;
            req.session.userName = user.NOME_USUARIO;

            // Converter tipo para legível
            const userTypes = { 'A': 'admin', 'V': 'vendedor', 'C': 'cliente' };
            const userTypeLegivel = userTypes[user.TIPO_USUARIO];

            res.json({
                success: true,
                message: 'Login realizado com sucesso!',
                user: {
                    id: user.ID_USUARIO,
                    nome: user.NOME_USUARIO,
                    email: user.EMAIL_USUARIO,
                    tipo: user.TIPO_USUARIO,
                    tipoLegivel: userTypeLegivel,
                    imagemPerfil: user.IMAGEM_PERFIL_BASE64
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erro interno do servidor' 
            });
        }
    });

    // Logout
    router.post('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ 
                    success: false,
                    error: 'Erro ao fazer logout' 
                });
            }
            res.json({ 
                success: true, 
                message: 'Logout realizado' 
            });
        });
    });

    // Verificar sessão
    router.get('/me', async (req, res) => {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ 
                    success: false,
                    error: 'Não autenticado' 
                });
            }

            const [users] = await pool.execute(
                `SELECT 
                    u.ID_USUARIO,
                    u.NOME_USUARIO,
                    u.EMAIL_USUARIO,
                    u.TIPO_USUARIO,
                    u.IMAGEM_PERFIL_BASE64
                 FROM USUARIOS u
                 WHERE u.ID_USUARIO = ?`,
                [req.session.userId]
            );

            if (users.length === 0) {
                req.session.destroy();
                return res.status(401).json({ 
                    success: false,
                    error: 'Usuário não encontrado' 
                });
            }

            const user = users[0];
            const userTypes = { 'A': 'admin', 'V': 'vendedor', 'C': 'cliente' };
            const userTypeLegivel = userTypes[user.TIPO_USUARIO];

            res.json({
                success: true,
                user: {
                    id: user.ID_USUARIO,
                    nome: user.NOME_USUARIO,
                    email: user.EMAIL_USUARIO,
                    tipo: user.TIPO_USUARIO,
                    tipoLegivel: userTypeLegivel,
                    imagemPerfil: user.IMAGEM_PERFIL_BASE64
                }
            });
        } catch (error) {
            console.error('Me error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erro ao verificar sessão' 
            });
        }
    });

    return router;
};