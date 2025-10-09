const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Buscar usuário por email (para login)
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
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
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuário por ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    u.ID_USUARIO,
                    u.NOME_USUARIO,
                    u.EMAIL_USUARIO,
                    u.TIPO_USUARIO,
                    u.IMAGEM_PERFIL_BASE64,
                    u.CELULAR_USUARIO,
                    u.LOGRADOURO_USUARIO,
                    u.BAIRRO_USUARIO,
                    u.CIDADE_USUARIO,
                    u.UF_USUARIO,
                    CASE 
                        WHEN u.TIPO_USUARIO = 'C' THEN c.CPF_CLIENTE
                        WHEN u.TIPO_USUARIO = 'V' THEN v.DIGITO_PESSOA
                        WHEN u.TIPO_USUARIO = 'A' THEN a.CPF_ADM
                    END as DOCUMENTO
                 FROM USUARIOS u
                 LEFT JOIN CLIENTES c ON u.ID_USUARIO = c.ID_USUARIO
                 LEFT JOIN VENDEDORES v ON u.ID_USUARIO = v.ID_USUARIO
                 LEFT JOIN ADMINISTRADORES a ON u.ID_USUARIO = a.ID_USUARIO
                 WHERE u.ID_USUARIO = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Comparar senha
    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Criar hash da senha
    static async hashPassword(password) {
        return await bcrypt.hash(password, 12);
    }
}

module.exports = User;