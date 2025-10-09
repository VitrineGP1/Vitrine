var express = require("express");
var router = express.Router();


router.get("/", function (req, res) {
    res.render("pages/home", )
});

router.get("/home-perfil", function (req, res) {
    res.render("pages/home-perfil", )
});

router.get("/home-perfil-carrinho", function (req, res) {
    res.render("pages/home-perfil-carrinho", )
});

router.get("/home-carrinho", function (req, res) {
    res.render("pages/home-carrinho", )
});

router.get("/carrinho", function (req, res) {
    res.render("pages/carrinho", )
});

router.get("/carrinho-vazio", function (req, res) {
    res.render("pages/carrinho-vazio", )
});

router.get("/login", function (req, res) {
    res.render("pages/login", )
});

router.get("/cadcliente", function (req, res) {
    res.render("pages/cadcliente", )
});

router.get("/cadvendedor", function (req, res) {
    res.render("pages/cadvendedor", )
});


router.get("/perfil", function (req, res) {
    res.render("pages/perfil", )
});

router.get("/sobrenos", function (req, res) {
    res.render("pages/sobrenos", )
});

router.get("/prod1", function (req, res) {
    res.render("pages/produto1", )
});

router.get("/prod2", function (req, res) {
    res.render("pages/produto2", )
});

router.get("/prod3", function (req, res) {
    res.render("pages/produto3", )
});

router.get("/prod4", function (req, res) {
    res.render("pages/produto4", )
});

router.get("/vendedor", function (req, res) {
    res.render("pages/vendedor", )
});

router.get("/prod", function (req, res) {
    res.render("pages/produtos", )
});

router.get("/rdsenha", function (req, res) {
    res.render("pages/rdsenha", )
});

// SDK do Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { pedidoController } = require("../controllers/pedidoController");
// Adicione as credenciais
const client = new MercadoPagoConfig({
    accessToken: process.env.accessToken
});

router.post("/create-preference", function (req, res) {
    const preference = new Preference(client);
    console.log(req.body.items);
    preference.create({
        body: {
            items: req.body.items,
            back_urls: {
                "success": process.env.URL_BASE + "/feedback",
                "failure": process.env.URL_BASE + "/feedback",
                "pending": process.env.URL_BASE + "/feedback"
            },
            auto_return: "approved",
        }
    })
        .then((value) => {
            res.json(value)
        })
        .catch(console.log)
});

router.get("/feedback", function (req, res) {
    pedidoController.gravarPedido(req, res);
});

module.exports = router;