const express = require('express');
const router = express.Router(); // Cria um novo objeto router para gerenciar as rotas
const bcrypt = require('bcryptjs'); // Para hash de senhas

// Esta função receberá o pool de conexões do banco de dados de app.js
module.exports = (pool) => {

    // Rota de CADASTRO de Usuário
    router.post('/cadastrar_usuario', async (req, res) => {
        const {
            NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
            LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
            CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
        } = req.body;

        if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({ success: false, message: "Nome, email e senha são obrigatórios." });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
            return res.status(400).json({ success: false, message: "Formato de email inválido." });
        }

        try {
            const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 10);
            const connection = await pool.getConnection();

            const [rows] = await connection.execute(
                `INSERT INTO USUARIOS (
                    NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
                    LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                    CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    NOME_USUARIO, EMAIL_USUARIO, hashedPassword, CELULAR_USUARIO,
                    LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                    CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
                ]
            );
            connection.release();

            if (rows.affectedRows > 0) {
                res.status(201).json({ success: true, message: "Usuário cadastrado com sucesso!" });
            } else {
                res.status(500).json({ success: false, message: "Falha ao cadastrar o usuário." });
            }

        } catch (error) {
            console.error('Erro no cadastro de usuário (Node.js API):', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: "Este email já está cadastrado." });
            }
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota de LOGIN de Usuário
    router.post('/login_usuario', async (req, res) => {
        const { EMAIL_USUARIO, SENHA_USUARIO } = req.body;

        if (!EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({ success: false, message: "Email e senha são obrigatórios." });
        }

        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO
                 FROM USUARIOS WHERE EMAIL_USUARIO = ?`,
                [EMAIL_USUARIO]
            );
            connection.release();

            if (rows.length === 0) {
                return res.status(401).json({ success: false, message: "Credenciais inválidas." });
            }

            const user = rows[0];
            const passwordMatch = await bcrypt.compare(SENHA_USUARIO, user.SENHA_USUARIO);

            if (passwordMatch) {
                res.status(200).json({
                    success: true,
                    message: "Login bem-sucedido!",
                    user: {
                        id: user.ID_USUARIO,
                        name: user.NOME_USUARIO,
                        email: user.EMAIL_USUARIO,
                        type: user.TIPO_USUARIO
                    }
                });
            } else {
                res.status(401).json({ success: false, message: "Credenciais inválidas." });
            }

        } catch (error) {
            console.error('Erro no login de usuário (Node.js API):', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    return router; // Retorna o objeto router configurado
};