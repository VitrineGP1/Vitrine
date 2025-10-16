const express = require('express');
const router = express.Router();
const pool = require('../../../config/pool-conexoes');

// Função para calcular taxa baseada no valor
function calculateTax(value) {
    if (value <= 74.99) return 0.25; // 25%
    if (value <= 99.99) return 0.15; // 15%
    return 0.12; // 12%
}

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