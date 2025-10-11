require('dotenv').config();

const express = require("express");
const session = require('express-session');
const app = express();
const path = require('path');

const port = process.env.PORT || 3000;

console.log(' Iniciando servidor...');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions - Para produção, use Redis ou outro store persistente
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Mude para true em produção com HTTPS
        maxAge: 24 * 60 * 60 * 1000
    }
    // Para produção, adicione: store: new RedisStore({ /* config */ })
}));

// Arquivos estáticos e EJS
app.use(express.static(path.join(__dirname, 'app', 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'app', 'views'));

// Importa o pool
console.log(' Conectando ao banco...');
const pool = require("./config/pool-conexoes");

// Importa rotas
console.log(' Carregando rotas...');
const authRoutes = require("./app/routes/authRoutes")(pool);
const profileRoutes = require("./app/routes/profileRoutes")(pool);
const mainRoutes = require("./app/routes/router");

// Configura rotas
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/", mainRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando',
        session: req.session
    });
});

// Rota de teste do banco
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT 1 + 1 as result');
        res.json({ success: true, db: 'Conectado', result: rows[0].result });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Rotas para o frontend React
app.get('/cadvendedor.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'public', 'js', 'cadvendedor.js'));
});

// Rota de teste da API
app.get('/api/teste', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota de cadastro de vendedor (específica para vendedores)
// Rota única para cadastro de usuários (cliente ou vendedor)
app.post('/api/cadastrar_usuario', async (req, res) => {
    try {
        console.log('📝 Recebendo cadastro de usuário:', req.body);
        
        const { 
            NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, SENHA_USUARIO,
            DT_NASC_USUARIO, TIPO_USUARIO = 'C', // Padrão é Cliente
            CEP_USUARIO, UF_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO,
            CPF_CLIENTE, TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA, DESCRICAO_NEGOCIO
        } = req.body;

        // Validações básicas
        if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({
                success: false,
                error: 'Nome, email e senha são obrigatórios'
            });
        }

        const pool = require("./config/pool-conexoes");
        const bcrypt = require('bcryptjs');

        // Verificar se email já existe
        const [existingUsers] = await pool.execute(
            'SELECT ID_USUARIO FROM USUARIOS WHERE EMAIL_USUARIO = ?',
            [EMAIL_USUARIO]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email já cadastrado'
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 12);

        // Inserir usuário na tabela USUARIOS
        const [userResult] = await pool.execute(
            `INSERT INTO USUARIOS (
                NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, SENHA_USUARIO, TIPO_USUARIO,
                LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                NOME_USUARIO, 
                EMAIL_USUARIO, 
                CELULAR_USUARIO || null, 
                hashedPassword, 
                TIPO_USUARIO, // 'C' para Cliente, 'V' para Vendedor
                LOGRADOURO_USUARIO || null, 
                BAIRRO_USUARIO || null, 
                CIDADE_USUARIO || null, 
                UF_USUARIO || null, 
                CEP_USUARIO || null, 
                DT_NASC_USUARIO || null
            ]
        );

        const userId = userResult.insertId;

        // Inserir na tabela específica baseada no tipo
        if (TIPO_USUARIO === 'C') {
            // CLIENTE - Inserir na tabela CLIENTES
            const cpf = CPF_CLIENTE || '00000000000'; // CPF temporário se não fornecido
            await pool.execute(
                'INSERT INTO CLIENTES (CPF_CLIENTE, ID_USUARIO) VALUES (?, ?)',
                [cpf, userId]
            );
            
            console.log('✅ Cliente cadastrado com sucesso:', EMAIL_USUARIO);

        } else if (TIPO_USUARIO === 'V') {
            // VENDEDOR - Inserir na tabela VENDEDORES
            const tipoPessoa = TIPO_PESSOA || 'PF';
            const digitoPessoa = DIGITO_PESSOA || '00000000000';
            
            await pool.execute(
                'INSERT INTO VENDEDORES (TIPO_PESSOA, DIGITO_PESSOA, ID_USUARIO) VALUES (?, ?, ?)',
                [tipoPessoa, digitoPessoa, userId]
            );
            
            console.log('✅ Vendedor cadastrado com sucesso:', EMAIL_USUARIO);
        }

        res.json({
            success: true,
            message: TIPO_USUARIO === 'C' ? 'Cliente cadastrado com sucesso!' : 'Vendedor cadastrado com sucesso!',
            userId: userId,
            userType: TIPO_USUARIO
        });

    } catch (error) {
        console.error('💥 Erro no cadastro:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno no cadastro: ' + error.message
        });
    }
});

// Servir arquivos estáticos do React (se necessário)
app.use(express.static(path.join(__dirname, 'app', 'public')));

// Start server
app.listen(port, () => {
    console.log(` Servidor rodando na porta ${port}`);
    console.log(` http://localhost:${port}`);
    console.log(` NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});