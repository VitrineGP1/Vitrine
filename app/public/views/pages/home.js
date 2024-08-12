const addToCartButtons = document.getElementsByClassName("btn");
for (var i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener("click", addProductToCart)
}

function addProductToCart(event) {
    const button = event.target
    const productInfos = button.parentElement
    const productImage = productInfos.getElementsByClassName("imagem2")[0].src
    const productTitle = productInfos.getElementsByClassName("h8")[0].innerText
    const productPrice = productInfos.getElementsByClassName("preco2")[0].innerText

    let newCartProduct = document.createElement("tr")
    newCartProduct.classList.add("cart-product")
    
    console.log(productInfos)
}

function addProductToCart(event) {
    const button = event.target
    const productInfos = button.parentElement
    const productImage3 = productInfos.getElementsByClassName("imagem3")[1]
    const productTitle3 = productInfos.getElementsByClassName("h9")[1]
    const productPrice3 = productInfos.getElementsByClassName("preco3")[1]

    let newCartProduct = document.createElement("tr")
    newCartProduct.classList.add("cart-product")
    
    console.log(productInfos)
}