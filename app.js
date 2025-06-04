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
    connectionLimit: 3
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
    console.log('Pool de conexões MySQL criado com sucesso.');

    pool.getConnection()
        .then(connection => {
            console.log('Conectado ao banco de dados MySQL via Node.js!');
            connection.release();
        })
        .catch(err => {
            console.error('AVISO: Falha na conexão inicial com o banco de dados:', err.message);
        });
} catch (err) {
    console.error('ERRO CRÍTICO: Falha ao criar o pool de conexões MySQL:', err.message);
    process.exit(1);
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
        CEP_USUARIO, DT_NASC_USUARIO, TIPO_USUARIO, // TIPO_USUARIO para determinar se é vendedor
        TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA // Novos campos para VENDEDORES
    } = req.body;

    if (!NOME_USUARIO || !EMAIL_USUARIO || !SENHA_USUARIO) {
        return res.status(400).json({ success: false, message: "Nome, email e senha são obrigatórios." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EMAIL_USUARIO)) {
        return res.status(400).json({ success: false, message: "Formato de email inválido." });
    }

    let connection;
    try {
        const hashedPassword = await bcrypt.hash(SENHA_USUARIO, 10);
        connection = await pool.getConnection();

        await connection.beginTransaction(); // Inicia uma transação

        const [userResult] = await connection.execute(
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
        const newUserId = userResult.insertId;

        // Se o tipo de usuário for 'seller', insere também na tabela VENDEDORES
        if (TIPO_USUARIO === 'seller') {
            if (!TIPO_PESSOA || !DIGITO_PESSOA || !NOME_LOJA) {
                await connection.rollback(); // Desfaz a inserção de usuário
                return res.status(400).json({ success: false, message: "Para vendedores, Tipo de Pessoa, Dígito de Pessoa e Nome da Loja são obrigatórios." });
            }
            const [sellerResult] = await connection.execute(
                `INSERT INTO VENDEDORES (ID_USUARIO, TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA)
                 VALUES (?, ?, ?, ?)`,
                [newUserId, TIPO_PESSOA, DIGITO_PESSOA, NOME_LOJA]
            );
            // O ID_VENDEDOR auto-incrementado é sellerResult.insertId, mas não precisamos dele aqui
            // pois o link é via ID_USUARIO
        }

        await connection.commit(); // Confirma a transação
        res.status(201).json({ success: true, message: "Usuário cadastrado com sucesso!" });

    } catch (error) {
        if (connection) await connection.rollback(); // Desfaz a transação em caso de erro
        console.error('Erro no cadastro de usuário (Node.js API):', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "Este email ou dígito de pessoa já está cadastrado." });
        }
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/api/login_usuario', async (req, res) => {
    const { EMAIL_USUARIO, SENHA_USUARIO } = req.body;

    if (!EMAIL_USUARIO || !SENHA_USUARIO) {
        return res.status(400).json({ success: false, message: "Email e senha são obrigatórios." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
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
            let sellerInfo = {};
            if (user.TIPO_USUARIO === 'seller') {
                // Busca o ID_VENDEDOR e NOME_LOJA da tabela VENDEDORES
                const [sellerRows] = await connection.execute(
                    `SELECT ID_VENDEDOR, NOME_LOJA, IMAGEM_PERFIL_LOJA_BASE64 FROM VENDEDORES WHERE ID_USUARIO = ?`,
                    [user.ID_USUARIO]
                );
                if (sellerRows.length > 0) {
                    sellerInfo = {
                        sellerId: sellerRows[0].ID_VENDEDOR,
                        storeName: sellerRows[0].NOME_LOJA,
                        storeProfileImage: sellerRows[0].IMAGEM_PERFIL_LOJA_BASE64
                    };
                }
            }

            res.status(200).json({
                success: true,
                message: "Login bem-sucedido!",
                user: {
                    id: user.ID_USUARIO,
                    name: user.NOME_USUARIO,
                    email: user.EMAIL_USUARIO,
                    type: user.TIPO_USUARIO,
                    ...sellerInfo // Adiciona informações do vendedor se aplicável
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Credenciais inválidas." });
        }

    } catch (error) {
        console.error('Erro no login de usuário (Node.js API):', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/buscar_usuario', async (req, res) => {
    const userId = req.query.id_usuario;

    if (!userId) {
        return res.status(400).json({ success: false, message: "ID do usuário não fornecido." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
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
        if (connection) connection.release();
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

    let connection;
    try {
        connection = await pool.getConnection();
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
        if (connection) connection.release();
    }
});

app.post('/api/products', async (req, res) => {
    const {
        NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR
    } = req.body;

    if (!NOME_PROD || !VALOR_UNITARIO || !ID_VENDEDOR) {
        return res.status(400).json({ success: false, message: "Nome, valor unitário e ID do vendedor são obrigatórios." });
    }
    if (isNaN(VALOR_UNITARIO) || parseFloat(VALOR_UNITARIO) <= 0) {
        return res.status(400).json({ success: false, message: "Valor unitário do produto inválido." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            `INSERT INTO PRODUTOS (NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR]
        );
        res.status(201).json({ success: true, message: "Produto cadastrado com sucesso!", productId: result.insertId });

    } catch (error) {
        console.error('Erro ao cadastrar produto (Node.js API):', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor ao cadastrar produto." });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/products', async (req, res) => {
    const { seller_id } = req.query;

    let sql = `SELECT ID_PROD, NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR FROM PRODUTOS`;
    let params = [];

    if (seller_id) {
        sql += ` WHERE ID_VENDEDOR = ?`;
        params.push(seller_id);
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(sql, params);
        res.status(200).json({ success: true, products: rows });

    } catch (error) {
        console.error('Erro ao buscar produtos (Node.js API):', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor ao buscar produtos." });
    } finally {
        if (connection) connection.release();
    }
});

app.put('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const {
        NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64, ID_CATEGORIA, ID_VENDEDOR
    } = req.body;

    if (!NOME_PROD || !VALOR_UNITARIO || !ID_VENDEDOR) {
        return res.status(400).json({ success: false, message: "Nome, valor unitário e ID do vendedor são obrigatórios." });
    }
    if (isNaN(VALOR_UNITARIO) || parseFloat(VALOR_UNITARIO) <= 0) {
        return res.status(400).json({ success: false, message: "Valor unitário do produto inválido." });
    }

    let updateSql = `UPDATE PRODUTOS SET NOME_PROD = ?, DESCRICAO_PROD = ?, VALOR_UNITARIO = ?, ID_CATEGORIA = ?`;
    let updateValues = [NOME_PROD, DESCRICAO_PROD, VALOR_UNITARIO, ID_CATEGORIA];

    if (IMAGEM_URL !== undefined) {
        updateSql += `, IMAGEM_URL = ?`;
        updateValues.push(IMAGEM_URL);
    }

    if (IMAGEM_BASE64 !== undefined) {
        updateSql += `, IMAGEM_BASE64 = ?`;
        updateValues.push(IMAGEM_BASE64);
    }

    updateSql += ` WHERE ID_PROD = ? AND ID_VENDEDOR = ?`;
    updateValues.push(productId, ID_VENDEDOR);

    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(updateSql, updateValues);

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: "Produto atualizado com sucesso!" });
        } else {
            res.status(404).json({ success: false, message: "Produto não encontrado ou você não tem permissão para editá-lo." });
        }

    } catch (error) {
        console.error('Erro ao atualizar produto (Node.js API):', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release();
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id;
    const { ID_VENDEDOR } = req.body;

    if (!ID_VENDEDOR) {
        return res.status(400).json({ success: false, message: "ID do vendedor é obrigatório para exclusão." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            `DELETE FROM PRODUTOS WHERE ID_PROD = ? AND ID_VENDEDOR = ?`,
            [productId, ID_VENDEDOR]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: "Produto excluído com sucesso!" });
        } else {
            res.status(404).json({ success: false, message: "Produto não encontrado ou você não tem permissão para excluí-lo." });
        }

    } catch (error) {
        console.error('Erro ao excluir produto (Node.js API):', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/seller_profile', async (req, res) => {
    const sellerId = req.query.id_vendedor;

    if (!sellerId) {
        return res.status(400).json({ success: false, message: "ID do vendedor não fornecido." });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute(
            `SELECT ID_VENDEDOR, NOME_LOJA, IMAGEM_PERFIL_LOJA_BASE64 
             FROM VENDEDORES WHERE ID_VENDEDOR = ?`,
            [sellerId]
        );
        connection.release();

        if (rows.length > 0) {
            res.status(200).json({ success: true, message: "Dados do vendedor encontrados.", seller: rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Vendedor não encontrado." });
        }

    } catch (error) {
        console.error('Erro ao buscar perfil do vendedor (Node.js API):', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release();
    }
});

app.put('/api/seller_profile', async (req, res) => {
    const { id_vendedor, NOME_LOJA, IMAGEM_PERFIL_LOJA_BASE64 } = req.body;

    if (!id_vendedor) {
        return res.status(400).json({ success: false, message: "ID do vendedor é obrigatório para atualização." });
    }

    let updateSql = `UPDATE VENDEDORES SET`;
    const updateValues = [];
    const setClauses = [];

    if (NOME_LOJA !== undefined) {
        setClauses.push(`NOME_LOJA = ?`);
        updateValues.push(NOME_LOJA);
    }
    if (IMAGEM_PERFIL_LOJA_BASE64 !== undefined) {
        setClauses.push(`IMAGEM_PERFIL_LOJA_BASE64 = ?`);
        updateValues.push(IMAGEM_PERFIL_LOJA_BASE64);
    }

    if (setClauses.length === 0) {
        return res.status(400).json({ success: false, message: "Nenhum dado para atualizar." });
    }

    updateSql += ` ${setClauses.join(', ')} WHERE ID_VENDEDOR = ?`;
    updateValues.push(id_vendedor);

    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.execute(updateSql, updateValues);
        connection.release();

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: "Perfil do vendedor atualizado com sucesso!" });
        } else {
            res.status(404).json({ success: false, message: "Vendedor não encontrado ou nenhuma alteração detectada." });
        }

    } catch (error) {
        console.error('Erro ao atualizar perfil do vendedor (Node.js API):', error);
        res.status(500).json({ success: false, message: "Erro interno do servidor." });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/produtos', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [produtos] = await connection.execute('SELECT ID_PROD, NOME_PROD, VALOR_UNITARIO, IMAGEM_URL, IMAGEM_BASE64 FROM PRODUTOS');
        res.render('produtos', { produtos: produtos });
    } catch (error) {
        console.error('Erro ao buscar produtos para EJS:', error);
        res.status(500).send('Erro ao carregar a página de produtos.');
    } finally {
        if (connection) connection.release();
    }
});

app.listen(port, () => {
    console.log(`Servidor Node.js ouvindo na porta ${port}\nhttp://localhost:${port}`);
});