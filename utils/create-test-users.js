require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('=== CRIANDO USUÁRIOS DE TESTE ===');
        
        // Criar comprador
        const hashedPasswordBuyer = await bcrypt.hash('123456', 10);
        const [buyerResult] = await connection.execute(
            `INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['João Silva', 'joao@teste.com', hashedPasswordBuyer, '11999999999', 'Rua das Flores, 123', 'Centro', 'São Paulo', 'SP', '01234567', '1990-05-15', 'C']
        );
        
        const buyerUserId = buyerResult.insertId;
        console.log(`✅ Comprador criado com ID: ${buyerUserId}`);
        
        // Inserir na tabela CLIENTES
        await connection.execute(
            `INSERT INTO CLIENTES (ID_USUARIO, CPF_CLIENTE)
             VALUES (?, ?)`,
            [buyerUserId, '12345678901']
        );
        
        console.log('✅ Cliente inserido na tabela CLIENTES');
        
        // Criar mais um comprador
        const [buyer2Result] = await connection.execute(
            `INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Maria Santos', 'maria@teste.com', hashedPasswordBuyer, '11888888888', 'Av. Paulista, 456', 'Bela Vista', 'São Paulo', 'SP', '01310100', '1985-12-20', 'C']
        );
        
        const buyer2UserId = buyer2Result.insertId;
        console.log(`✅ Comprador 2 criado com ID: ${buyer2UserId}`);
        
        // Inserir na tabela CLIENTES
        await connection.execute(
            `INSERT INTO CLIENTES (ID_USUARIO, CPF_CLIENTE)
             VALUES (?, ?)`,
            [buyer2UserId, '98765432109']
        );
        
        console.log('✅ Cliente 2 inserido na tabela CLIENTES');
        
        console.log('\n📋 CREDENCIAIS DOS COMPRADORES:');
        console.log('Comprador 1 - Email: joao@teste.com | Senha: 123456');
        console.log('Comprador 2 - Email: maria@teste.com | Senha: 123456');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ ERRO:', error.message);
    }
}

createTestUsers();