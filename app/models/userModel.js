const bcrypt = require('bcryptjs');

class UserModel {
    constructor(pool) {
        this.pool = pool;
    }

    async findByEmail(email) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO
                 FROM USUARIOS WHERE EMAIL_USUARIO = ? LIMIT 1`,
                [email]
            );
            return rows[0];
        } finally {
            if (connection) connection.release();
        }
    }

    async findById(userId) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
                        BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
                        DT_NASC_USUARIO, TIPO_USUARIO
                 FROM USUARIOS WHERE ID_USUARIO = ?`,
                [userId]
            );
            return rows[0];
        } finally {
            if (connection) connection.release();
        }
    }

    async create(userData) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(
                `INSERT INTO USUARIOS (
                    NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
                    LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                    CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO, DATA_CADASTRO
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    userData.NOME_USUARIO, userData.EMAIL_USUARIO, userData.SENHA_USUARIO, 
                    userData.CELULAR_USUARIO || null, userData.LOGRADOURO_USUARIO || null,
                    userData.BAIRRO_USUARIO || null, userData.CIDADE_USUARIO || null,
                    userData.UF_USUARIO || null, userData.CEP_USUARIO || null,
                    userData.DT_NASC_USUARIO || null, userData.TIPO_USUARIO || 'cliente'
                ]
            );
            return result;
        } finally {
            if (connection) connection.release();
        }
    }

    async update(userId, updateData) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            
            const fields = [];
            const values = [];
            
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            values.push(userId);
            
            const [result] = await connection.execute(
                `UPDATE USUARIOS SET ${fields.join(', ')} WHERE ID_USUARIO = ?`,
                values
            );
            
            return result;
        } finally {
            if (connection) connection.release();
        }
    }

    async emailExists(email, excludeUserId = null) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            let sql = 'SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?';
            const params = [email];
            
            if (excludeUserId) {
                sql += ' AND ID_USUARIO != ?';
                params.push(excludeUserId);
            }

            const [rows] = await connection.execute(sql, params);
            return rows.length > 0;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = UserModel;