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
            window.location.href = '/home-perfil';
        }
    });
});

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
        : (link.style.animation = `navLinkFade 0.5s ease forwards ${
            index / 7 + 0.3
          }s`);
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

const mobileNavbar = new MobileNavbar(
  ".mobile-menu",
  ".nav-list",
  ".nav-list li",
);
mobileNavbar.init();


const signupForm = document.getElementById('signup-form');
const submitBtn = document.getElementById('submit-btn');
const feedbackMessage = document.getElementById('feedback-message');

// URL da API para cadastro de usuário 
const API_CADASTRO_URL = 'https://vitrine-lljl.onrender.com/api/cadastrar_usuario.php';
function showFeedback(message, type) {
  feedbackMessage.textContent = message;
  feedbackMessage.className = ''; // Limpa classes anteriores
  feedbackMessage.classList.add('feedback-message', type + '-message');
}

// Função para limpar mensagens de erro dos campos
function clearErrors() {
  const errorSpans = document.querySelectorAll('.error');
  errorSpans.forEach(span => span.textContent = '');
}

// Adiciona um ouvinte de evento para o envio do formulário
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Impede o envio padrão do formulário (que recarregaria a página)

  clearErrors(); // Limpa mensagens de erro anteriores
  feedbackMessage.textContent = ''; // Limpa mensagens de feedback anteriores
  feedbackMessage.className = '';

  // Validação básica dos campos antes de enviar
  const firstname = document.getElementById('firstname').value.trim();
  const lastname = document.getElementById('lastname').value.trim();
  const email = document.getElementById('email').value.trim();
  const number = document.getElementById('number').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  let isValid = true;

  if (firstname === '') {
                    document.getElementById('firstname-error').textContent = 'O primeiro nome é obrigatório.';
                    isValid = false;
                }
                if (lastname === '') {
                    document.getElementById('lastname-error').textContent = 'O sobrenome é obrigatório.';
                    isValid = false;
                }
                if (email === '') {
                    document.getElementById('email-error').textContent = 'O e-mail é obrigatório.';
                    isValid = false;
                } else if (!/\S+@\S+\.\S+/.test(email)) {
                    document.getElementById('email-error').textContent = 'E-mail inválido.';
                    isValid = false;
                }
                // Ajustando validação de celular para permitir espaços e hífens, mas remover para envio
                if (number === '') {
                    document.getElementById('number-error').textContent = 'O celular é obrigatório.';
                    isValid = false;
                } else if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(number)) { // Regex mais robusta para celular (xx) xxxxx-xxxx ou xxxx-xxxx
                    document.getElementById('number-error').textContent = 'Formato de celular inválido (Ex: (11) 98765-4321 ou 98765-4321).';
                    isValid = false;
                }
                if (password === '') {
                    document.getElementById('password-error').textContent = 'A senha é obrigatória.';
                    isValid = false;
                } else if (password.length < 6) {
                    document.getElementById('password-error').textContent = 'A senha deve ter no mínimo 6 caracteres.';
                    isValid = false;
                }
                if (confirmPassword === '') {
                    document.getElementById('confirmPassword-error').textContent = 'A confirmação de senha é obrigatória.';
                    isValid = false;
                }
                if (password !== confirmPassword) {
                    document.getElementById('confirmPassword-error').textContent = 'As senhas não coincidem.';
                    isValid = false;
                }

                if (!isValid) {
                    showFeedback('Por favor, corrija os erros no formulário.', 'error');
                    return; // Interrompe o envio se houver erros de validação
                }

                // Coleta os dados do formulário
                const formData = {
                    nome_usuario: firstname + ' ' + lastname, // Corrigido para concatenação de strings
                    email_usuario: email,
                    senha_usuario: password,
                    celular_usuario: number.replace(/\D/g, ''), // Remove caracteres não numéricos do celular para enviar limpo ao BD
                    logradouro_usuario: "Rua Exemplo", // Valor padrão para teste
                    bairro_usuario: "Bairro Teste",   // Valor padrão para teste
                    cidade_usuario: "Cidade Teste",   // Valor padrão para teste
                    uf_usuario: "SP",                 // Valor padrão para teste
                    cep_usuario: "00000000",          // Valor padrão para teste
                    dt_nasc_usuario: "2000-01-01",    // Data de nascimento fictícia para teste
                    tipo_usuario: "C"                 // Tipo de usuário (Cliente)
                };


                // Pega o valor do gênero selecionado
                const selectedGender = document.querySelector('input[name="gender"]:checked');
                if (selectedGender) {
                    // Se você precisar mapear F/M/O/N para outros valores no seu banco de dados, faça aqui
                    // Por exemplo: formData.genero_usuario = selectedGender.value;
                    // Por enquanto, o banco de dados que vimos não tem campo de gênero, mas se tiver, você pode adicionar.
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

                    const result = await response.json();

                    if (response.ok && result.success) {
                        showFeedback(result.message, 'success');
                        signupForm.reset(); // Limpa o formulário após o sucesso
                        // Opcional: Redirecionar o usuário para a página de login ou de sucesso
                        // setTimeout(() => {
                        //     window.location.href = '/login';
                        // }, 2000);
                    } else {
                        // Se a API retornar erro ou sucesso:false
                        showFeedback(result.message || 'Erro ao cadastrar usuário. Tente novamente.', 'error');
                        // Exibir erros específicos da API se houver (ex: email já cadastrado)
                        if (result.error_details) {
                            console.error('Detalhes do erro da API:', result.error_details);
                            // Você pode tentar mapear error_details para os spans de erro dos campos específicos
                        }
                    }
                } catch (error) {
                    console.error('Erro na requisição:', error);
                    showFeedback('Erro na conexão com o servidor. Verifique sua internet ou tente mais tarde.', 'error');
                } finally {
                    // Reabilita o botão ao final da requisição (sucesso ou falha)
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Criar conta';
                }
});

