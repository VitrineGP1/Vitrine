function validateForm(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário
    let valid = true;
    const firstname = document.getElementById("firstname");
    const lastname = document.getElementById("lastname");
    const email = document.getElementById("email");
    const number = document.getElementById("number");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const gender = document.querySelector('input[name="gender"]:checked');
    
document.querySelectorAll('.error').forEach(e => e.style.display = 'none'); // Reseta as mensagens de erro
 
    // Validação de nome
    if (firstname.value === "") {
        document.getElementById("firstname-error").style.display = "block";
        valid = false;
    }
 
    // Validação de sobrenome
    if (lastname.value === "") {
        document.getElementById("lastname-error").style.display = "block";
        valid = false;
    }
 
    // Validação de e-mail
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value)) {
        document.getElementById("email-error").style.display = "block";
        valid = false;
    }
 
    // Validação de celular (para 9 dígitos)
    const numberPattern = /^\d{2}\s\d{5}-\d{4}$/; // Regex atualizado para celular
    if (!numberPattern.test(number.value)) {
        document.getElementById("number-error").style.display = "block";
        valid = false;
    }
 
    // Validação de senha
    if (password.value.length < 6) {
        document.getElementById("password-error").style.display = "block";
        valid = false;
    }
 
    // Verificação de confirmação de senha
    if (password.value !== confirmPassword.value) {
        document.getElementById("confirmPassword-error").style.display = "block";
        valid = false;
    }
 
    // Validação de gênero
    if (!gender) {
        document.getElementById("gender-error").style.display = "block";
        valid = false;
    }
 
    if (valid) {
        // Limpar os campos do formulário se estiver válido
        document.querySelector("form").reset();
    }
 
    return valid; // Retorna verdadeiro ou falso
}
 
function checkForm() {
    const submitButton = document.getElementById("submitBtn");
    if (validateForm(event)) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}
 
window.onload = function () {
    const form = document.querySelector("form");
    form.addEventListener("submit", validateForm);
 
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
        input.addEventListener("input", checkForm);
    });
};