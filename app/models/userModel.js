// models/UserModel.js
class UserModel {
    constructor(pool) {
        this.pool = pool;
    }

    async findByEmail(email) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO
                 FROM USUARIOS WHERE EMAIL_USUARIO = ? LIMIT 1`,
                [email]
            );
            return rows[0];
        } finally {
            connection.release();
        }
    }

    async findById(userId) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
                        BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
                        DT_NASC_USUARIO, TIPO_USUARIO
                 FROM USUARIOS WHERE ID_USUARIO = ?`,
                [userId]
            );
            return rows[0];
        } finally {
            connection.release();
        }
    }

    async create(userData) {
        const connection = await this.pool.getConnection();
        try {
            const [result] = await connection.execute(
                `INSERT INTO USUARIOS SET ?`,
                [userData]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    async update(userId, userData) {
        const connection = await this.pool.getConnection();
        try {
            const [result] = await connection.execute(
                'UPDATE USUARIOS SET ? WHERE ID_USUARIO = ?',
                [userData, userId]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    async emailExists(email, excludeUserId = null) {
        const connection = await this.pool.getConnection();
        try {
            let sql = 'SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?';
            const params = [email];
            
            if (excludeUserId) {
                sql += ' AND ID_USUARIO != ?';
                params.push(excludeUserId);
            }

            const [rows] = await connection.execute(sql, params);
            return rows.length > 0;
        } finally {
            connection.release();
        }
    }
}

module.exports = UserModel;