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
        
        // Por enquanto, vamos simular vendas baseadas nos produtos do vendedor
        // Em um sistema real, você teria uma tabela de PEDIDOS ou VENDAS
        const [products] = await connection.execute(
            'SELECT VALOR_UNITARIO FROM PRODUTOS WHERE ID_VENDEDOR = ?',
            [sellerId]
        );
        
        let totalSold = 0;
        let availableForWithdrawal = 0;
        
        // Simular algumas vendas (em um sistema real, isso viria da tabela de pedidos)
        products.forEach(product => {
            const price = parseFloat(product.VALOR_UNITARIO);
            // Simular que cada produto foi vendido 2 vezes (você pode ajustar isso)
            const soldQuantity = 2;
            const saleValue = price * soldQuantity;
            
            totalSold += saleValue;
            
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