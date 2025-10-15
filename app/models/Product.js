class Product {
    constructor(pool) {
        this.pool = pool;
    }

    async findById(id) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT * FROM PRODUTOS WHERE ID_PROD = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async create(productData) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(
                `INSERT INTO PRODUTOS (NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, 
                                      IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR, SUBCATEGORIA, 
                                      TAMANHO, QUANTIDADE, BUSTO_P, COMP_P, BUSTO_M, COMP_M, 
                                      BUSTO_G, COMP_G) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [productData.nome, productData.descricao, productData.valor, productData.imagemUrl,
                 productData.imagemBase64, productData.categoria, productData.vendedor,
                 productData.subcategoria, productData.tamanho, productData.quantidade,
                 productData.bustoP, productData.compP, productData.bustoM, productData.compM,
                 productData.bustoG, productData.compG]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async update(id, productData) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(
                `UPDATE PRODUTOS SET NOME_PROD = ?, DESCRICAO_PROD = ?, VALOR_UNITARIO = ?, 
                                    IMAGEM_URL = ?, IMAGEM_BASE64 = ?, ID_CATEGORIA = ?
                 WHERE ID_PROD = ? AND ID_VENDEDOR = ?`,
                [productData.nome, productData.descricao, productData.valor,
                 productData.imagemUrl, productData.imagemBase64, productData.categoria,
                 id, productData.vendedor]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async delete(id, vendedorId = null) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            let sql = `DELETE FROM PRODUTOS WHERE ID_PROD = ?`;
            let params = [id];
            
            if (vendedorId) {
                sql += ` AND ID_VENDEDOR = ?`;
                params.push(vendedorId);
            }
            
            const [result] = await connection.execute(sql, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async findBySeller(sellerId) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT * FROM PRODUTOS WHERE ID_VENDEDOR = ? ORDER BY DATA_CADASTRO DESC`,
                [sellerId]
            );
            return rows;
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
                `SELECT ID_PROD, NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, 
                        IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR 
                 FROM PRODUTOS ORDER BY DATA_CADASTRO DESC`
            );
            return rows;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async getWithCategory(id) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT p.*, c.NOME_CATEGORIA as CATEGORIA 
                 FROM PRODUTOS p 
                 LEFT JOIN CATEGORIAS c ON p.ID_CATEGORIA = c.ID_CATEGORIA 
                 WHERE p.ID_PROD = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = Product;