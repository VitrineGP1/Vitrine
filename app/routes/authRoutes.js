const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (pool) => {
    const router = express.Router();

    console.log('✅ authRoutes carregado');

    // Função utilitária para buscar usuário
    const getUserQuery = `SELECT 
        ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO,
        TIPO_USUARIO, IMAGEM_PERFIL_BASE64
    FROM USUARIOS WHERE`;

    const userTypes = { 'A': 'admin', 'V': 'vendedor', 'C': 'cliente' };

    const formatUserResponse = (user) => ({
        id: user.ID_USUARIO,
        nome: user.NOME_USUARIO,
        email: user.EMAIL_USUARIO,
        tipo: user.TIPO_USUARIO,
        tipoLegivel: userTypes[user.TIPO_USUARIO],
        imagemPerfil: user.IMAGEM_PERFIL_BASE64
    });

    // Login
    router.post('/login', async (req, res) => {
        console.log('📥 Recebendo requisição de login:', req.body.email);
        
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                console.log('❌ Campos faltando');
                return res.status(400).json({ 
                    success: false,
                    error: 'Email e senha são obrigatórios' 
                });
            }

            console.log('🔍 Buscando usuário no banco...');
            
            const [users] = await pool.execute(
                `${getUserQuery} EMAIL_USUARIO = ?`,
                [email]
            );

            console.log(`📊 Usuários encontrados: ${users.length}`);

            if (users.length === 0) {
                console.log('❌ Usuário não encontrado');
                return res.status(401).json({ 
                    success: false,
                    error: 'Email ou senha incorretos' 
                });
            }

            const user = users[0];
            console.log('👤 Usuário encontrado:', user.EMAIL_USUARIO);

            // Verificar senha
            console.log('🔐 Verificando senha...');
            const isPasswordValid = await bcrypt.compare(password, user.SENHA_USUARIO);
            
            if (!isPasswordValid) {
                console.log('❌ Senha incorreta');
                return res.status(401).json({ 
                    success: false,
                    error: 'Email ou senha incorretos' 
                });
            }

            console.log('✅ Login válido - criando sessão');

            // Criar sessão
            req.session.userId = user.ID_USUARIO;
            req.session.userType = user.TIPO_USUARIO;
            req.session.userName = user.NOME_USUARIO;

            console.log('🎉 Login bem-sucedido para:', user.EMAIL_USUARIO);

            res.json({
                success: true,
                message: 'Login realizado com sucesso!',
                user: formatUserResponse(user)
            });

        } catch (error) {
            console.error('💥 ERRO NO LOGIN:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erro interno do servidor: ' + error.message
            });
        }
    });

    // Logout
    router.post('/logout', (req, res) => {
        try {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Erro no logout:', err);
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
        } catch (error) {
            console.error('Erro no logout:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erro ao fazer logout' 
            });
        }
    });

    // Verificar sessão
    router.get('/me', async (req, res) => {
        try {
            console.log('🔍 Verificando sessão:', req.session);
            
            if (!req.session.userId) {
                return res.status(401).json({ 
                    success: false,
                    error: 'Não autenticado' 
                });
            }

            const [users] = await pool.execute(
                `${getUserQuery} ID_USUARIO = ?`,
                [req.session.userId]
            );

            if (users.length === 0) {
                req.session.destroy();
                return res.status(401).json({ 
                    success: false,
                    error: 'Usuário não encontrado' 
                });
            }

            res.json({
                success: true,
                user: formatUserResponse(users[0])
            });
        } catch (error) {
            console.error('Erro em /me:', error);
            res.status(500).json({ 
                success: false,
                error: 'Erro ao verificar sessão' 
            });
        }
    });

    return router;
};