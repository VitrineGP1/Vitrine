document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("signup-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Impede o envio do formulário se houver erros
        
        // Limpar mensagens de erro
        document.querySelectorAll('.error').forEach(el => el.textContent = "");

        let isValid = true;

        // Validação do Primeiro Nome
        const firstName = document.getElementById("firstname").value;
        if (!firstName) {
            document.getElementById("firstname-error").textContent = "Por favor, preencha o primeiro nome.";
            isValid = false;
        }

        // Validação do Sobrenome
        const lastName = document.getElementById("lastname").value;
        if (!lastName) {
            document.getElementById("lastname-error").textContent = "Por favor, preencha o sobrenome.";
            isValid = false;
        }

        // Validação do E-mail
        const email = document.getElementById("email").value;
        const emailPattern = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailPattern.test(email)) {
            document.getElementById("email-error").textContent = "Por favor, insira um e-mail válido.";
            isValid = false;
        }

        // Validação do Celular
        const number = document.getElementById("number").value;
        const numberPattern = /^\(\d{2}\) \d{5}-\d{4}$/;
        if (!number || !numberPattern.test(number)) {
            document.getElementById("number-error").textContent = "Por favor, insira um número de celular válido.";
            isValid = false;
        }

        // Validação da Senha
        const password = document.getElementById("password").value;
        if (password.length < 8) {
            document.getElementById("password-error").textContent = "A senha deve ter pelo menos 8 caracteres.";
            isValid = false;
        }

        // Validação de confirmação da senha
        const confirmPassword = document.getElementById("confirmPassword").value;
        if (confirmPassword !== password) {
            document.getElementById("confirmPassword-error").textContent = "As senhas não coincidem.";
            isValid = false;
        }

        // Se o formulário estiver válido, permite o envio
        if (isValid) {
            window.location.href = '/perfil';
        }
    });
});