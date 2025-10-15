const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

module.exports = (pool) => {

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
                        DT_NASC_USUARIO, TIPO_USUARIO, IMAGEM_PERFIL_BASE64
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
            console.error('Erro ao buscar usuário (Node.js API):', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota para ATUALIZAR Perfil de Usuário
    router.put('/atualizar_usuario', async (req, res) => { // Use PUT para atualizações
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
            const hashedNewPassword = await bcrypt.hash(NOVA_SENHA_USUARIO, 10);
            updateSql += `, SENHA_USUARIO = ?`;
            updateValues.push(hashedNewPassword);
        }

        updateSql += ` WHERE ID_USUARIO = ?`;
        updateValues.push(id_usuario);

        try {
            const connection = await pool.getConnection();
            const [result] = await connection.execute(updateSql, updateValues);
            connection.release();

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: "Perfil atualizado com sucesso!" });
            } else {
                res.status(200).json({ success: false, message: "Nenhuma alteração detectada ou usuário não encontrado." });
            }

        } catch (error) {
            console.error('Erro ao atualizar perfil (Node.js API):', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: "Este email já está cadastrado para outro usuário." });
            }
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota para buscar usuário por ID
    router.get('/user/:id', async (req, res) => {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "ID do usuário não fornecido." });
        }

        try {
            const connection = await pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
                        BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
                        DT_NASC_USUARIO, TIPO_USUARIO, IMAGEM_PERFIL_BASE64
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
            console.error('Erro ao buscar usuário (Node.js API):', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    // Rota para atualizar imagem de perfil
    router.post('/update-profile-image', async (req, res) => {
        const { userId, imageBase64 } = req.body;

        if (!userId || !imageBase64) {
            return res.status(400).json({ success: false, message: "ID do usuário e imagem são obrigatórios." });
        }

        try {
            const connection = await pool.getConnection();
            const [result] = await connection.execute(
                'UPDATE USUARIOS SET IMAGEM_PERFIL_BASE64 = ? WHERE ID_USUARIO = ?',
                [imageBase64, userId]
            );
            connection.release();

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: "Imagem de perfil atualizada com sucesso!" });
            } else {
                res.status(404).json({ success: false, message: "Usuário não encontrado." });
            }

        } catch (error) {
            console.error('Erro ao atualizar imagem de perfil:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        }
    });

    return router;
};