function validateEmail() {
    const emailInput = document.getElementById("email");
    const message = document.getElementById("message");
    const email = emailInput.value;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailPattern.test(email)) {
        message.innerText = "Inscrição realizada com sucesso.";
        message.style.color = "green";
        emailInput.value = ""; 
    } else {
        message.innerText = "Por favor, insira um e-mail válido.";
        message.style.color = "red";
    }
}
