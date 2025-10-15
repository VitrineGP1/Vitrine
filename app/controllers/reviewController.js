class ReviewController {
    constructor(pool) {
        this.pool = pool;
    }

    async getReviews(req, res) {
        try {
            const { productId } = req.params;
            
            const [reviews] = await this.pool.execute(`
                SELECT a.*, u.NOME_USUARIO 
                FROM AVALIACOES a 
                JOIN CLIENTES c ON a.ID_CLIENTE = c.ID_CLIENTE
                JOIN USUARIOS u ON c.ID_USUARIO = u.ID_USUARIO
                WHERE a.ID_PROD = ? 
                ORDER BY a.DATA_AVALIACAO DESC
            `, [productId]);

            res.json({
                success: true,
                reviews: reviews
            });
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    async createReview(req, res) {
        try {
            const { produto_id, usuario_id, nota, comentario } = req.body;

            if (!produto_id || !usuario_id || !nota || !comentario) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os campos são obrigatórios'
                });
            }

            if (nota < 1 || nota > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'A nota deve ser entre 1 e 5'
                });
            }

            const [clienteResult] = await this.pool.execute(
                'SELECT ID_CLIENTE FROM CLIENTES WHERE ID_USUARIO = ?',
                [usuario_id]
            );

            if (clienteResult.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cliente não encontrado'
                });
            }

            const clienteId = clienteResult[0].ID_CLIENTE;

            const [existingReview] = await this.pool.execute(
                'SELECT ID_AVALIACAO FROM AVALIACOES WHERE ID_CLIENTE = ? AND ID_PROD = ?',
                [clienteId, produto_id]
            );

            if (existingReview.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Você já avaliou este produto'
                });
            }

            const [result] = await this.pool.execute(`
                INSERT INTO AVALIACOES (ID_CLIENTE, ID_PROD, NOTA, COMENTARIO, DATA_AVALIACAO)
                VALUES (?, ?, ?, ?, NOW())
            `, [clienteId, produto_id, nota, comentario]);

            res.json({
                success: true,
                message: 'Avaliação criada com sucesso',
                avaliacaoId: result.insertId
            });

        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    async updateReview(req, res) {
        try {
            const { id } = req.params;
            const { nota, comentario, usuario_id } = req.body;

            const [clienteResult] = await this.pool.execute(
                'SELECT ID_CLIENTE FROM CLIENTES WHERE ID_USUARIO = ?',
                [usuario_id]
            );

            if (clienteResult.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cliente não encontrado'
                });
            }

            const clienteId = clienteResult[0].ID_CLIENTE;

            const [reviewCheck] = await this.pool.execute(
                'SELECT ID_AVALIACAO FROM AVALIACOES WHERE ID_AVALIACAO = ? AND ID_CLIENTE = ?',
                [id, clienteId]
            );

            if (reviewCheck.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Você não tem permissão para editar esta avaliação'
                });
            }

            await this.pool.execute(`
                UPDATE AVALIACOES 
                SET NOTA = ?, COMENTARIO = ?
                WHERE ID_AVALIACAO = ?
            `, [nota, comentario, id]);

            res.json({
                success: true,
                message: 'Avaliação atualizada com sucesso'
            });

        } catch (error) {
            console.error('Erro ao atualizar avaliação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    async deleteReview(req, res) {
        try {
            const { id } = req.params;
            const { usuario_id } = req.body;

            const [clienteResult] = await this.pool.execute(
                'SELECT ID_CLIENTE FROM CLIENTES WHERE ID_USUARIO = ?',
                [usuario_id]
            );

            if (clienteResult.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cliente não encontrado'
                });
            }

            const clienteId = clienteResult[0].ID_CLIENTE;

            const [reviewCheck] = await this.pool.execute(
                'SELECT ID_AVALIACAO FROM AVALIACOES WHERE ID_AVALIACAO = ? AND ID_CLIENTE = ?',
                [id, clienteId]
            );

            if (reviewCheck.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Você não tem permissão para excluir esta avaliação'
                });
            }

            await this.pool.execute('DELETE FROM AVALIACOES WHERE ID_AVALIACAO = ?', [id]);

            res.json({
                success: true,
                message: 'Avaliação excluída com sucesso'
            });

        } catch (error) {
            console.error('Erro ao excluir avaliação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    renderProductDetails(req, res) {
        res.render('pages/produto-detalhes');
    }
}

module.exports = ReviewController;