class Seller {
    constructor(pool) {
        this.pool = pool;
    }

    async findById(id) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT * FROM VENDEDORES WHERE ID_VENDEDOR = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async findByUserId(userId) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT * FROM VENDEDORES WHERE ID_USUARIO = ?`,
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async create(sellerData) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(
                `INSERT INTO VENDEDORES (ID_USUARIO, NOME_LOJA, IMAGEM_PERFIL_LOJA_BASE64) 
                 VALUES (?, ?, ?)`,
                [sellerData.userId, sellerData.nomeLoja, sellerData.imagemLoja]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async update(id, sellerData) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            
            let updateSql = `UPDATE VENDEDORES SET`;
            const updateValues = [];
            const setClauses = [];

            if (sellerData.nomeLoja !== undefined) {
                setClauses.push(`NOME_LOJA = ?`);
                updateValues.push(sellerData.nomeLoja);
            }
            if (sellerData.imagemLoja !== undefined) {
                setClauses.push(`IMAGEM_PERFIL_LOJA_BASE64 = ?`);
                updateValues.push(sellerData.imagemLoja);
            }

            if (setClauses.length === 0) {
                return false;
            }

            updateSql += ` ${setClauses.join(', ')} WHERE ID_VENDEDOR = ?`;
            updateValues.push(id);

            const [result] = await connection.execute(updateSql, updateValues);
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
                `DELETE FROM VENDEDORES WHERE ID_VENDEDOR = ?`,
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
                `SELECT v.*, u.NOME_USUARIO, u.EMAIL_USUARIO, u.CIDADE_USUARIO
                 FROM VENDEDORES v
                 JOIN USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO
                 ORDER BY v.ID_VENDEDOR DESC`
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = Seller;