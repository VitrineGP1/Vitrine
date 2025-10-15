class SellerController {
    constructor(pool) {
        this.pool = pool;
    }

    async getSellerProfile(req, res) {
        const sellerId = req.query.id_vendedor;

        if (!sellerId) {
            return res.status(400).json({ success: false, message: "ID do vendedor não fornecido." });
        }

        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(
                `SELECT ID_VENDEDOR, NOME_LOJA, IMAGEM_PERFIL_LOJA_BASE64
                 FROM VENDEDORES WHERE ID_VENDEDOR = ?`,
                [sellerId]
            );

            if (rows.length > 0) {
                res.status(200).json({ success: true, message: "Dados do vendedor encontrados.", seller: rows[0] });
            } else {
                res.status(404).json({ success: false, message: "Vendedor não encontrado." });
            }

        } catch (error) {
            console.error('Erro ao buscar perfil do vendedor:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        } finally {
            if (connection) connection.release();
        }
    }

    async updateSellerProfile(req, res) {
        const { id_vendedor, NOME_LOJA, IMAGEM_PERFIL_LOJA_BASE64 } = req.body;

        if (!id_vendedor) {
            return res.status(400).json({ success: false, message: "ID do vendedor é obrigatório para atualização." });
        }

        let updateSql = `UPDATE VENDEDORES SET`;
        const updateValues = [];
        const setClauses = [];

        if (NOME_LOJA !== undefined) {
            setClauses.push(`NOME_LOJA = ?`);
            updateValues.push(NOME_LOJA);
        }
        if (IMAGEM_PERFIL_LOJA_BASE64 !== undefined) {
            setClauses.push(`IMAGEM_PERFIL_LOJA_BASE64 = ?`);
            updateValues.push(IMAGEM_PERFIL_LOJA_BASE64);
        }

        if (setClauses.length === 0) {
            return res.status(400).json({ success: false, message: "Nenhum dado para atualizar." });
        }

        updateSql += ` ${setClauses.join(', ')} WHERE ID_VENDEDOR = ?`;
        updateValues.push(id_vendedor);

        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(updateSql, updateValues);

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: "Perfil do vendedor atualizado com sucesso!" });
            } else {
                res.status(404).json({ success: false, message: "Vendedor não encontrado ou nenhuma alteração detectada." });
            }

        } catch (error) {
            console.error('Erro ao atualizar perfil do vendedor:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = SellerController;