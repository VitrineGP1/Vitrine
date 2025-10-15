require('dotenv').config();
const mysql = require('mysql2/promise');

async function testCreateProduct() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('=== TESTE DE CRIAÇÃO DE PRODUTO ===');
        
        // Dados de teste
        const productData = {
            NOME_PROD: 'Produto Teste',
            DESCRICAO_PROD: 'Descrição teste',
            VALOR_UNITARIO: 50.00,
            ID_CATEGORIA: 3,
            ID_VENDEDOR: 1,
            SUBCATEGORIA: 'blusa',
            TAMANHO: 'M',
            QUANTIDADE: 5,
            BUSTO_P: '80-84',
            COMP_P: '30',
            BUSTO_M: '86-90',
            COMP_M: '32',
            BUSTO_G: '92-96',
            COMP_G: '34'
        };
        
        console.log('Dados do produto:', productData);
        
        // Tentar inserir
        const [result] = await connection.execute(
            `INSERT INTO PRODUTOS (NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, ID_CATEGORIA, ID_VENDEDOR,
                                   SUBCATEGORIA, TAMANHO, QUANTIDADE, BUSTO_P, COMP_P, BUSTO_M, COMP_M, BUSTO_G, COMP_G)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                productData.NOME_PROD,
                productData.DESCRICAO_PROD,
                productData.VALOR_UNITARIO,
                productData.ID_CATEGORIA,
                productData.ID_VENDEDOR,
                productData.SUBCATEGORIA,
                productData.TAMANHO,
                productData.QUANTIDADE,
                productData.BUSTO_P,
                productData.COMP_P,
                productData.BUSTO_M,
                productData.COMP_M,
                productData.BUSTO_G,
                productData.COMP_G
            ]
        );
        
        console.log('✅ PRODUTO CRIADO COM SUCESSO!');
        console.log('ID do produto:', result.insertId);
        
        // Verificar se foi inserido
        const [rows] = await connection.execute('SELECT * FROM PRODUTOS WHERE ID_PROD = ?', [result.insertId]);
        console.log('Produto inserido:', rows[0]);
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ ERRO AO CRIAR PRODUTO:', error.message);
        console.error('Stack:', error.stack);
    }
}

testCreateProduct();