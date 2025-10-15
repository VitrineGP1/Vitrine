class Review {
    constructor(pool) {
        this.pool = pool;
    }

    async findByProductId(productId) {
        const [reviews] = await this.pool.execute(`
            SELECT a.*, u.NOME_USUARIO 
            FROM AVALIACOES a 
            JOIN CLIENTES c ON a.ID_CLIENTE = c.ID_CLIENTE
            JOIN USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO
            WHERE a.ID_PROD = ? 
            ORDER BY a.DATA_AVALIACAO DESC
        `, [productId]);
        return reviews;
    }

    async create(data) {
        const { clienteId, produtoId, nota, comentario } = data;
        const [result] = await this.pool.execute(`
            INSERT INTO AVALIACOES (ID_CLIENTE, ID_PROD, NOTA, COMENTARIO, DATA_AVALIACAO)
            VALUES (?, ?, ?, ?, NOW())
        `, [clienteId, produtoId, nota, comentario]);
        return result.insertId;
    }

    async findByClienteAndProduct(clienteId, produtoId) {
        const [reviews] = await this.pool.execute(
            'SELECT ID_AVALIACAO FROM AVALIACOES WHERE ID_CLIENTE = ? AND ID_PROD = ?',
            [clienteId, produtoId]
        );
        return reviews[0] || null;
    }

    async findById(id) {
        const [reviews] = await this.pool.execute(
            'SELECT * FROM AVALIACOES WHERE ID_AVALIACAO = ?',
            [id]
        );
        return reviews[0] || null;
    }

    async update(id, data) {
        const { nota, comentario } = data;
        await this.pool.execute(`
            UPDATE AVALIACOES 
            SET NOTA = ?, COMENTARIO = ?
            WHERE ID_AVALIACAO = ?
        `, [nota, comentario, id]);
    }

    async delete(id) {
        await this.pool.execute('DELETE FROM AVALIACOES WHERE ID_AVALIACAO = ?', [id]);
    }

    async findClienteByUserId(userId) {
        const [clientes] = await this.pool.execute(
            'SELECT ID_CLIENTE FROM CLIENTES WHERE ID_USUARIO = ?',
            [userId]
        );
        return clientes[0] || null;
    }
}

module.exports = Review;