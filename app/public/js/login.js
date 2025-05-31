// app/public/js/login.js

// Lógica para a navegação móvel (mantida do seu código)
class MobileNavbar {
    constructor(mobileMenu, navList, navLinks) {
        this.mobileMenu = document.querySelector(mobileMenu);
        this.navList = document.querySelector(navList);
        this.navLinks = document.querySelectorAll(navLinks);
        this.activeClass = "active";
        this.handleClick = this.handleClick.bind(this);
    }

    animateLinks() {
        this.navLinks.forEach((link, index) => {
            link.style.animation
                ? (link.style.animation = "")
                : (link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`);
        });
    }

    handleClick() {
        this.navList.classList.toggle(this.activeClass);
        this.mobileMenu.classList.toggle(this.activeClass);
        this.animateLinks();
    }

    addClickEvent() {
        this.mobileMenu.addEventListener("click", this.handleClick);
    }

    init() {
        if (this.mobileMenu) {
            this.addClickEvent();
        }
        return this;
    }
}

// Inicializa o menu mobile
const mobileNavbar = new MobileNavbar(
    ".mobile-menu",
    ".nav-list",
    ".nav-list li"
);
mobileNavbar.init();

// --- Lógica de Login Principal e Validação ---

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message'); // Div para mensagens de sucesso/erro da API

    // Referências aos inputs e spans de erro, conforme seu HTML
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailErrorSpan = document.getElementById('emailError');
    const passwordErrorSpan = document.getElementById('passwordError');

    // URL da API de login no seu próprio servidor Node.js
    const API_LOGIN_URL = '/api/login_usuario';

    // Função para validar o formato do email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // Função para exibir mensagens de feedback (sucesso/erro)
    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = `message ${type}`; // Adiciona classes para estilização
        element.style.display = 'block'; // Garante que a div esteja visível
    }

    // Função para limpar mensagens de erro dos campos
    function clearInputErrors() {
        emailErrorSpan.textContent = '';
        passwordErrorSpan.textContent = '';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            clearInputErrors(); // Limpa erros de input anteriores
            messageDiv.textContent = ''; // Limpa mensagens gerais anteriores
            messageDiv.className = 'message'; // Reseta as classes de estilo

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            let hasError = false;

            // --- Validação Cliente-Side ---
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
                // Se houver erros de validação no frontend, exiba uma mensagem geral e pare
                showMessage(messageDiv, 'Por favor, corrija os erros no formulário.', 'error');
                return;
            }

            // --- Envio para a API (se a validação cliente-side passar) ---
            try {
                const response = await fetch(API_LOGIN_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ EMAIL_USUARIO: email, SENHA_USUARIO: password })
                });

                const result = await response.json(); // Pega a resposta JSON da API

                if (response.ok && result.success) { // Se o status HTTP for 2xx e a API retornar sucesso
                    showMessage(messageDiv, result.message, 'success');

                    // Armazena informações do usuário no localStorage
                    localStorage.setItem('userId', result.user.id);
                    localStorage.setItem('userType', result.user.type);
                    localStorage.setItem('userName', result.user.name);

                    // Redireciona para a página de perfil após um breve atraso
                    setTimeout(() => {
                        window.location.href = '/perfil'; // Redireciona para a rota /perfil
                    }, 1000);
                } else { // Se o status HTTP não for 2xx ou a API retornar falha
                    showMessage(messageDiv, result.message || 'Erro ao fazer login.', 'error');
                }
            } catch (error) {
                console.error('Erro na requisição de login:', error);
                showMessage(messageDiv, 'Erro de conexão com o servidor. Verifique sua internet ou tente novamente mais tarde.', 'error');
            }
        });
    }
});
