require('dotenv').config();

const express = require("express");
const app = express();
const path = require('path');

const port = process.env.PORT || 3001;

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));



// Pool de conexões
const pool = require('./config/pool-conexoes');

// Controllers
const UserController = require('./app/controllers/userController');
const ProductController = require('./app/controllers/productController');
const SellerController = require('./app/controllers/sellerController');
const AdminController = require('./app/controllers/adminController');

// Instanciar controllers
const userController = new UserController(pool);
const productController = new ProductController(pool);
const sellerController = new SellerController(pool);
const adminController = new AdminController(pool);

app.use(express.static(path.join(__dirname, 'app', 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'app', 'views'));

var rotas = require("./app/routes/router");
app.use("/", rotas);

// Usar as rotas de autenticação
const authRoutes = require('./app/routes/api/authRoutes')(pool);
app.use('/api', authRoutes);

// Usar as rotas de usuário
const userRoutes = require('./app/routes/api/userRoutes')(pool);
app.use('/api', userRoutes);

// Usar as rotas de vendas
const salesRoutes = require('./app/routes/api/salesRoutes');
app.use('/api', salesRoutes);

// APIs do Admin
app.get('/api/admin/users', (req, res) => adminController.getUsers(req, res));

app.delete('/api/admin/users/:id', (req, res) => adminController.deleteUser(req, res));

app.get('/api/admin/user-details/:id', (req, res) => adminController.getUserDetails(req, res));

// Rota de cadastro removida daqui - agora está apenas em authRoutes.js



app.get('/api/buscar_usuario', (req, res) => userController.getUser(req, res));

app.put('/api/atualizar_usuario', (req, res) => userController.updateUser(req, res));

app.put('/api/update-profile-image', async (req, res) => {
    const { userId, imageBase64 } = req.body;
    if (!userId || !imageBase64) {
        return res.status(400).json({ success: false, message: 'ID do usuário e imagem são obrigatórios' });
    }
    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE USUARIOS SET IMAGEM_PERFIL_BASE64 = ? WHERE ID_USUARIO = ?',
            [imageBase64, userId]
        );
        connection.release();
        res.json({ success: true, message: 'Foto de perfil atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar foto de perfil:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
});

app.post('/api/products', (req, res) => productController.createProduct(req, res));

app.get('/api/products', (req, res) => productController.getProducts(req, res));

app.put('/api/products/:id', (req, res) => productController.updateProduct(req, res));
app.delete('/api/products/:id', (req, res) => productController.deleteProduct(req, res));

app.get('/api/seller_profile', (req, res) => sellerController.getSellerProfile(req, res));
app.put('/api/seller_profile', (req, res) => sellerController.updateSellerProfile(req, res));

app.get('/api/check_users', (req, res) => userController.checkUsers(req, res));

app.get('/produtos', (req, res) => productController.renderProductsPage(req, res));

// Rota para página de vendedores do admin
app.get('/admin-vendedores', (req, res) => {
    res.render('pages/admin-vendedores');
});

// Rota para página de detalhes do produto do admin
app.get('/admin-produto-detalhes', (req, res) => {
    res.render('pages/admin-produto-detalhes');
});

// Rota para página de produtos do admin
app.get('/admin-produtos', (req, res) => {
    res.render('pages/admin-produtos');
});

// Rota para página de pedidos do comprador
app.get('/meus-pedidos', (req, res) => {
    res.render('pages/meus-pedidos');
});

app.get('/api/admin/product-details/:id', (req, res) => productController.getProductDetails(req, res));
app.delete('/api/admin/products/:id', (req, res) => adminController.deleteProduct(req, res));

// Rotas de endereços
app.get('/api/addresses/:userId', async (req, res) => {
    const { userId } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        const [user] = await connection.execute(
            'SELECT LOGRADOURO_USUARIO, NUMERO_USUARIO, BAIRRO_USUARIO, CIDADE_USUARIO, UF_USUARIO, CEP_USUARIO FROM USUARIOS WHERE ID_USUARIO = ?',
            [userId]
        );
        
        if (user.length > 0) {
            const address = {
                ID_ENDERECO: 1,
                LOGRADOURO: user[0].LOGRADOURO_USUARIO,
                NUMERO: user[0].NUMERO_USUARIO || '',
                BAIRRO: user[0].BAIRRO_USUARIO,
                CIDADE: user[0].CIDADE_USUARIO,
                UF: user[0].UF_USUARIO,
                CEP: user[0].CEP_USUARIO
            };
            res.json([address]);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        res.json([]);
    } finally {
        if (connection) connection.release();
    }
});

app.post('/api/addresses', async (req, res) => {
    const { userId, cep, logradouro, numero, bairro, cidade, uf } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.execute(
            'UPDATE USUARIOS SET CEP_USUARIO = ?, LOGRADOURO_USUARIO = ?, NUMERO_USUARIO = ?, BAIRRO_USUARIO = ?, CIDADE_USUARIO = ?, UF_USUARIO = ? WHERE ID_USUARIO = ?',
            [cep, logradouro, numero, bairro, cidade, uf, userId]
        );
        res.json({ success: true, message: 'Endereço atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar endereço:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    } finally {
        if (connection) connection.release();
    }
});

// Mercado Pago Checkout Pro
app.post('/create-preference', async (req, res) => {
    const { MercadoPagoConfig, Preference } = require('mercadopago');

    console.log('Creating Mercado Pago preference...');
    console.log('Access Token exists:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN);
    console.log('Request body:', req.body);

    try {
        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
        });
        const preference = new Preference(client);

        const { items } = req.body;

        const preferenceData = {
            items: items,
            back_urls: {
                success: `${req.protocol}://${req.get('host')}/payment/success`,
                failure: `${req.protocol}://${req.get('host')}/payment/failure`,
                pending: `${req.protocol}://${req.get('host')}/payment/pending`
            }
        };

        console.log('Preference data:', preferenceData);

        const result = await preference.create({ body: preferenceData });
        console.log('Preference created:', result.id);
        res.json({ id: result.id });
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
});



// Payment result pages
app.get('/payment/success', (req, res) => {
    res.render('pages/payment-success');
});

app.get('/payment/failure', (req, res) => {
    res.render('pages/payment-failure');
});

app.get('/payment/pending', (req, res) => {
    res.render('pages/payment-pending');
});

app.listen(port, () => {
    console.log(`Servidor Node.js ouvindo na porta ${port}\nhttp://localhost:${port}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});