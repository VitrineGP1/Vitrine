const express = require('express');
const router = express.Router();
const pool = require('../../../config/pool-conexoes');

// Função para calcular taxa baseada no valor
function calculateTax(value) {
    if (value <= 74.99) return 0.25; // 25%
    if (value <= 99.99) return 0.15; // 15%
    return 0.12; // 12%
}

// Rota para criar pedido após pagamento aprovado
router.post('/create-order', async (req, res) => {
    const { userId, cartItems, paymentId } = req.body;

    if (!userId || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, message: "Dados do pedido incompletos." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Buscar ID do cliente baseado no userId
        const [clientRows] = await connection.execute(
            'SELECT ID_CLIENTE FROM CLIENTES WHERE ID_USUARIO = ?',
            [userId]
        );

        if (clientRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: "Cliente não encontrado." });
        }

        const clientId = clientRows[0].ID_CLIENTE;

        // Criar pedido
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const [orderResult] = await connection.execute(
            'INSERT INTO PEDIDOS (ID_CLIENTE, DT_PEDIDO) VALUES (?, ?)',
            [clientId, currentDate]
        );

        const orderId = orderResult.insertId;

        // Inserir produtos do pedido
        for (const item of cartItems) {
            await connection.execute(
                'INSERT INTO PEDIDOS_PRODUTOS (ID_PEDIDO, ID_PROD) VALUES (?, ?)',
                [orderId, item.id]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Pedido criado com sucesso!",
            orderId: orderId
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para buscar pedidos do usuário
router.get('/user-orders/:userId', async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ success: false, message: "ID do usuário é obrigatório." });
    }

    try {
        const connection = await pool.getConnection();

        // Buscar pedidos do usuário com produtos
        const [orders] = await connection.execute(`
            SELECT
                p.ID_PEDIDO,
                p.DT_PEDIDO,
                pp.ID_PROD,
                prod.NOME_PROD,
                prod.VALOR_UNITARIO,
                prod.IMAGEM_URL,
                prod.IMAGEM_BASE64,
                v.NOME_LOJA,
                u.NOME_USUARIO as vendedor_nome
            FROM PEDIDOS p
            INNER JOIN CLIENTES c ON p.ID_CLIENTE = c.ID_CLIENTE
            INNER JOIN PEDIDOS_PRODUTOS pp ON p.ID_PEDIDO = pp.ID_PEDIDO
            INNER JOIN PRODUTOS prod ON pp.ID_PROD = prod.ID_PROD
            LEFT JOIN VENDEDORES v ON prod.ID_VENDEDOR = v.ID_USUARIO
            LEFT JOIN USUARIOS u ON prod.ID_VENDEDOR = u.ID_USUARIO
            WHERE c.ID_USUARIO = ?
            ORDER BY p.DT_PEDIDO DESC, p.ID_PEDIDO DESC
        `, [userId]);

        connection.release();

        // Agrupar produtos por pedido
        const ordersMap = new Map();

        orders.forEach(order => {
            const orderId = order.ID_PEDIDO;

            if (!ordersMap.has(orderId)) {
                ordersMap.set(orderId, {
                    id: orderId,
                    date: order.DT_PEDIDO,
                    status: 'delivered', // Por enquanto, todos são considerados entregues
                    products: []
                });
            }

            ordersMap.get(orderId).products.push({
                id: order.ID_PROD,
                name: order.NOME_PROD,
                price: parseFloat(order.VALOR_UNITARIO),
                image: order.IMAGEM_URL || (order.IMAGEM_BASE64 ? `data:image/jpeg;base64,${order.IMAGEM_BASE64}` : '/imagens/produto-padrao.jpg'),
                seller: order.NOME_LOJA || order.vendedor_nome || 'Vendedor'
            });
        });

        const userOrders = Array.from(ordersMap.values());

        res.status(200).json({
            success: true,
            orders: userOrders
        });

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
});

// Rota para obter dados de vendas do vendedor
router.get('/seller-sales/:sellerId', async (req, res) => {
    const { sellerId } = req.params;
    let connection;

    try {
        connection = await pool.getConnection();

        // Buscar vendas reais através das tabelas PEDIDOS e PEDIDOS_PRODUTOS
        const [sales] = await connection.execute(`
            SELECT
                p.VALOR_UNITARIO,
                pp.ID_PROD,
                COUNT(pp.ID_PROD) as quantidade_vendida
            FROM PEDIDOS ped
            INNER JOIN PEDIDOS_PRODUTOS pp ON ped.ID_PEDIDO = pp.ID_PEDIDO
            INNER JOIN PRODUTOS p ON pp.ID_PROD = p.ID_PROD
            WHERE p.ID_VENDEDOR = ?
            GROUP BY pp.ID_PROD, p.VALOR_UNITARIO
        `, [sellerId]);

        let totalSold = 0;
        let availableForWithdrawal = 0;
        let totalProductsSold = 0;

        // Calcular totais baseados em vendas reais
        sales.forEach(sale => {
            const price = parseFloat(sale.VALOR_UNITARIO);
            const quantity = parseInt(sale.quantidade_vendida);
            const saleValue = price * quantity;

            totalSold += saleValue;
            totalProductsSold += quantity;

            // Calcular valor após desconto das taxas
            const tax = calculateTax(price);
            const netValue = saleValue * (1 - tax);
            availableForWithdrawal += netValue;
        });

        res.json({
            success: true,
            data: {
                totalSold: totalSold.toFixed(2),
                availableForWithdrawal: availableForWithdrawal.toFixed(2),
                totalProductsSold: totalProductsSold,
                taxInfo: {
                    upTo74_99: '25%',
                    from75To99_99: '15%',
                    above100: '12%'
                }
            }
        });

    } catch (error) {
        console.error('Erro ao buscar dados de vendas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;