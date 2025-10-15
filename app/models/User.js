class User {
    constructor(pool) {
        this.pool = pool;
    }

    async findById(id) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT * FROM USUARIOS WHERE ID_USUARIO = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async findByEmail(email) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT * FROM USUARIOS WHERE EMAIL_USUARIO = ?`,
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async create(userData) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(
                `INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO, 
                                      LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, 
                                      CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO, IMAGEM_PERFIL_BASE64) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userData.nome, userData.email, userData.senha, userData.celular,
                 userData.logradouro, userData.bairro, userData.cidade, userData.uf,
                 userData.cep, userData.dataNasc, userData.tipo, userData.imagemPerfil]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async update(id, userData) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(
                `UPDATE USUARIOS SET NOME_USUARIO = ?, EMAIL_USUARIO = ?, CELULAR_USUARIO = ?,
                                    LOGRADOURO_USUARIO = ?, BAIRRO_USUARIO = ?, CIDADE_USUARIO = ?,
                                    UF_USUARIO = ?, CEP_USUARIO = ?, DT_NASC_USUARIO = ?, 
                                    TIPO_USUARIO = ?, IMAGEM_PERFIL_BASE64 = ?
                 WHERE ID_USUARIO = ?`,
                [userData.nome, userData.email, userData.celular, userData.logradouro,
                 userData.bairro, userData.cidade, userData.uf, userData.cep,
                 userData.dataNasc, userData.tipo, userData.imagemPerfil, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async delete(id) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(
                `DELETE FROM USUARIOS WHERE ID_USUARIO = ?`,
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async getAll() {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, TIPO_USUARIO, 
                        CELULAR_USUARIO, DATA_CADASTRO, IMAGEM_PERFIL_BASE64 
                 FROM USUARIOS ORDER BY DATA_CADASTRO DESC`
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = User;