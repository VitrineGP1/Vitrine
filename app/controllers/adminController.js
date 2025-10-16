class AdminController {
    constructor(pool) {
        this.pool = pool;
    }

    async getUsers(req, res) {
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [users] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, 
                        CIDADE_USUARIO, TIPO_USUARIO 
                 FROM USUARIOS ORDER BY ID_USUARIO DESC`
            );
            res.json({ success: true, users });
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        } finally {
            if (connection) connection.release();
        }
    }

    async deleteUser(req, res) {
        const userId = req.params.id;
        let connection;
        try {
            connection = await this.pool.getConnection();
            await connection.beginTransaction();
            
            // Deletar produtos usando múltiplas estratégias
            await connection.execute('DELETE FROM PRODUTOS WHERE ID_VENDEDOR = ?', [userId]);
            await connection.execute(
                'DELETE p FROM PRODUTOS p INNER JOIN VENDEDORES v ON v.ID_VENDEDOR = p.ID_VENDEDOR WHERE v.ID_USUARIO = ?', 
                [userId]
            );
            
            await connection.execute('DELETE FROM VENDEDORES WHERE ID_USUARIO = ?', [userId]);
            await connection.execute('DELETE FROM CLIENTES WHERE ID_USUARIO = ?', [userId]);
            await connection.execute('DELETE FROM ADMINISTRADORES WHERE ID_USUARIO = ?', [userId]);
            
            const [result] = await connection.execute('DELETE FROM USUARIOS WHERE ID_USUARIO = ?', [userId]);
            
            await connection.commit();
            
            if (result.affectedRows > 0) {
                res.json({ success: true, message: 'Usuário excluído com sucesso' });
            } else {
                res.json({ success: false, message: 'Usuário não encontrado' });
            }
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Erro ao excluir usuário:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        } finally {
            if (connection) connection.release();
        }
    }

    async getUserDetails(req, res) {
        const userId = req.params.id;
        let connection;
        try {
            connection = await this.pool.getConnection();
            
            const [userRows] = await connection.execute(
                `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, 
                        LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, 
                        CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO, IMAGEM_PERFIL_BASE64 
                 FROM USUARIOS WHERE ID_USUARIO = ?`,
                [userId]
            );
            
            if (userRows.length === 0) {
                return res.json({ success: false, message: 'Usuário não encontrado' });
            }
            
            const user = userRows[0];
            
            let products = [];
            if (user.TIPO_USUARIO === 'V') {
                // Buscar produtos usando múltiplas estratégias para garantir compatibilidade
                const [productRows] = await connection.execute(
                    `SELECT DISTINCT p.ID_PROD, p.NOME_PROD, p.VALOR_UNITARIO, p.IMAGEM_BASE64, p.DATA_CADASTRO 
                     FROM PRODUTOS p 
                     LEFT JOIN VENDEDORES v ON v.ID_VENDEDOR = p.ID_VENDEDOR
                     WHERE p.ID_VENDEDOR = ? OR v.ID_USUARIO = ? 
                     ORDER BY p.DATA_CADASTRO DESC`,
                    [userId, userId]
                );
                products = productRows;
            }
            
            const totalProducts = products.length;
            const totalRevenue = products.reduce((sum, product) => sum + parseFloat(product.VALOR_UNITARIO || 0), 0);
            
            const stats = {
                totalProducts,
                totalSales: 0,
                totalRevenue,
                rating: 4.5
            };
            
            res.json({ 
                success: true, 
                user, 
                products, 
                stats 
            });
            
        } catch (error) {
            console.error('Erro ao buscar detalhes do usuário:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        } finally {
            if (connection) connection.release();
        }
    }

    async deleteProduct(req, res) {
        const productId = req.params.id;
        let connection;
        try {
            connection = await this.pool.getConnection();
            const [result] = await connection.execute('DELETE FROM PRODUTOS WHERE ID_PROD = ?', [productId]);
            
            if (result.affectedRows > 0) {
                res.json({ success: true, message: 'Produto excluído com sucesso' });
            } else {
                res.json({ success: false, message: 'Produto não encontrado' });
            }
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = AdminController;