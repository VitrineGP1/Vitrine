gravarPedido: async (req, res) => {
    try {
        const carrinho = req.session.carrinho;
        const camposJsonPedido = {
            data: moment().format("YYYY-MM-DD HH:mm:ss"),
            usuario_id_usuario: req.session.autenticado.id,
            status_pedido: 1,
            status_pagamento: req.query.status,
            id_pagamento: req.query.payment_id
        }
        var create = await pedidoModel.createPedido(camposJsonPedido);
        carrinho.forEach(async element => {
            camposJsonItemPedido = {
                pedido_id_pedido: create.insertId,
                hq_id_hq: element.codproduto,
                quantidade: element.qtde
            }
            await pedidoModel.createItemPedido(camposJsonItemPedido);
        });
        req.session.carrinho = [];
        res.redirect("/");
    } catch (error) {
        console.error(e);
    }
}