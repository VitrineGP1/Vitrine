document.addEventListener("DOMContentLoaded", function (e) {

    const mercadoPago = new MercadoPago('APP_USR-eafb8069-68db-4706-9017-c1f656344c93', {
        locale: 'pt-BR' 
    });

    document.getElementById("checkout-btn").addEventListener("click", function () {

        $('#checkout-btn').attr("disabled", true);

        const items = document.querySelectorAll(". products .item");
        const extractedData = [];

        items.forEach(item => {
            const price = parseFloat(
                item.querySelector("#summary-price").innerText.trim().replace('R$', '').trim());
            const unit_price = Number(price.toFixed(2));
            const nameElement = item.querySelector(".item-name");
            const description = nameElement.childNodes[0].nodeValue.trim();
            const quantity = Number(nameElement.querySelector("#summary-quantity").innerText.trim());
            const currency_id = "BRL";
            extractedData.push({ unit_price, description, quantity, currency_id });
        });

        orderData = { items: extractedData}

        fetch("/create-preference", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (preference) {
                createCheckoutButton(preference.id);

                $(".shopping-cart").fadeOut(500);
                setTimeout(() => {
                    $(".container_payment").show(500).fadeIn();
                }, 500);
            })
            .catch(function () {
                alert("Unexpected error");
                $('#checkout-btn').attr("disabled", false);
            });
    })

    function createCheckoutButton(preferenceId) {
        const bricksBuilder = mercadoPago.bricks();

        const renderComponent = async (bricksBuilder) => {
            if (window.checkoutButton) window.checkoutButton.unmount();
            await bricksBuilder.create(
                'wallet',
                'button-checkout',
                {
                    initialization: {
                        preferenceId: preferenceId
                    },
                    callbacks: {
                        onError: (error) => console.error(error),
                        onReady: () => { }
                    }
                }
            );
        };
        window.checkoutButton = renderComponent(bricksBuilder);
    }

    document.getElementById("go-back").addEventListener("click", function () {
        $(".container_payment").fadeOut(500);
        setTimeout(() => {
            $(".shopping-cart").show(500).fadeIn();
        }, 500);
        $('#checkout-btn').attr("disabled", false);
        });

});