var express = require("express");
var router = express.Router();


router.get("/", function (req, res) {
    res.render("pages/home", )
});

router.get("/categorias", function (req, res) {
    res.render("pages/categorias", )
});

router.get("/minhas-compras", function (req, res) {
    res.render("pages/minhas-compras", )
});

router.get("/nossas-ofertas", function (req, res) {
    res.render("pages/nossas-ofertas", )
});

router.get("/login", function (req, res) {
    res.render("pages/login1", )
});

router.get("/pagamentos", function (req, res) {
    res.render("pages/pagamentos", )
});

router.get("/compra-segura", function (req, res) {
    res.render("pages/compra-segura", )
});

router.get("/mais-vendidos", function (req, res) {
    res.render("pages/mais-vendidos", )
});

router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro", )
});
module.exports = router;
