const bcrypt = require('bcryptjs');

class UserController {
    constructor(pool) {
        this.pool = pool;
    }

    async getUser(req, res) {
        const userId = req.query.id_usuario;

        if (!userId) {
            return res.status(400).json({ success: false, message: "ID do usuário não fornecido." });
        }

        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
                        BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
                        DT_NASC_USUARIO, TIPO_USUARIO, IMAGEM_PERFIL_BASE64
                 FROM USUARIOS WHERE ID_USUARIO = ?`,
                [userId]
            );

            if (rows.length > 0) {
                let userData = rows[0];
                userData.TIPO_USUARIO = userData.TIPO_USUARIO === 'V' ? 'seller' : userData.TIPO_USUARIO === 'C' ? 'buyer' : 'admin';
                
                if (userData.TIPO_USUARIO === 'seller') {
                    const [sellerRows] = await connection.execute(
                        `SELECT IMAGEM_PERFIL_LOJA_BASE64 FROM VENDEDORES WHERE ID_USUARIO = ?`,
                        [userId]
                    );
                    if (sellerRows.length > 0) {
                        userData.IMAGEM_PERFIL_LOJA_BASE64 = sellerRows[0].IMAGEM_PERFIL_LOJA_BASE64;
                    }
                }
                res.status(200).json({ success: true, message: "Dados do usuário encontrados.", user: userData });
            } else {
                res.status(404).json({ success: false, message: "Usuário não encontrado." });
            }

        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        } finally {
            if (connection) connection.release();
        }
    }

    async updateUser(req, res) {
        const {
            id_usuario, NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
            BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
            DT_NASC_USUARIO, TIPO_USUARIO, NOVA_SENHA_USUARIO, CONFIRM_SENHA_USUARIO,
            IMAGEM_PERFIL_BASE64
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

        const tipoUsuarioDB = TIPO_USUARIO === 'seller' ? 'V' : TIPO_USUARIO === 'buyer' ? 'C' : 'A';
        
        let updateSql = `UPDATE USUARIOS SET
                            NOME_USUARIO = ?, EMAIL_USUARIO = ?, CELULAR_USUARIO = ?,
                            LOGRADOURO_USUARIO = ?, BAIRRO_USUARIO = ?, CIDADE_USUARIO = ?,
                            UF_USUARIO = ?, CEP_USUARIO = ?, DT_NASC_USUARIO = ?, TIPO_USUARIO = ?`;
        let updateValues = [
            NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
            BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
            DT_NASC_USUARIO, tipoUsuarioDB
        ];

        if (NOVA_SENHA_USUARIO) {
            const hashedNewPassword = await bcrypt.hash(NOVA_SENHA_USUARIO, 10);
            updateSql += `, SENHA_USUARIO = ?`;
            updateValues.push(hashedNewPassword);
        }

        if (IMAGEM_PERFIL_BASE64 !== undefined) {
            updateSql += `, IMAGEM_PERFIL_BASE64 = ?`;
            updateValues.push(IMAGEM_PERFIL_BASE64);
        }

        updateSql += ` WHERE ID_USUARIO = ?`;
        updateValues.push(id_usuario);

        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(updateSql, updateValues);

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
        } finally {
            if (connection) connection.release();
        }
    }

    async checkUsers(req, res) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [users] = await connection.execute(
                'SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, TIPO_USUARIO, CELULAR_USUARIO, DATA_CADASTRO, IMAGEM_PERFIL_BASE64 FROM USUARIOS ORDER BY DATA_CADASTRO DESC'
            );
            res.json({ success: true, users });
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = UserController;