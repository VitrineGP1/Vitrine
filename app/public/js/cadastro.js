// app/public/js/cadastro.js

// Lógica para a navegação móvel
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

// --- Lógica de Cadastro Principal e Validação ---

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const submitBtn = document.getElementById('submit-btn');
    const feedbackMessage = document.getElementById('feedback-message'); // Div para mensagens de sucesso/erro da API

    // Referências aos inputs e spans de erro
    const firstnameInput = document.getElementById('firstname');
    const lastnameInput = document.getElementById('lastname');
    const emailInput = document.getElementById('email');
    const celularInput = document.getElementById('number'); // Input do celular
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const firstnameErrorSpan = document.getElementById('firstname-error');
    const lastnameErrorSpan = document.getElementById('lastname-error');
    const emailErrorSpan = document.getElementById('email-error');
    const numberErrorSpan = document.getElementById('number-error');
    const passwordErrorSpan = document.getElementById('password-error');
    const confirmPasswordErrorSpan = document.getElementById('confirmPassword-error');

    // URL da API de cadastro no seu próprio servidor Node.js (CORRIGIDO PARA O ENDPOINT DO NODE.JS)
    const API_CADASTRO_URL = '/api/cadastrar_usuario';

    // --- Funções da Máscara e Restrição de Caracteres do Celular ---

    // Função para aplicar a máscara no celular
    function applyPhoneMask(value) {
        value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2'); // Coloca parênteses e espaço nos dois primeiros dígitos (DDD)
        value = value.replace(/(\d)(\d{4})$/, '$1-$2'); // Coloca hífen antes dos últimos 4 dígitos
        return value;
    }

    // Event Listener para formatar o celular enquanto o usuário digita
    celularInput.addEventListener('input', (e) => {
        e.target.value = applyPhoneMask(e.target.value);
    });

    // Event Listener para impedir caracteres não numéricos ao colar
    celularInput.addEventListener('paste', (e) => {
        const pastedData = e.clipboardData.getData('text');
        if (/\D/.test(pastedData)) { // Se houver algo que não seja dígito
            e.preventDefault(); // Impede a colagem
            numberErrorSpan.textContent = 'Apenas números são permitidos no campo celular.';
        }
    });

    // Event Listener para impedir caracteres não numéricos ao digitar (captura a tecla)
    celularInput.addEventListener('keypress', (e) => {
        // Permite apenas números (0-9), backspace (8), delete (46), tab (9), enter (13)
        const charCode = (e.which) ? e.which : e.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 8 && charCode !== 46 && charCode !== 9 && charCode !== 13) {
            e.preventDefault(); // Impede a digitação
            numberErrorSpan.textContent = 'Apenas números são permitidos no campo celular.';
        } else {
             numberErrorSpan.textContent = ''; // Limpa o erro se digitar corretamente
        }
    });
    // --- Fim das Funções da Máscara e Restrição de Caracteres ---

    // Função para exibir mensagens de feedback
    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `message ${type}-message`; // Adiciona classes para estilização
        feedbackMessage.style.display = 'block'; // Garante que a div esteja visível
    }

    // Função para limpar mensagens de erro dos campos
    function clearErrors() {
        firstnameErrorSpan.textContent = '';
        lastnameErrorSpan.textContent = '';
        emailErrorSpan.textContent = '';
        numberErrorSpan.textContent = '';
        passwordErrorSpan.textContent = '';
        confirmPasswordErrorSpan.textContent = '';
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            clearErrors(); // Limpa mensagens de erro anteriores
            feedbackMessage.textContent = ''; // Limpa mensagens de feedback anteriores
            feedbackMessage.className = 'message'; // Reseta as classes de estilo

            // Validação dos campos
            const firstname = firstnameInput.value.trim();
            const lastname = lastnameInput.value.trim();
            const email = emailInput.value.trim();
            const number = celularInput.value.trim(); // Pega o valor formatado
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            let isValid = true;

            if (firstname === '') {
                firstnameErrorSpan.textContent = 'Por favor, preencha o primeiro nome.';
                isValid = false;
            }
            if (lastname === '') {
                lastnameErrorSpan.textContent = 'Por favor, preencha o sobrenome.';
                isValid = false;
            }
            const emailPattern = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
            if (!email || !emailPattern.test(email)) {
                emailErrorSpan.textContent = 'Por favor, insira um e-mail válido.';
                isValid = false;
            }
            // Validação do celular com base no número de dígitos após remover a máscara
            const cleanNumber = number.replace(/\D/g, ''); // Remove a máscara para validação
            if (cleanNumber === '') {
                numberErrorSpan.textContent = 'O celular é obrigatório.';
                isValid = false;
            } else if (cleanNumber.length < 10 || cleanNumber.length > 11) { // 10 ou 11 dígitos para DDD + número
                numberErrorSpan.textContent = 'O número de celular deve ter 10 ou 11 dígitos (incluindo DDD).';
                isValid = false;
            }
            if (password.length < 8) { // Senha deve ter pelo menos 8 caracteres (ajustado para seu HTML)
                passwordErrorSpan.textContent = 'A senha deve ter pelo menos 8 caracteres.';
                isValid = false;
            }
            if (confirmPassword !== password) {
                confirmPasswordErrorSpan.textContent = 'As senhas não coincidem.';
                isValid = false;
            }

            if (!isValid) {
                showFeedback('Por favor, corrija os erros no formulário.', 'error');
                return; // Interrompe o envio se houver erros de validação
            }

            // Coleta os dados do formulário para enviar à API
            const formData = {
                NOME_USUARIO: `${firstname} ${lastname}`, // Concatena nome e sobrenome
                EMAIL_USUARIO: email,
                SENHA_USUARIO: password,
                CELULAR_USUARIO: cleanNumber, // Envia o celular sem a máscara para o banco de dados
                // Valores padrão para campos que não estão no formulário
                LOGRADOURO_USUARIO: "Rua Exemplo",
                BAIRRO_USUARIO: "Bairro Teste",
                CIDADE_USUARIO: "Cidade Teste",
                UF_USUARIO: "SP",
                CEP_USUARIO: "00000000",
                DT_NASC_USUARIO: "2000-01-01",
                TIPO_USUARIO: "C"
            };

            // Pega o valor do gênero selecionado (se precisar enviar para o BD)
            const selectedGender = document.querySelector('input[name="gender"]:checked');
            if (selectedGender) {
                // formData.GENERO_USUARIO = selectedGender.value; // Exemplo: se tiver um campo de gênero no BD
            }

            // Desabilita o botão enquanto envia para evitar múltiplos cliques
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            // Envia os dados para a API usando fetch
            try {
                const response = await fetch(API_CADASTRO_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json(); // Pega a resposta JSON da API

                if (response.ok && result.success) { // Se o status HTTP for 2xx e a API retornar sucesso
                    showFeedback(result.message, 'success');
                    signupForm.reset(); // Limpa o formulário após o sucesso
                    // Opcional: Redirecionar o usuário para a página de login
                    // setTimeout(() => {
                    //     window.location.href = '/login';
                    // }, 2000);
                } else { // Se o status HTTP não for 2xx ou a API retornar falha
                    showFeedback(result.message || 'Erro ao cadastrar usuário. Tente novamente.', 'error');
                    if (result.error_details) {
                        console.error('Detalhes do erro da API:', result.error_details);
                    }
                }
            } catch (error) {
                console.error('Erro na requisição de cadastro:', error);
                showFeedback('Erro de conexão com o servidor. Verifique sua internet ou tente novamente mais tarde.', 'error');
            } finally {
                // Reabilita o botão ao final da requisição (sucesso ou falha)
                submitBtn.disabled = false;
                submitBtn.textContent = 'Criar conta';
            }
        });
    }
});