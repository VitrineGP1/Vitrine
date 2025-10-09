// app/public/js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailErrorSpan = document.getElementById('emailError');
    const passwordErrorSpan = document.getElementById('passwordError');

    // ✅ URL CORRETA - aponta para sua rota authRoutes
    const API_LOGIN_URL = '/api/login';

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

    function redirectByUserType(userType) {
        const routes = {
            'A': '/admin.html',
            'V': '/vendedor.html',  
            'C': '/cliente.html'
        };

        const page = routes[userType];
        if (page) {
            window.location.href = page;
        } else {
            showMessage(messageDiv, 'Tipo de conta não reconhecido.', 'error');
        }
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
            }

            if (hasError) {
                showMessage(messageDiv, 'Por favor, corrija os erros no formulário.', 'error');
                return;
            }

            try {
                const response = await fetch(API_LOGIN_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // ✅ IMPORTANTE para sessions
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showMessage(messageDiv, result.message, 'success');
                    localStorage.setItem('loggedInUser', JSON.stringify(result.user));

                    setTimeout(() => {
                        redirectByUserType(result.user.tipo); // 'A', 'V', 'C'
                    }, 1000);
                    
                } else {
                    showMessage(messageDiv, result.error || 'Erro ao fazer login.', 'error');
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                showMessage(messageDiv, 'Erro de conexão com o servidor.', 'error');
            }
        });
    }

    // Verificar se já está logado
    async function checkExistingSession() {
        try {
            const response = await fetch('/api/me', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    redirectByUserType(result.user.tipo);
                }
            }
        } catch (error) {
            // Não está logado - normal
        }
    }

    checkExistingSession();
});