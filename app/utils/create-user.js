require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUser() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('=== VERIFICANDO USUÁRIOS ===');
        
        // Verificar usuários existentes
        const [users] = await connection.execute('SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, TIPO_USUARIO FROM USUARIOS');
        console.log('Usuários existentes:');
        users.forEach(user => {
            console.log(`  - ID: ${user.ID_USUARIO}, Nome: ${user.NOME_USUARIO}, Email: ${user.EMAIL_USUARIO}, Tipo: ${user.TIPO_USUARIO}`);
        });
        
        if (users.length === 0) {
            console.log('\n🔄 Criando usuário vendedor de teste...');
            
            const hashedPassword = await bcrypt.hash('123456', 10);
            
            // Inserir usuário
            const [userResult] = await connection.execute(
                `INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                ['Vendedor Teste', 'vendedor@teste.com', hashedPassword, '11999999999', 'Rua Teste, 123', 'Centro', 'São Paulo', 'SP', '01234567', '1990-01-01', 'S']
            );
            
            const userId = userResult.insertId;
            console.log(`✅ Usuário criado com ID: ${userId}`);
            
            // Inserir na tabela VENDEDORES
            await connection.execute(
                `INSERT INTO VENDEDORES (ID_USUARIO, TIPO_PESSOA, DIGITO_PESSOA)
                 VALUES (?, ?, ?)`,
                [userId, 'PF', '12345678901']
            );
            
            console.log('✅ Vendedor criado na tabela VENDEDORES');
        }
        
        // Agora testar criação de produto com o primeiro usuário
        const [firstUser] = await connection.execute('SELECT ID_USUARIO FROM USUARIOS LIMIT 1');
        const vendedorId = firstUser[0].ID_USUARIO;
        
        console.log(`\n=== TESTANDO CRIAÇÃO DE PRODUTO COM VENDEDOR ID: ${vendedorId} ===`);
        
        const [result] = await connection.execute(
            `INSERT INTO PRODUTOS (NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, ID_CATEGORIA, ID_VENDEDOR,
                                   SUBCATEGORIA, TAMANHO, QUANTIDADE, BUSTO_P, COMP_P, BUSTO_M, COMP_M, BUSTO_G, COMP_G)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                'Blusa Teste',
                'Blusa de teste para verificar funcionamento',
                45.00,
                3, // Roupas
                vendedorId,
                'blusa',
                'M',
                10,
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

createTestUser();