document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailErrorSpan = document.getElementById('emailError');
    const passwordErrorSpan = document.getElementById('passwordError');

    const API_LOGIN_URL = '/api/login_usuario';

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }

    function clearInputErrors() {
        emailErrorSpan.textContent = '';
        passwordErrorSpan.textContent = '';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            clearInputErrors();
            messageDiv.textContent = '';
            messageDiv.className = 'message';

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            let hasError = false;

            if (!email) {
                emailErrorSpan.textContent = 'Por favor, insira seu email.';
                hasError = true;
            } else if (!validateEmail(email)) {
                emailErrorSpan.textContent = 'Email inválido.';
                hasError = true;
            }

            if (!password) {
                passwordErrorSpan.textContent = 'Por favor, insira sua senha.';
                hasError = true;
            } else if (password.length < 8) {
                passwordErrorSpan.textContent = 'A senha deve ter pelo menos 8 caracteres.';
                hasError = true;
            }

            if (hasError) {
                showMessage(messageDiv, 'Por favor, corrija os erros no formulário.', 'error');
                return;
            }

            try {
                const response = await fetch(API_LOGIN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ EMAIL_USUARIO: email, SENHA_USUARIO: password })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showMessage(messageDiv, result.message, 'success');


                    localStorage.setItem('loggedInUser', JSON.stringify(result.user));

                    setTimeout(() => {
                        window.location.href = '/perfil';
                    }, 1000);
                } else {
                    showMessage(messageDiv, result.message || 'Erro ao fazer login.', 'error');
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                showMessage(messageDiv, 'Erro de conexão com o servidor. Verifique sua internet ou tente novamente mais tarde.', 'error');
            }
        });
    }
});