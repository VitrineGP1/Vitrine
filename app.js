require('dotenv').config();

const express = require("express");
const app = express();
const path = require('path');

const port = process.env.PORT || 3030;

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware
const corsMiddleware = require('./app/middleware/cors');
app.use(corsMiddleware);

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



app.listen(port, () => {
    console.log(`Servidor Node.js ouvindo na porta ${port}\nhttp://localhost:${port}`);
});