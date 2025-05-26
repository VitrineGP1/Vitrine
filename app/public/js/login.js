document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById('loginForm');
  
    // Verifique se o loginForm foi encontrado
    if (!loginForm) {
      console.error('Formulário de login não encontrado!');
      return; // Saia da função se o formulário não existir
    }
  
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Impede o envio do formulário até a validação
  
      // Obtendo os valores dos campos
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      // Limpando mensagens de erro
      document.getElementById('emailError').textContent = '';
      document.getElementById('passwordError').textContent = '';
  
      let hasError = false;
  
      // Validação de email
      if (!email) {
        document.getElementById('emailError').textContent = 'Por favor, insira seu email.';
        hasError = true;
      } else if (!validateEmail(email)) {
        document.getElementById('emailError').textContent = 'Email inválido.';
        hasError = true;
      }
  
      // Validação de senha
      if (!password) {
        document.getElementById('passwordError').textContent = 'Por favor, insira sua senha.';
        hasError = true;
      } else if (password.length < 8) {
        document.getElementById('passwordError').textContent = 'A senha deve ter pelo menos 8 caracteres.';
        hasError = true;
      }
  
      // Se não houver erros, redirecione para o link desejado
      if (!hasError) {        
        // Redireciona após a validação
        window.location.href = '/home-perfil'; // Insira o link que deseja redirecionar
        
        // Limpa o formulário após o envio (opcional, se o formulário estiver sendo enviado para outra página)
        loginForm.reset();
      }
    });
  
    // Função para validar o formato do email
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex para validar o email
      return re.test(String(email).toLowerCase());
    }
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

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    // Adicione um elemento para exibir a mensagem geral de sucesso/erro do login
    const loginMessage = document.createElement('p');
    loginMessage.id = 'apiLoginMessage'; // ID para o elemento de mensagem
    loginForm.appendChild(loginMessage); // Adiciona o elemento abaixo do formulário


    const PHP_LOGIN_API_URL = 'http://localhost/vitrine_copia/api/login_usuario.php';

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário (recarregar a página)

        // Limpa mensagens anteriores
        loginMessage.textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        const email = emailInput.value.trim(); // .trim() remove espaços em branco extras
        const password = passwordInput.value.trim();

        // Validação simples no lado do cliente
        let isValid = true;
        if (email === '') {
            document.getElementById('emailError').textContent = 'O e-mail é obrigatório.';
            isValid = false;
        }
        if (password === '') {
            document.getElementById('passwordError').textContent = 'A senha é obrigatória.';
            isValid = false;
        }

        if (!isValid) {
            return; // Para a execução se a validação falhar
        }

        // Preparar os dados para enviar para o PHP
        // ATENÇÃO: Os nomes das chaves aqui (email_usuario, senha_usuario)
        // DEVEM CORRESPONDER aos nomes que seu PHP (login_usuario.php) espera
        const loginData = {
            email_usuario: email,
            senha_usuario: password
        };

        console.log('Dados de login a serem enviados para a API PHP:', loginData);

        try {
            // Faz a requisição HTTP para a API PHP de login
            const response = await fetch(PHP_LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Indica que o corpo é JSON
                },
                body: JSON.stringify(loginData) // Converte o objeto JS para string JSON
            });

            const result = await response.json(); // Analisa a resposta como JSON

            if (result.success) {
             loginMessage.textContent = result.message + " Bem-vindo(a), " + result.user.nome + "!";
            loginMessage.style.color = 'green';
            loginForm.reset();

            console.log('Login bem-sucedido. Dados do usuário:', result.user);

            localStorage.setItem('loggedInUser', JSON.stringify(result.user));

            window.location.href = 'C:/xampp/htdocs/vitrine_copia/app/views/pages/perfil.html';

            } else {
                loginMessage.textContent = "Erro no login: ${result.message}";
                loginMessage.style.color = 'red';
            }

        } catch (error) {
            console.error('Erro na requisição de login:', error);
            loginMessage.textContent = 'Erro ao conectar com o servidor. Tente novamente.';
            loginMessage.style.color = 'red';
        }
    });
});