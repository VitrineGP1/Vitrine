require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixCategorias() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('=== VERIFICANDO CATEGORIAS ===');
        
        // Verificar categorias existentes
        const [rows] = await connection.execute('SELECT * FROM CATEGORIAS');
        console.log('Categorias existentes:');
        rows.forEach(cat => {
            console.log(`  - ID: ${cat.ID_CATEGORIA}, Nome: ${cat.NOME_CATEGORIA}`);
        });
        
        if (rows.length === 0) {
            console.log('\n🔄 Inserindo categorias básicas...');
            
            const categorias = [
                'Artesanato',
                'Decoração', 
                'Roupas',
                'Acessórios'
            ];
            
            for (const categoria of categorias) {
                await connection.execute(
                    'INSERT INTO CATEGORIAS (NOME_CATEGORIA) VALUES (?)',
                    [categoria]
                );
                console.log(`✅ Categoria "${categoria}" inserida`);
            }
            
            // Verificar novamente
            const [newRows] = await connection.execute('SELECT * FROM CATEGORIAS');
            console.log('\nCategorias após inserção:');
            newRows.forEach(cat => {
                console.log(`  - ID: ${cat.ID_CATEGORIA}, Nome: ${cat.NOME_CATEGORIA}`);
            });
        }
        
        // Agora testar criação de produto
        console.log('\n=== TESTANDO CRIAÇÃO DE PRODUTO ===');
        
        const [result] = await connection.execute(
            `INSERT INTO PRODUTOS (NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, ID_CATEGORIA, ID_VENDEDOR,
                                   SUBCATEGORIA, TAMANHO, QUANTIDADE, BUSTO_P, COMP_P, BUSTO_M, COMP_M, BUSTO_G, COMP_G)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'Produto Teste',
                'Descrição teste',
                50.00,
                3, // Roupas
                1, // ID_VENDEDOR (assumindo que existe)
                'blusa',
                'M',
                5,
                '80-84',
                '30',
                '86-90',
                '32',
                '92-96',
                '34'
            ]
        );
        
        console.log('✅ PRODUTO CRIADO COM SUCESSO!');
        console.log('ID do produto:', result.insertId);
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ ERRO:', error.message);
        console.error('Stack:', error.stack);
    }
}

fixCategorias();