require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function addBuyers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('=== ADICIONANDO COMPRADORES ===');
        
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        // Comprador 1
        const [buyer1] = await connection.execute(
            `INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['João Silva', 'joao@teste.com', hashedPassword, '11999999999', 'Rua das Flores, 123', 'Centro', 'São Paulo', 'SP', '01234567', '1990-05-15', 'C']
        );
        
        await connection.execute(
            `INSERT INTO CLIENTES (ID_USUARIO, CPF_CLIENTE) VALUES (?, ?)`,
            [buyer1.insertId, '12345678901']
        );
        
        console.log(`✅ Comprador João criado com ID: ${buyer1.insertId}`);
        
        // Comprador 2
        const [buyer2] = await connection.execute(
            `INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Maria Santos', 'maria@teste.com', hashedPassword, '11888888888', 'Av. Paulista, 456', 'Bela Vista', 'São Paulo', 'SP', '01310100', '1985-12-20', 'C']
        );
        
        await connection.execute(
            `INSERT INTO CLIENTES (ID_USUARIO, CPF_CLIENTE) VALUES (?, ?)`,
            [buyer2.insertId, '98765432109']
        );
        
        console.log(`✅ Comprador Maria criado com ID: ${buyer2.insertId}`);
        
        // Comprador 3
        const [buyer3] = await connection.execute(
            `INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Ana Costa', 'ana@teste.com', hashedPassword, '11777777777', 'Rua Augusta, 789', 'Consolação', 'São Paulo', 'SP', '01305000', '1992-08-10', 'C']
        );
        
        await connection.execute(
            `INSERT INTO CLIENTES (ID_USUARIO, CPF_CLIENTE) VALUES (?, ?)`,
            [buyer3.insertId, '11122233344']
        );
        
        console.log(`✅ Comprador Ana criado com ID: ${buyer3.insertId}`);
        
        console.log('\n📋 CREDENCIAIS DOS COMPRADORES:');
        console.log('João Silva - Email: joao@teste.com | Senha: 123456');
        console.log('Maria Santos - Email: maria@teste.com | Senha: 123456');
        console.log('Ana Costa - Email: ana@teste.com | Senha: 123456');
        
        await connection.end();
        console.log('✅ Compradores adicionados com sucesso!');
        
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('⚠️ Usuários já existem no banco');
        } else {
            console.error('❌ ERRO:', error.message);
        }
    }
}

addBuyers();