require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('=== CRIANDO USUÁRIO ADMIN ===');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Inserir usuário admin
        const [userResult] = await connection.execute(
            `INSERT INTO USUARIOS (NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Administrador', 'admin@vitrine.com', hashedPassword, '11888888888', 'Rua Admin, 1', 'Centro', 'São Paulo', 'SP', '01000000', '1985-01-01', 'A']
        );
        
        const adminUserId = userResult.insertId;
        console.log(`✅ Usuário admin criado com ID: ${adminUserId}`);
        
        // Inserir na tabela ADMINISTRADORES
        await connection.execute(
            `INSERT INTO ADMINISTRADORES (ID_USUARIO, CPF_ADM)
             VALUES (?, ?)`,
            [adminUserId, '98765432100']
        );
        
        console.log('✅ Admin inserido na tabela ADMINISTRADORES');
        console.log('\n📋 CREDENCIAIS DO ADMIN:');
        console.log('Email: admin@vitrine.com');
        console.log('Senha: admin123');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ ERRO:', error.message);
    }
}

createAdmin();