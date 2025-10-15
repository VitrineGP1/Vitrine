class ProductController {
    constructor(pool) {
        this.pool = pool;
    }

    async createProduct(req, res) {
        console.log('=== CREATE PRODUCT ===');
        console.log('Request body:', req.body);
        
        const {
            NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR,
            SUBCATEGORIA, TAMANHO, QUANTIDADE, BUSTO_P, COMP_P, BUSTO_M, COMP_M, BUSTO_G, COMP_G
        } = req.body;

        console.log('Extracted values:', {
            NOME_PROD, VALOR_UNITARIO, ID_VENDEDOR, QUANTIDADE
        });

        if (!NOME_PROD || !VALOR_UNITARIO || !ID_VENDEDOR || !QUANTIDADE) {
            console.log('Validation failed: missing required fields');
            return res.status(400).json({ success: false, message: "Nome, valor unitário, ID do vendedor e quantidade são obrigatórios." });
        }
        if (isNaN(VALOR_UNITARIO) || parseFloat(VALOR_UNITARIO) <= 0) {
            console.log('Validation failed: invalid price');
            return res.status(400).json({ success: false, message: "O valor do produto deve ser maior que zero." });
        }

        let connection;
        try {
            connection = await this.pool.getConnection();
            console.log('Database connection obtained');
            
            const values = [NOME_PROD, (DESCRICAO_PROD || '').substring(0, 250) || null, VALOR_UNITARIO, IMAGEM_URL || null, IMAGEM_BASE64 || null, ID_CATEGORIA || null, ID_VENDEDOR,
                 SUBCATEGORIA || null, TAMANHO || null, QUANTIDADE, BUSTO_P || null, COMP_P || null, BUSTO_M || null, COMP_M || null, BUSTO_G || null, COMP_G || null];
            
            console.log('SQL values:', values);
            
            const [result] = await connection.execute(
                `INSERT INTO PRODUTOS (NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR,
                                       SUBCATEGORIA, TAMANHO, QUANTIDADE, BUSTO_P, COMP_P, BUSTO_M, COMP_M, BUSTO_G, COMP_G)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                values
            );
            
            console.log('Product created successfully, ID:', result.insertId);
            res.status(201).json({ success: true, message: "Produto cadastrado com sucesso!", productId: result.insertId });

        } catch (error) {
            console.error('=== DATABASE ERROR ===');
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('SQL State:', error.sqlState);
            console.error('Full error:', error);
            res.status(500).json({ success: false, message: "Erro interno do servidor: " + error.message });
        } finally {
            if (connection) connection.release();
        }
    }

    async getProducts(req, res) {
        const { seller_id } = req.query;

        let sql = `SELECT ID_PROD, NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR FROM PRODUTOS`;
        let params = [];

        if (seller_id) {
            sql += ` WHERE ID_VENDEDOR = ?`;
            params.push(seller_id);
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
            
            const [sellerRows] = await connection.execute(
                `SELECT v.NOME_LOJA, u.EMAIL_USUARIO, u.CIDADE_USUARIO
                 FROM VENDEDORES v
                 JOIN USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO
                 WHERE v.ID_VENDEDOR = ?`,
                [product.ID_VENDEDOR]
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