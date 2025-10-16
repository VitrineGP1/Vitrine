class ProductController {
    constructor(pool) {
        this.pool = pool;
    }

    async createProduct(req, res) {
        const {
            NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR,
            SUBCATEGORIA, TAMANHO, QUANTIDADE, BUSTO_P, COMP_P, BUSTO_M, COMP_M, BUSTO_G, COMP_G
        } = req.body;

        if (!NOME_PROD || !VALOR_UNITARIO || !ID_VENDEDOR || !QUANTIDADE) {
            return res.status(400).json({ success: false, message: "Nome, valor unitário, ID do vendedor e quantidade são obrigatórios." });
        }
        if (isNaN(VALOR_UNITARIO) || parseFloat(VALOR_UNITARIO) <= 0) {
            return res.status(400).json({ success: false, message: "O valor do produto deve ser maior que zero." });
        }

        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(
                `INSERT INTO PRODUTOS (NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR,
                                       SUBCATEGORIA, TAMANHO, QUANTIDADE, BUSTO_P, COMP_P, BUSTO_M, COMP_M, BUSTO_G, COMP_G)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [NOME_PROD, (DESCRICAO_PROD || '').substring(0, 250) || null, VALOR_UNITARIO, IMAGEM_URL || null, IMAGEM_BASE64 || null, ID_CATEGORIA || null, ID_VENDEDOR,
                 SUBCATEGORIA || null, TAMANHO || null, QUANTIDADE, BUSTO_P || null, COMP_P || null, BUSTO_M || null, COMP_M || null, BUSTO_G || null, COMP_G || null]
            );
            res.status(201).json({ success: true, message: "Produto cadastrado com sucesso!", productId: result.insertId });

        } catch (error) {
            console.error('Erro ao cadastrar produto:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor: " + error.message });
        } finally {
            if (connection) connection.release();
        }
    }

    async getProducts(req, res) {
        const { seller_id } = req.query;

        let sql = `SELECT DISTINCT p.ID_PROD, p.NOME_PROD, p.DESCRICAO_PROD, p.VALOR_UNITARIO, p.IMAGEM_URL, p.IMAGEM_BASE64, p.ID_CATEGORIA, p.ID_VENDEDOR, COALESCE(v1.NOME_LOJA, v2.NOME_LOJA) as NOME_LOJA 
                   FROM PRODUTOS p 
                   LEFT JOIN VENDEDORES v1 ON v1.ID_USUARIO = p.ID_VENDEDOR 
                   LEFT JOIN VENDEDORES v2 ON v2.ID_VENDEDOR = p.ID_VENDEDOR`;
        let params = [];

        if (seller_id) {
            sql += ` WHERE (p.ID_VENDEDOR = ? OR v2.ID_USUARIO = ?)`;
            params.push(seller_id, seller_id);
        }

        let connection;
        try {
            connection = await this.pool.getConnection();
            const [rows] = await connection.execute(sql, params);
            res.status(200).json({ success: true, products: rows });

        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        } finally {
            if (connection) connection.release();
        }
    }

    async updateProduct(req, res) {
        const productId = req.params.id;
        const {
            NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR
        } = req.body;

        if (!NOME_PROD || !VALOR_UNITARIO || !ID_VENDEDOR) {
            return res.status(400).json({ success: false, message: "Nome, valor unitário e ID do vendedor são obrigatórios." });
        }
        if (isNaN(VALOR_UNITARIO) || parseFloat(VALOR_UNITARIO) <= 0) {
            return res.status(400).json({ success: false, message: "O valor do produto deve ser maior que zero." });
        }

        let updateSql = `UPDATE PRODUTOS SET NOME_PROD = ?, DESCRICAO_PROD = ?, VALOR_UNITARIO = ?, ID_CATEGORIA = ?`;
        let updateValues = [NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, ID_CATEGORIA];

        if (IMAGEM_URL !== undefined) {
            updateSql += `, IMAGEM_URL = ?`;
            updateValues.push(IMAGEM_URL);
        }

        if (IMAGEM_BASE64 !== undefined) {
            updateSql += `, IMAGEM_BASE64 = ?`;
            updateValues.push(IMAGEM_BASE64);
        }

        updateSql += ` WHERE ID_PROD = ? AND ID_VENDEDOR = ?`;
        updateValues.push(productId, ID_VENDEDOR);

        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(updateSql, updateValues);

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: "Produto atualizado com sucesso!" });
            } else {
                res.status(404).json({ success: false, message: "Produto não encontrado ou você não tem permissão para editá-lo." });
            }

        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        } finally {
            if (connection) connection.release();
        }
    }

    async deleteProduct(req, res) {
        const productId = req.params.id;
        const { ID_VENDEDOR } = req.body;

        if (!ID_VENDEDOR) {
            return res.status(400).json({ success: false, message: "ID do vendedor é obrigatório para exclusão." });
        }

        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute(
                `DELETE FROM PRODUTOS WHERE ID_PROD = ? AND ID_VENDEDOR = ?`,
                [productId, ID_VENDEDOR]
            );

            if (result.affectedRows > 0) {
                res.status(200).json({ success: true, message: "Produto excluído com sucesso!" });
            } else {
                res.status(404).json({ success: false, message: "Produto não encontrado ou você não tem permissão para excluí-lo." });
            }

        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor." });
        } finally {
            if (connection) connection.release();
        }
    }

    async getProductDetails(req, res) {
        const productId = req.params.id;
        let connection;
        try {
            connection = await this.pool.getConnection();
            
            const [productRows] = await connection.execute(
                `SELECT p.*, c.NOME_CATEGORIA as CATEGORIA 
                 FROM PRODUTOS p 
                 LEFT JOIN CATEGORIAS c ON p.ID_CATEGORIA = c.ID_CATEGORIA 
                 WHERE p.ID_PROD = ?`,
                [productId]
            );
            
            if (productRows.length === 0) {
                return res.json({ success: false, message: 'Produto não encontrado' });
            }
            
            const product = productRows[0];
            
            // Buscar dados do vendedor usando múltiplas estratégias
            const [sellerRows] = await connection.execute(
                `SELECT 
                    COALESCE(u1.NOME_USUARIO, u2.NOME_USUARIO) as NOME_USUARIO,
                    COALESCE(u1.EMAIL_USUARIO, u2.EMAIL_USUARIO) as EMAIL_USUARIO,
                    COALESCE(u1.CIDADE_USUARIO, u2.CIDADE_USUARIO) as CIDADE_USUARIO,
                    COALESCE(v1.NOME_LOJA, v2.NOME_LOJA) as NOME_LOJA
                 FROM PRODUTOS p
                 LEFT JOIN USUARIOS u1 ON u1.ID_USUARIO = p.ID_VENDEDOR
                 LEFT JOIN VENDEDORES v1 ON v1.ID_USUARIO = u1.ID_USUARIO
                 LEFT JOIN VENDEDORES v2 ON v2.ID_VENDEDOR = p.ID_VENDEDOR
                 LEFT JOIN USUARIOS u2 ON u2.ID_USUARIO = v2.ID_USUARIO
                 WHERE p.ID_PROD = ?`,
                [productId]
            );
            
            const seller = sellerRows.length > 0 ? sellerRows[0] : null;
            
            res.json({ 
                success: true, 
                product, 
                seller 
            });
            
        } catch (error) {
            console.error('Erro ao buscar detalhes do produto:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        } finally {
            if (connection) connection.release();
        }
    }

    async renderProductsPage(req, res) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [produtos] = await connection.execute('SELECT ID_PROD, NOME_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64 FROM PRODUTOS');
            res.render('produtos', { produtos: produtos });
        } catch (error) {
            console.error('Erro ao buscar produtos para EJS:', error);
            res.status(500).send('Erro ao carregar a página de produtos.');
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = ProductController;