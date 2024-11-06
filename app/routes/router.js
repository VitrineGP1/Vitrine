var express = require("express");
var router = express.Router();


router.get("/", function (req, res) {
    res.render("pages/home", )
});

router.get("/home-perfil", function (req, res) {
    res.render("pages/home-perfil", )
});

router.get("/carrinho", function (req, res) {
    res.render("pages/carrinho", )
});

router.get("/login", function (req, res) {
    res.render("pages/login", )
});

router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro", )
});

router.get("/perfil", function (req, res) {
    res.render("pages/perfil", )
});
module.exports = router;
