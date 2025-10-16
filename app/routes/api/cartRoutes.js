const express = require('express');
const router = express.Router();
const pool = require('../../../config/pool-conexoes');

// Middleware para verificar autenticação
const requireAuth = (req, res, next) => {
    const loggedUser = req.session?.user || JSON.parse(req.headers['x-logged-user'] || 'null');
    if (!loggedUser || !loggedUser.id) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    req.user = loggedUser;
    next();
};

// Rota para adicionar item ao carrinho
router.post('/add', async (req, res) => {
    try {
        const { productId, name, price, image, quantity, size } = req.body;

        if (!productId || !name || !price || !image) {
            return res.status(400).json({
                success: false,
                message: 'Dados do produto incompletos'
            });
        }

        // Para usuários não logados, usar localStorage (não fazer nada no servidor)
        const loggedUser = req.session?.user || JSON.parse(req.headers['x-logged-user'] || 'null');

        if (!loggedUser || !loggedUser.id) {
            return res.json({
                success: true,
                message: 'Produto adicionado ao carrinho local',
                cartType: 'local'
            });
        }

        // Para usuários logados, salvar no banco
        const connection = await pool.getConnection();

        try {
            // Verificar se já existe no carrinho
            const [existing] = await connection.execute(
                'SELECT ID_CARRINHO, QUANTIDADE FROM CARRINHO WHERE ID_USUARIO = ? AND ID_PRODUTO = ? AND TAMANHO = ?',
                [loggedUser.id, productId, size || null]
            );

            if (existing.length > 0) {
                // Atualizar quantidade
                await connection.execute(
                    'UPDATE CARRINHO SET QUANTIDADE = QUANTIDADE + ? WHERE ID_CARRINHO = ?',
                    [quantity, existing[0].ID_CARRINHO]
                );
            } else {
                // Inserir novo item
                await connection.execute(
                    'INSERT INTO CARRINHO (ID_USUARIO, ID_PRODUTO, NOME_PRODUTO, PRECO, IMAGEM, QUANTIDADE, TAMANHO, DT_ADICIONADO) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
                    [loggedUser.id, productId, name, price, image, quantity, size || null]
                );
            }

            // Buscar carrinho atualizado
            const [cartItems] = await connection.execute(
                'SELECT * FROM CARRINHO WHERE ID_USUARIO = ? ORDER BY DT_ADICIONADO DESC',
                [loggedUser.id]
            );

            connection.release();

            res.json({
                success: true,
                message: 'Produto adicionado ao carrinho',
                cartType: 'server',
                cart: cartItems
            });

        } catch (dbError) {
            connection.release();
            throw dbError;
        }

    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para obter carrinho do usuário
router.get('/get', async (req, res) => {
    try {
        const loggedUser = req.session?.user || JSON.parse(req.headers['x-logged-user'] || 'null');

        if (!loggedUser || !loggedUser.id) {
            return res.json({
                success: true,
                cart: [],
                cartType: 'local'
            });
        }

        const connection = await pool.getConnection();

        const [cartItems] = await connection.execute(
            'SELECT * FROM CARRINHO WHERE ID_USUARIO = ? ORDER BY DT_ADICIONADO DESC',
            [loggedUser.id]
        );

        connection.release();

        res.json({
            success: true,
            cart: cartItems,
            cartType: 'server'
        });

    } catch (error) {
        console.error('Erro ao buscar carrinho:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para atualizar quantidade
router.put('/update/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const { quantity } = req.body;
        const loggedUser = req.session?.user || JSON.parse(req.headers['x-logged-user'] || 'null');

        if (!loggedUser || !loggedUser.id) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }

        if (quantity <= 0) {
            return res.status(400).json({ success: false, message: 'Quantidade deve ser maior que 0' });
        }

        const connection = await pool.getConnection();

        await connection.execute(
            'UPDATE CARRINHO SET QUANTIDADE = ? WHERE ID_CARRINHO = ? AND ID_USUARIO = ?',
            [quantity, cartId, loggedUser.id]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Quantidade atualizada'
        });

    } catch (error) {
        console.error('Erro ao atualizar carrinho:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para remover item do carrinho
router.delete('/remove/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const loggedUser = req.session?.user || JSON.parse(req.headers['x-logged-user'] || 'null');

        if (!loggedUser || !loggedUser.id) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }

        const connection = await pool.getConnection();

        await connection.execute(
            'DELETE FROM CARRINHO WHERE ID_CARRINHO = ? AND ID_USUARIO = ?',
            [cartId, loggedUser.id]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Item removido do carrinho'
        });

    } catch (error) {
        console.error('Erro ao remover do carrinho:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para sincronizar carrinho local com servidor
router.post('/sync', async (req, res) => {
    try {
        const { localCart } = req.body;
        const loggedUser = req.session?.user || JSON.parse(req.headers['x-logged-user'] || 'null');

        if (!loggedUser || !loggedUser.id) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }

        if (!Array.isArray(localCart)) {
            return res.status(400).json({ success: false, message: 'Carrinho local inválido' });
        }

        const connection = await pool.getConnection();

        try {
            // Limpar carrinho atual do servidor
            await connection.execute('DELETE FROM CARRINHO WHERE ID_USUARIO = ?', [loggedUser.id]);

            // Inserir itens do carrinho local
            for (const item of localCart) {
                await connection.execute(
                    'INSERT INTO CARRINHO (ID_USUARIO, ID_PRODUTO, NOME_PRODUTO, PRECO, IMAGEM, QUANTIDADE, TAMANHO, DT_ADICIONADO) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
                    [loggedUser.id, item.id, item.name, item.price, item.image, item.quantity, item.size || null]
                );
            }

            connection.release();

            res.json({
                success: true,
                message: 'Carrinho sincronizado com sucesso'
            });

        } catch (dbError) {
            connection.release();
            throw dbError;
        }

    } catch (error) {
        console.error('Erro ao sincronizar carrinho:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Rota para limpar carrinho
router.delete('/clear', async (req, res) => {
    try {
        const loggedUser = req.session?.user || JSON.parse(req.headers['x-logged-user'] || 'null');

        if (!loggedUser || !loggedUser.id) {
            return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        }

        const connection = await pool.getConnection();

        await connection.execute('DELETE FROM CARRINHO WHERE ID_USUARIO = ?', [loggedUser.id]);

        connection.release();

        res.json({
            success: true,
            message: 'Carrinho limpo'
        });

    } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router;
