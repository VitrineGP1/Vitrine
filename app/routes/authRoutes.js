const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

module.exports = (pool) => {

    // Rota de CADASTRO de Usuário
    router.post('/cadastrar_usuario', async (req, res) => {
        const {
            NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
            LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
            CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
        } = req.body;

        // Validações básicas
        if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({ success: false, message: "Nome, email e senha são obrigatórios." });
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
            return res.status(400).json({ success: false, message: "Formato de email inválido." });
        }

        // Validação de senha forte no backend
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(SENHA_USUARIO)) {
            return res.status(400).json({ 
                success: false, 
                message: "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais." 
            });
        }

        try {
            const connection = await pool.getConnection();
            
            // Verifica se email já existe
            const [existingUsers] = await connection.execute(
                'SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?',
                [EMAIL_USUARIO]
            );
            
            if (existingUsers.length > 0) {
                connection.release();
                return res.status(409).json({ success: false, message: "Este email já está cadastrado." });
            }

            // Criptografa senha com salt maior para mais segurança
            const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 12);
            
            // Insere usuário
            const [result] = await connection.execute(
                `INSERT INTO USUARIOS (
                    NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
                    LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                    CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO, DATA_CADASTRO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    NOME_USUARIO, EMAIL_USUARIO, hashedPassword, CELULAR_USUARIO || null,
                    LOGRADOURO_USUARIO || null, BAIRRO_USUARIO || null, CIDADE_USUARIO || null, 
                    UF_USUARIO || null, CEP_USUARIO || null, DT_NASC_USUARIO || null, 
                    TIPO_USUARIO || 'cliente'
                ]
            );
            
            connection.release();

            if (result.affectedRows > 0) {
                res.status(201).json({ 
                    success: true, 
                    message: "Usuário cadastrado com sucesso!",
                    userId: result.insertId
                });
            } else {
                res.status(500).json({ success: false, message: "Falha ao cadastrar o usuário." });
            }

        } catch (error) {
            console.error('Erro no cadastro de usuário:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: "Este email já está cadastrado." });
            }
            
            if (error.code === 'ER_DATA_TOO_LONG') {
                return res.status(400).json({ 
                    success: false, 
                    message: "Dados excedem o tamanho permitido." 
                });
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
            console.error('Erro no login de usuário:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota para BUSCAR Perfil de Usuário
    router.get('/buscar_usuario', async (req, res) => {
        const userId = req.query.id_usuario;

        if (!userId) {
            return res.status(400).json({ success: false, message: "ID do usuário não fornecido." });
        }

        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
                        BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
                        DT_NASC_USUARIO, TIPO_USUARIO
                 FROM USUARIOS WHERE ID_USUARIO = ?`,
                [userId]
            );
            connection.release();

            if (rows.length > 0) {
                res.status(200).json({ success: true, message: "Dados do usuário encontrados.", user: rows[0] });
            } else {
                res.status(404).json({ success: false, message: "Usuário não encontrado." });
            }

        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota para ATUALIZAR Perfil de Usuário
    router.put('/atualizar_usuario', async (req, res) => {
        const {
            id_usuario,
            NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
            BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
            DT_NASC_USUARIO, TIPO_USUARIO, NOVA_SENHA_USUARIO, CONFIRM_SENHA_USUARIO
        } = req.body;

        if (!id_usuario) {
            return res.status(400).json({ success: false, message: "ID do usuário é obrigatório para atualização." });
        }
        if (!NOME_USUARIO || !EMAIL_USUARIO) {
            return res.status(400).json({ success: false, message: "Nome e Email são campos obrigatórios." });
        }
        if (NOVA_SENHA_USUARIO && NOVA_SENHA_USUARIO !== CONFIRM_SENHA_USUARIO) {
            return res.status(400).json({ success: false, message: "As novas senhas não coincidem." });
        }

        // Validação de senha forte se for alterar senha
        if (NOVA_SENHA_USUARIO) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(NOVA_SENHA_USUARIO)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "A nova senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais." 
                });
            }
        }

        let updateSql = `UPDATE USUARIOS SET
                            NOME_USUARIO = ?, EMAIL_USUARIO = ?, CELULAR_USUARIO = ?,
                            LOGRADOURO_USUARIO = ?, BAIRRO_USUARIO = ?, CIDADE_USUARIO = ?,
                            UF_USUARIO = ?, CEP_USUARIO = ?, DT_NASC_USUARIO = ?, TIPO_USUARIO = ?`;
        let updateValues = [
            NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
            BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
            DT_NASC_USUARIO, TIPO_USUARIO
        ];

        if (NOVA_SENHA_USUARIO) {
            const hashedNewPassword = await bcrypt.hash(NOVA_SENHA_USUARIO, 12);
            updateSql += `, SENHA_USUARIO = ?`;
            updateValues.push(hashedNewPassword);
        }

        updateSql += ` WHERE ID_USUARIO = ?`;
        updateValues.push(id_usuario);

        try {
            const connection = await pool.getConnection();
            
            // Verifica se o novo email já existe para outro usuário
            const [existingEmail] = await connection.execute(
                'SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ? AND ID_USUARIO != ?',
                [EMAIL_USUARIO, id_usuario]
            );
            
            if (existingEmail.length > 0) {
                connection.release();
                return res.status(409).json({ success: false, message: "Este email já está cadastrado para outro usuário." });
            }

            const [result] = await connection.execute(updateSql, updateValues);
            connection.release();

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: "Perfil atualizado com sucesso!" });
            } else {
                res.status(200).json({ success: false, message: "Nenhuma alteração detectada ou usuário não encontrado." });
            }

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: "Este email já está cadastrado para outro usuário." });
            }
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    return router;
};