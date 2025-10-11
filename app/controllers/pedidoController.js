const moment = require('moment');
const pedidoModel = require('../models/pedidoModel');

module.exports = {
    gravarPedido: async (req, res) => {
        try {
            const carrinho = req.session.carrinho || [];
            
            if (carrinho.length === 0) {
                return res.redirect("/carrinho-vazio");
            }

            const camposJsonPedido = {
                data: moment().format("YYYY-MM-DD HH:mm:ss"),
                usuario_id_usuario: req.session.userId,
                status_pedido: 1,
                status_pagamento: req.query.status,
                id_pagamento: req.query.payment_id
            };

            const create = await pedidoModel.createPedido(camposJsonPedido);
            
            // Usar Promise.all para melhor performance
            await Promise.all(carrinho.map(element => {
                const camposJsonItemPedido = {
                    pedido_id_pedido: create.insertId,
                    hq_id_hq: element.codproduto,
                    quantidade: element.qtde
                };
                return pedidoModel.createItemPedido(camposJsonItemPedido);
            }));

            req.session.carrinho = [];
            res.redirect("/");
        } catch (error) {
            console.error('Erro ao gravar pedido:', error);
            res.status(500).redirect("/erro");
        }
    }
};