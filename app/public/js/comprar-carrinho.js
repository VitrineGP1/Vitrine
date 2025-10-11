document.addEventListener("DOMContentLoaded", function (e) {
    const mercadoPago = new MercadoPago('APP_USR-eafb8069-68db-4706-9017-c1f656344c93', {
        locale: 'pt-BR' 
    });

    document.getElementById("checkout-btn").addEventListener("click", function () {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }

        $('#checkout-btn').attr("disabled", true);

        const extractedData = cart.map(item => {
            return {
                unit_price: Number(item.price.toFixed(2)),
                description: item.name,
                quantity: Number(item.quantity),
                currency_id: "BRL"
            };
        });

        updatePaymentSummary(cart);

        const orderData = { items: extractedData };

        fetch("/create-preference", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        })
        .then(async function (response) {
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
                console.error('Erro do servidor:', errorData);
                throw new Error(`Erro ${response.status}: ${errorData.error || errorData.message || 'Erro no servidor'}`);
            }
            return response.json();
        })
        .then(function (preference) {
            console.log('Preferência recebida:', preference);
            
            if (!preference.id) {
                throw new Error('ID da preferência não recebido');
            }
            
            createCheckoutButton(preference.id);
            
            $(".shopping-cart").fadeOut(500);
            setTimeout(() => {
                $(".container_payment").show(500).fadeIn();
            }, 500);
        })
        .catch(function (error) {
            console.error("Erro completo:", error);
            alert(`Erro: ${error.message}`);
            $('#checkout-btn').attr("disabled", false);
        });
    });

    
    function createCheckoutButton(preferenceId) {
        const bricksBuilder = mercadoPago.bricks();

        const renderComponent = async (bricksBuilder) => {
            // Limpar container antes de criar novo
            const container = document.getElementById('button-checkout');
            if (container) container.innerHTML = '';
            
            try {
                await bricksBuilder.create(
                    'wallet',
                    'button-checkout',
                    {
                        initialization: {
                            preferenceId: preferenceId
                        },
                        callbacks: {
                            onError: (error) => {
                                console.error("Erro no checkout:", error);
                                alert("Erro no processamento do pagamento");
                            },
                            onReady: () => {
                                console.log("Checkout pronto");
                            }
                        }
                    }
                );
            } catch (error) {
                console.error('Erro ao criar botão:', error);
            }
        };
        renderComponent(bricksBuilder);
    }

    document.getElementById("go-back").addEventListener("click", function () {
        $(".container_payment").fadeOut(500);
        setTimeout(() => {
            $(".shopping-cart").show(500).fadeIn();
        }, 500);
        $('#checkout-btn').attr("disabled", false);
    });

    function updatePaymentSummary(cart) {
        const paymentSummary = document.getElementById("payment-summary");
        let total = 0;
        
        let summaryHTML = '';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            summaryHTML += `
                <div class="item">
                    <span class="price">R$ ${itemTotal.toFixed(2).replace('.', ',')}</span>
                    <p class="item-name">${item.name}
                        (<span>${item.quantity}</span> X R$ ${item.price.toFixed(2).replace('.', ',')})
                    </p>
                </div>
            `;
        });
        
        summaryHTML += `
            <div class="total">
                <span class="summary-total">Total: R$ ${total.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
        
        paymentSummary.innerHTML = summaryHTML;
    }
});