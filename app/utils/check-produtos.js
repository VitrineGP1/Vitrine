require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkProdutos() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('=== ESTRUTURA DA TABELA PRODUTOS ===');
        const [columns] = await connection.execute('DESCRIBE PRODUTOS');
        
        console.log('Colunas existentes:');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type})`);
        });
        
        // Verificar se as novas colunas existem
        const requiredColumns = ['SUBCATEGORIA', 'TAMANHO', 'QUANTIDADE', 'BUSTO_P', 'COMP_P', 'BUSTO_M', 'COMP_M', 'BUSTO_G', 'COMP_G'];
        
        console.log('\n=== VERIFICAÇÃO DAS NOVAS COLUNAS ===');
        const existingColumns = columns.map(col => col.Field);
        
        requiredColumns.forEach(col => {
            if (existingColumns.includes(col)) {
                console.log(`✅ ${col} - EXISTE`);
            } else {
                console.log(`❌ ${col} - FALTANDO`);
            }
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ ERRO:', error.message);
    }
}

checkProdutos();