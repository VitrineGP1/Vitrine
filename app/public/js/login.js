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

    function redirectByUserType(redirectUrl) {
        window.location.href = redirectUrl || '/perfil';
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
                    const name = result.user.NOME_USUARIO ? result.user.NOME_USUARIO.split(' ')[0] : '';
                    showMessage(messageDiv, `Seja bem vindo(a) ${name}!`, 'success');
                    
                    // Estruturar dados do usuário para compatibilidade
                    const userId = result.user.ID_USUARIO || result.user.id || result.user.userId;
                    const userName = result.user.NOME_USUARIO || result.user.name || result.user.nome;
                    const userEmail = result.user.EMAIL_USUARIO || result.user.email;
                    const userType = result.user.TIPO_USUARIO || result.user.type || result.user.tipo || 'C';
                    
                    const userData = {
                        id: userId,
                        name: userName,
                        email: userEmail,
                        type: userType,
                        ID_USUARIO: userId,
                        NOME_USUARIO: userName,
                        EMAIL_USUARIO: userEmail,
                        TIPO_USUARIO: userType
                    };
                    
                    if (!userId) {
                        showMessage(messageDiv, 'Erro: ID do usuário não encontrado.', 'error');
                        return;
                    }
                    
                    localStorage.setItem('loggedUser', JSON.stringify(userData));

                    // Transferir carrinho de sessão para usuário logado
                    const sessionCart = JSON.parse(localStorage.getItem('cart_session')) || [];
                    const userCart = JSON.parse(localStorage.getItem(`cart_${result.user.ID_USUARIO}`)) || [];
                    
                    if (sessionCart.length > 0) {
                        // Mesclar carrinhos - adicionar itens da sessão ao carrinho do usuário
                        sessionCart.forEach(sessionItem => {
                            const existingIndex = userCart.findIndex(userItem => userItem.id === sessionItem.id);
                            if (existingIndex > -1) {
                                userCart[existingIndex].quantity += sessionItem.quantity;
                            } else {
                                userCart.push(sessionItem);
                            }
                        });
                        
                        // Salvar carrinho mesclado e limpar sessão
                        localStorage.setItem(`cart_${userData.id}`, JSON.stringify(userCart));
                        localStorage.removeItem('cart_session');
                    }

                    // Verificar se há checkout pendente
                    const pendingCheckout = localStorage.getItem('pendingCheckout');
                    if (pendingCheckout === 'true') {
                        localStorage.removeItem('pendingCheckout');
                        setTimeout(() => {
                            window.location.href = '/carrinho';
                        }, 1000);
                    } else {
                        setTimeout(() => {
                            redirectByUserType(result.redirectUrl);
                        }, 1000);
                    }
                    
                } else {
                    showMessage(messageDiv, result.error || 'Erro ao fazer login.', 'error');
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                showMessage(messageDiv, 'Erro de conexão com o servidor.', 'error');
            }
        });
    }

    // Verificar se já está logado via localStorage
    const existingUser = localStorage.getItem('loggedUser');
    if (existingUser) {
        try {
            const user = JSON.parse(existingUser);
            if (user.type) {
                redirectByUserType(user.type);
            }
        } catch (error) {
            console.log('Erro ao verificar usuário logado:', error.message);
        }
    }
    
    // Limpar carrinho de sessão ao fechar navegador se não estiver logado
    window.addEventListener('unload', () => {
        const user = JSON.parse(localStorage.getItem('loggedUser')) || null;
        if (!user) {
            localStorage.removeItem('cart_session');
            localStorage.removeItem('cart');
        }
    });
});