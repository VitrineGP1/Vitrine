require('dotenv').config();

const express = require("express");
const app = express();
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const port = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const dbConfig = {
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_BDD,
    port: process.env.MYSQL_ADDON_PORT ? parseInt(process.env.MYSQL_ADDON_PORT) : 3306,
    connectionLimit: 3 // Mantido em 3
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Pool de conexões MySQL criado com sucesso.');

    // MODIFICAÇÃO AQUI: Não encerra o processo se a conexão inicial falhar.
    // Apenas loga o erro e permite que o servidor tente iniciar.
    // As requisições individuais ainda podem falhar se não houver conexões disponíveis.
    pool.getConnection()
        .then(connection => {
            console.log('Conectado ao banco de dados MySQL via Node.js!');
            connection.release();
        })
        .catch(err => {
            console.error('AVISO: Falha na conexão inicial com o banco de dados:', err.message);
            // Removido process.exit(1) para permitir que o servidor tente iniciar mesmo com problemas de DB
        });
} catch (err) {
    console.error('ERRO CRÍTICO: Falha ao criar o pool de conexões MySQL:', err.message);
    process.exit(1); // Este exit é mantido se o pool não puder nem ser criado (erro de config grave)
}

app.use(express.static(path.join(__dirname, 'app', 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'app', 'views'));

var rotas = require("./app/routes/router");
app.use("/", rotas);

app.post('/api/cadastrar_usuario', async (req, res) => {
    const {
        NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
        LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
        CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
    } = req.body;

    if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
        return res.status(400).json({ success: false, message: "Nome, email e senha são obrigatórios." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
        return res.status(400).json({ success: false, message: "Formato de email inválido." });
    }

    let connection; // Declare connection outside try to ensure it's accessible in finally
    try {
        const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 10);
        connection = await pool.getConnection(); // Get connection here

        const [rows] = await connection.execute(
            `INSERT INTO USUARIOS (
                NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, CELULAR_USUARIO,
                LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                NOME_USUARIO, EMAIL_USUARIO, hashedPassword, CELULAR_USUARIO,
                LOGRADOURO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO,
                CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO
            ]
        );
        res.status(201).json({ success: true, message: "Usuário cadastrado com sucesso!" });

    } catch (error) {
        console.error('Erro no cadastro de usuário (Node.js API):', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "Este email já está cadastrado." });
        }
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});

app.post('/api/login_usuario', async (req, res) => {
    const { EMAIL_USUARIO, SENHA_USUARIO } = req.body;

    if (!EMAIL_USUARIO || !SENHA_USUARIO) {
        return res.status(400).json({ success: false, message: "Email e senha são obrigatórios." });
    }

    let connection; // Declare connection outside try to ensure it's accessible in finally
    try {
        connection = await pool.getConnection(); // Get connection here
        const [rows] = await connection.execute(
            `SELECT ID_USUARIO, NOME_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO
             FROM USUARIOS WHERE EMAIL_USUARIO = ?`,
            [EMAIL_USUARIO]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "Credenciais inválidas." });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(SENHA_USUARIO, user.SENHA_USUARIO);

        if (passwordMatch) {
            res.status(200).json({
                success: true,
                message: "Login bem-sucedido!",
                user: {
                    id: user.ID_USUARIO,
                    name: user.NOME_USUARIO,
                    email: user.EMAIL_USUARIO,
                    type: user.TIPO_USUARIO
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Credenciais inválidas." });
        }

    } catch (error) {
        console.error('Erro no login de usuário (Node.js API):', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});

app.get('/api/buscar_usuario', async (req, res) => {
    const userId = req.query.id_usuario;

    if (!userId) {
        return res.status(400).json({ success: false, message: "ID do usuário não fornecido." });
    }

    let connection; // Declare connection outside try to ensure it's accessible in finally
    try {
        connection = await pool.getConnection(); // Get connection here
        const [rows] = await connection.execute(
            `SELECT NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
                    BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
                    DT_NASC_USUARIO, TIPO_USUARIO, IMAGEM_PERFIL_BASE64
             FROM USUARIOS WHERE ID_USUARIO = ?`,
            [userId]
        );

        if (rows.length > 0) {
            res.status(200).json({ success: true, message: "Dados do usuário encontrados.", user: rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Usuário não encontrado." });
        }

    } catch (error) {
        console.error('Erro ao buscar usuário (Node.js API):', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});

app.put('/api/atualizar_usuario', async (req, res) => {
    const {
        id_usuario,
        NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
        BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
        DT_NASC_USUARIO, TIPO_USUARIO, NOVA_SENHA_USUARIO, CONFIRM_SENHA_USUARIO,
        IMAGEM_PERFIL_BASE64
    } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ success: false, message: "ID do usuário é obrigatório para atualização." });
    }
    if (!NOME_USUARIO || !EMAIL_USUARIO) {
        return res.status(400).json({ success: false, message: "Nome e Email são campos obrigatórios." });
    }
    if (NOVA_SENHA_USUARIO && NOVA_SENHA_USUARIO !== CONFIRM_SENHA_USUARIO) {
        return res.status(400).json({ success: false, message: "As novas senhas não coincidem." });
    }

    let updateSql = `UPDATE USUARIOS SET
                        NOME_USUARIO = ?, EMAIL_USUARIO = ?, CELULAR_USUARIO = ?,
                        LOGRADOURO_USUARIO = ?, BAIRRO_USUARIO = ?, CIDADE_USUARIO = ?,
                        UF_USUARIO = ?, CEP_USUARIO = ?, DT_NASC_USUARIO = ?, TIPO_USUARIO = ?`;
    let updateValues = [
        NOME_USUARIO, EMAIL_USUARIO, CELULAR_USUARIO, LOGRADOURO_USUARIO,
        BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO,
        DT_NASC_USUARIO, TIPO_USUARIO
    ];

    if (NOVA_SENHA_USUARIO) {
        const hashedNewPassword = await bcrypt.hash(NOVA_SENHA_USUARIO, 10);
        updateSql += `, SENHA_USUARIO = ?`;
        updateValues.push(hashedNewPassword);
    }

    if (IMAGEM_PERFIL_BASE64 !== undefined) {
        updateSql += `, IMAGEM_PERFIL_BASE64 = ?`;
        updateValues.push(IMAGEM_PERFIL_BASE64);
    }

    updateSql += ` WHERE ID_USUARIO = ?`;
    updateValues.push(id_usuario);

    let connection; // Declare connection outside try to ensure it's accessible in finally
    try {
        connection = await pool.getConnection(); // Get connection here
        const [result] = await connection.execute(updateSql, updateValues);

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: "Perfil atualizado com sucesso!" });
        } else {
            res.status(200).json({ success: false, message: "Nenhuma alteração detectada ou usuário não encontrado." });
        }

    } catch (error) {
        console.error('Erro ao atualizar perfil (Node.js API):', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "Este email já está cadastrado para outro usuário." });
        }
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});

app.get('/produtos', async (req, res) => {
    let connection; // Declare connection outside try to ensure it's accessible in finally
    try {
        connection = await pool.getConnection(); // Get connection here
        const [produtos] = await connection.execute('SELECT id, nome, preco, imagem_url FROM produtos');
        res.render('produtos', { produtos: produtos });
    } catch (error) {
        console.error('Erro ao buscar produtos para EJS:', error);
        res.status(500).send('Erro ao carregar a página de produtos.');
    } finally {
        if (connection) connection.release(); // Ensure connection is released
    }
});

app.listen(port, () => {
    console.log(`Servidor Node.js ouvindo na porta ${port}\nhttp://localhost:${port}`);
});