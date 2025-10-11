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

// Sessions - Store simples para desenvolvimento
const MemoryStore = require('memorystore')(session);

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
        checkPeriod: 86400000 // limpa sessões expiradas a cada 24h
    }),
    cookie: { 
        secure: false, // Mude para true em produção com HTTPS
        maxAge: 24 * 60 * 60 * 1000
    }
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

// Cadastro de usuários (cliente ou vendedor)
app.post('/api/cadastrar_usuario', async (req, res) => {
    try {
        const { 
            NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, SENHA_USUARIO,
            DT_NASC_USUARIO, TIPO_USUARIO = 'C',
            CEP_USUARIO, UF_USUARIO, LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO,
            CPF_CLIENTE, TIPO_PESSOA, DIGITO_PESSOA
        } = req.body;

        if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
            return res.status(400).json({
                success: false,
                error: 'Nome, email e senha são obrigatórios'
            });
        }

        const bcrypt = require('bcryptjs');

        // Verificar email existente
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

        const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 12);

        // Inserir usuário
        const [userResult] = await pool.execute(
            `INSERT INTO USUARIOS (
                NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, SENHA_USUARIO, TIPO_USUARIO,
                LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO, DT_NASC_USUARIO
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO || null, hashedPassword, TIPO_USUARIO,
                LOGRADOURO_USUARIO || null, BAIRRO_USUARIO || null, CIDADE_USUARIO || null, 
                UF_USUARIO || null, CEP_USUARIO || null, DT_NASC_USUARIO || null
            ]
        );

        const userId = userResult.insertId;
        const userTypeConfig = {
            'C': {
                table: 'CLIENTES',
                fields: 'CPF_CLIENTE, ID_USUARIO',
                values: [CPF_CLIENTE || '00000000000', userId],
                message: 'Cliente cadastrado com sucesso!'
            },
            'V': {
                table: 'VENDEDORES', 
                fields: 'TIPO_PESSOA, DIGITO_PESSOA, ID_USUARIO',
                values: [TIPO_PESSOA || 'PF', DIGITO_PESSOA || '00000000000', userId],
                message: 'Vendedor cadastrado com sucesso!'
            }
        };

        const config = userTypeConfig[TIPO_USUARIO];
        if (config) {
            await pool.execute(
                `INSERT INTO ${config.table} (${config.fields}) VALUES (${config.fields.split(',').map(() => '?').join(', ')})`,
                config.values
            );
        }

        res.json({
            success: true,
            message: config?.message || 'Usuário cadastrado com sucesso!',
            userId,
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



// Start server
app.listen(port, () => {
    console.log(` Servidor rodando na porta ${port}`);
    console.log(` http://localhost:${port}`);
    console.log(` NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});