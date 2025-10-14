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

// Favicon
app.get('/favicon.ico', (req, res) => res.status(204));

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
const adminRoutes = require("./app/routes/api/adminRoutes");
const mainRoutes = require("./app/routes/router");

// Disponibilizar pool para as rotas admin
app.locals.pool = pool;

// Configura rotas
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api/admin", adminRoutes);
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

// Rotas para arquivos JS
app.get('/js/perfil.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'app', 'public', 'js', 'perfil.js'));
});

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

// Rota temporária para seller-profile
app.get('/api/seller_profile', async (req, res) => {
    try {
        const sellerId = req.query.id_vendedor;
        const [sellers] = await pool.execute(
            `SELECT v.*, u.NOME_USUARIO, u.EMAIL_USUARIO, c.CPF_CLIENTE 
             FROM VENDEDORES v 
             LEFT JOIN USUARIOS u ON v.ID_USUARIO = u.ID_USUARIO 
             LEFT JOIN CLIENTES c ON v.ID_USUARIO = c.ID_USUARIO 
             WHERE v.ID_USUARIO = ?`,
            [sellerId]
        );
        
        if (sellers.length > 0) {
            res.json({ success: true, seller: sellers[0] });
        } else {
            res.status(404).json({ success: false, message: 'Vendedor não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar vendedor:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Rota para buscar usuário por ID
app.get('/api/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const [users] = await pool.execute(
            `SELECT * FROM USUARIOS WHERE ID_USUARIO = ?`,
            [userId]
        );
        
        if (users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Rota temporária para buscar usuário
app.get('/api/buscar_usuario', async (req, res) => {
    try {
        const userId = req.query.id;
        const [users] = await pool.execute(
            `SELECT * FROM USUARIOS WHERE ID_USUARIO = ?`,
            [userId]
        );
        
        if (users.length > 0) {
            res.json({ success: true, user: users[0] });
        } else {
            res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

// Rota temporária para produtos por vendedor
app.get('/api/products', async (req, res) => {
    try {
        const sellerId = req.query.seller_id;
        let query = 'SELECT * FROM PRODUTOS';
        let params = [];
        
        if (sellerId) {
            query += ' WHERE ID_VENDEDOR = ?';
            params.push(sellerId);
        }
        
        query += ' ORDER BY ID_PROD DESC';
        
        const [products] = await pool.execute(query, params);
        res.json({ success: true, products });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
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
                NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO || '00000000000', hashedPassword, TIPO_USUARIO,
                LOGRADOURO_USUARIO || 'N/A', BAIRRO_USUARIO || 'N/A', CIDADE_USUARIO || 'N/A', 
                UF_USUARIO || 'SP', CEP_USUARIO || '00000000', DT_NASC_USUARIO || '1990-01-01'
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

// Atualizar dados do usuário
app.put('/api/admin/user-details', async (req, res) => {
    try {
        const { id, nome, email, celular, data_nascimento, cep, logradouro, bairro, cidade, uf } = req.body;
        
        const updateFields = [];
        const values = [];
        
        if (nome) { updateFields.push('NOME_USUARIO = ?'); values.push(nome); }
        if (email) { updateFields.push('EMAIL_USUARIO = ?'); values.push(email); }
        if (celular) { updateFields.push('CELULAR_USUARIO = ?'); values.push(celular); }
        if (data_nascimento) { updateFields.push('DT_NASC_USUARIO = ?'); values.push(data_nascimento); }
        if (cep) { updateFields.push('CEP_USUARIO = ?'); values.push(cep); }
        if (logradouro) { updateFields.push('LOGRADOURO_USUARIO = ?'); values.push(logradouro); }
        if (bairro) { updateFields.push('BAIRRO_USUARIO = ?'); values.push(bairro); }
        if (cidade) { updateFields.push('CIDADE_USUARIO = ?'); values.push(cidade); }
        if (uf) { updateFields.push('UF_USUARIO = ?'); values.push(uf); }
        
        values.push(id);
        
        await pool.execute(
            `UPDATE USUARIOS SET ${updateFields.join(', ')} WHERE ID_USUARIO = ?`,
            values
        );
        
        res.json({ success: true, message: 'Dados atualizados com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});



// Start server
app.listen(port, () => {
    console.log(` Servidor rodando na porta ${port}`);
    console.log(` http://localhost:${port}`);
    console.log(` NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});