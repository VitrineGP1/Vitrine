module.exports = {
    gravarPedido: async (req, res) => {
        try {
            console.log('Processando pedido...');
            
            // Limpar carrinho da sessão
            if (req.session.carrinho) {
                req.session.carrinho = [];
            }
            
            // Redirecionar para página de sucesso
            res.redirect("/");
        } catch (error) {
            console.error('Erro ao processar pedido:', error);
            res.redirect("/");
        }
    }
};