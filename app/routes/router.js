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

router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro", )
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

module.exports = router;
