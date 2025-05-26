document.addEventListener('DOMContentLoaded', async () => {
    // URLs das suas APIs PHP
    const PHP_PROFILE_API_URL = 'http://localhost/vitrine_copia/api/buscar_usuario_por_id.php';
    // const PHP_UPDATE_API_URL = 'http://localhost/vitrine_copia/api/atualizar_usuario.php'; // Para um futuro passo

    // Elementos de feedback (mensagens)
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Seções principais para mostrar/esconder
    const profileDisplaySection = document.getElementById('profileDisplaySection');
    const profileEditSection = document.getElementById('profileEditSection');

    // Spans/DDs para visualização dos dados (na seção de exibição)
    const displayUserName = document.getElementById('displayUserName');
    const displayUserEmail = document.getElementById('displayUserEmail');
    const displayUserCelular = document.getElementById('displayUserCelular');
    const displayUserLogradouro = document.getElementById('displayUserLogradouro');
    const displayUserBairro = document.getElementById('displayUserBairro');
    const displayUserCidade = document.getElementById('displayUserCidade');
    const displayUserUf = document.getElementById('displayUserUf');
    const displayUserCep = document.getElementById('displayUserCep');
    const displayUserDtNasc = document.getElementById('displayUserDtNasc');
    const displayUserTipo = document.getElementById('displayUserTipo');

    // Inputs do formulário de edição
    const editProfileForm = document.getElementById('editProfileForm');
    const nameInput = document.getElementById('name_input');
    const emailInput = document.getElementById('email_input');
    const celularInput = document.getElementById('celular_input');
    const logradouroInput = document.getElementById('logradouro_input');
    const bairroInput = document.getElementById('bairro_input');
    const cidadeInput = document.getElementById('cidade_input');
    const ufInput = document.getElementById('uf_input');
    const cepInput = document.getElementById('cep_input');
    const dtNascInput = document.getElementById('dt_nasc_input');
    const tipoUsuarioInput = document.getElementById('tipo_usuario_input'); // Este deve ser readonly
    const newPasswordInput = document.getElementById('new_password_input');
    const confirmPasswordInput = document.getElementById('confirm_password_input');


    // Botão de Logout
    const logoutButton = document.getElementById('logoutButton');

    // --- Funções Auxiliares ---
    const showMessage = (element, msg, type = 'error') => {
        element.textContent = msg;
        // CORREÇÃO: Usar backticks para template literals
        element.className = message ${type}; 
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none'; // Esconde a mensagem após alguns segundos
        }, 5000);
    };

    const hideAllMessages = () => {
        loadingMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
    };

    const redirectToLogin = (msg = 'Sessão expirada ou não logado. Redirecionando para login...') => {
        showMessage(errorMessage, msg, 'error');
        localStorage.removeItem('loggedInUser'); // Garante que a sessão é limpa
        setTimeout(() => {
            window.location.href = '/login.html'; // Ajuste o caminho se necessário
        }, 2000);
    };

    // --- Lógica de Carregamento do Perfil ---
    const loadUserProfile = async () => {
        hideAllMessages();
        loadingMessage.style.display = 'block'; // Mostra a mensagem de carregamento

        const loggedInUserString = localStorage.getItem('loggedInUser');

        if (!loggedInUserString) {
            redirectToLogin();
            return;
        }

        const loggedInUser = JSON.parse(loggedInUserString);
        // Seu login.js salva o ID do usuário como result.user.ID_USUARIO, mas o localStorage pode ter 'id'
        // Vamos tentar pegar de 'ID_USUARIO' primeiro, e depois de 'id' para compatibilidade
        const userId = loggedInUser.ID_USUARIO || loggedInUser.id; 

        if (!userId) {
            redirectToLogin('ID do usuário não encontrado na sessão. Faça login novamente.');
            return;
        }

        console.log('Buscando perfil para o ID:', userId);

        try {
            // CORREÇÃO: Usar backticks para template literals
            const response = await fetch(${PHP_PROFILE_API_URL}?id=${userId}); 
            const result = await response.json();

            loadingMessage.style.display = 'none'; // Esconde a mensagem de carregamento

            if (result.success && result.user) {
                const user = result.user;
                console.log('Dados do usuário carregados:', user);

                // Preencher a seção de visualização (profileDisplaySection)
                displayUserName.textContent = user.NOME_USUARIO;
                displayUserEmail.textContent = user.EMAIL_USUARIO;
                displayUserCelular.textContent = user.CELULAR_USUARIO;
                displayUserLogradouro.textContent = user.LOGRADOURO_USUARIO;
                displayUserBairro.textContent = user.BAIRRO_USUARIO;
                displayUserCidade.textContent = user.CIDADE_USUARIO;
                displayUserUf.textContent = user.UF_USUARIO;
                displayUserCep.textContent = user.CEP_USUARIO;
                displayUserDtNasc.textContent = user.DT_NASC_USUARIO;
                displayUserTipo.textContent = user.TIPO_USUARIO;

                // Preencher o formulário de edição (profileEditSection)
                nameInput.value = user.NOME_USUARIO;
                emailInput.value = user.EMAIL_USUARIO;
                celularInput.value = user.CELULAR_USUARIO;
                logradouroInput.value = user.LOGRADOURO_USUARIO;
                bairroInput.value = user.BAIRRO_USUARIO;
                cidadeInput.value = user.CIDADE_USUARIO;
                ufInput.value = user.UF_USUARIO;
                cepInput.value = user.CEP_USUARIO;
                dtNascInput.value = user.DT_NASC_USUARIO;
                tipoUsuarioInput.value = user.TIPO_USUARIO;

                // Mostrar as seções agora que os dados foram carregados
                profileDisplaySection.style.display = 'block';
                profileEditSection.style.display = 'block';

            } else {
                // CORREÇÃO: Usar backticks para template literals
                redirectToLogin(Erro ao carregar perfil: ${result.message || 'Dados inválidos.'}); 
            }
        } catch (error) {
            console.error('Erro ao buscar dados do perfil:', error);
            redirectToLogin('Erro de conexão ao carregar o perfil. Verifique sua rede.');
        }
    };

    // --- Lógica do Botão de Logout ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser'); // Remove os dados da sessão
            showMessage(successMessage, 'Você foi desconectado.', 'success');
            setTimeout(() => {
                window.location.href = '/login.html'; // Redireciona para a página de login
            }, 1000);
        });
    }

    // --- Lógica para o Formulário de Edição (Próximo Passo: Criar API de Atualização) ---
    editProfileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Aqui você implementará o envio dos dados atualizados para uma API PHP de atualização
        // Por enquanto, apenas um alerta para indicar que a função ainda não está completa
        alert('Funcionalidade de salvar alterações ainda não implementada. Salvei os dados no console.');
        
        // Exemplo de como coletar os dados do formulário:
        const formData = new FormData(editProfileForm);
        const updatedUserData = {};
        for (let [key, value] of formData.entries()) {
            updatedUserData[key] = value;
        }

        // Lidar com a nova senha
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword !== '') { // Se o usuário digitou uma nova senha
            if (newPassword !== confirmPassword) {
                showMessage(errorMessage, 'A nova senha e a confirmação não coincidem.');
                return;
            }
            updatedUserData.NOVA_SENHA_USUARIO = newPassword; // Envia a nova senha
        }
        delete updatedUserData.CONFIRM_SENHA_USUARIO; // Não precisamos enviar a confirmação

        console.log("Dados do formulário de edição para enviar:", updatedUserData);

        // ** FUTURA IMPLEMENTAÇÃO: Enviar para PHP_UPDATE_API_URL **
        // try {
        //     const response = await fetch(PHP_UPDATE_API_URL, {
        //         method: 'POST', // Ou PUT, dependendo de como você configurar
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(updatedUserData)
        //     });
        //     const result = await response.json();
        //     if (result.success) {
        //         showMessage(successMessage, 'Perfil atualizado com sucesso!', 'success');
        //         // Atualizar localStorage e recarregar perfil se necessário
        //         // localStorage.setItem('loggedInUser', JSON.stringify(result.user));
        //         // loadUserProfile();
        //     } else {
        //         // CORREÇÃO: Usar backticks para template literals
        //         showMessage(errorMessage, Erro ao atualizar perfil: ${result.message}, 'error'); 
        //     }
        // } catch (error) {
        //     console.error('Erro na requisição de atualização:', error);
        //     showMessage(errorMessage, 'Erro de conexão ao atualizar o perfil.', 'error');
        // }
    });

    // Carregar o perfil quando a página for totalmente carregada
    loadUserProfile();
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