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
    ".nav-list li"
);
mobileNavbar.init();

// --- Lógica de Carregamento e Edição do Perfil ---

const API_PERFIL_URL = '/api/buscar_usuario'; // Nova URL da API Node.js para buscar perfil
const API_ATUALIZAR_PERFIL_URL = '/api/atualizar_usuario'; // Nova URL da API Node.js para atualizar perfil

const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const profileDisplaySection = document.getElementById('profileDisplaySection');
const profileEditSection = document.getElementById('profileEditSection');
const editProfileForm = document.getElementById('editProfileForm');
const logoutButton = document.getElementById('logoutButton');
const toggleEditButton = document.getElementById('toggleEditButton'); // Adicione este botão no seu HTML
const cancelEditButton = document.getElementById('cancelEditButton'); // Adicione este botão no seu HTML

// Funções para exibir/esconder mensagens
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`; // 'message success', 'message error', 'message info'
    element.style.display = 'block';
}

function hideMessage(element) {
    element.style.display = 'none';
    element.textContent = '';
}

// Funções de formatação (ajuste se necessário)
function formatCelular(celular) {
    if (!celular) return '';
    celular = String(celular).replace(/\D/g, '');
    if (celular.length === 11) {
        return `(${celular.substring(0, 2)}) ${celular.substring(2, 7)}-${celular.substring(7, 11)}`;
    } else if (celular.length === 10) {
        return `(${celular.substring(0, 2)}) ${celular.substring(2, 6)}-${celular.substring(6, 10)}`;
    }
    return celular;
}

function formatCEP(cep) {
    if (!cep) return '';
    cep = String(cep).replace(/\D/g, '');
    if (cep.length === 8) {
        return `${cep.substring(0, 5)}-${cep.substring(5, 8)}`;
    }
    return cep;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Adiciona 1 dia para corrigir o fuso horário se o seu BD estiver em UTC-0
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('pt-BR'); // Formato dd/mm/aaaa
}

// Função para preencher os dados de exibição do perfil
function populateProfileDisplay(userData) {
    document.getElementById('displayUserName').textContent = userData.NOME_USUARIO || 'N/A';
    document.getElementById('displayUserEmail').textContent = userData.EMAIL_USUARIO || 'N/A';
    document.getElementById('displayUserCelular').textContent = formatCelular(userData.CELULAR_USUARIO) || 'N/A';
    document.getElementById('displayUserLogradouro').textContent = userData.LOGRADOURO_USUARIO || 'N/A';
    document.getElementById('displayUserBairro').textContent = userData.BAIRRO_USUARIO || 'N/A';
    document.getElementById('displayUserCidade').textContent = userData.CIDADE_USUARIO || 'N/A';
    document.getElementById('displayUserUf').textContent = userData.UF_USUARIO || 'N/A';
    document.getElementById('displayUserCep').textContent = formatCEP(userData.CEP_USUARIO) || 'N/A';
    document.getElementById('displayUserDtNasc').textContent = formatDate(userData.DT_NASC_USUARIO) || 'N/A';
    document.getElementById('displayUserTipo').textContent = userData.TIPO_USUARIO === 'C' ? 'Cliente' : (userData.TIPO_USUARIO === 'V' ? 'Vendedor' : 'Outro');
}

// Função para preencher os dados do formulário de edição
function populateProfileEditForm(userData) {
    document.getElementById('name_input').value = userData.NOME_USUARIO || '';
    document.getElementById('email_input').value = userData.EMAIL_USUARIO || '';
    document.getElementById('celular_input').value = formatCelular(userData.CELULAR_USUARIO) || ''; // Formata para exibir no campo
    document.getElementById('logradouro_input').value = userData.LOGRADOURO_USUARIO || '';
    document.getElementById('bairro_input').value = userData.BAIRRO_USUARIO || '';
    document.getElementById('cidade_input').value = userData.CIDADE_USUARIO || '';
    document.getElementById('uf_input').value = userData.UF_USUARIO || '';
    document.getElementById('cep_input').value = formatCEP(userData.CEP_USUARIO) || ''; // Formata para exibir no campo
    // Para input type="date", o valor precisa ser "YYYY-MM-DD"
    document.getElementById('dt_nasc_input').value = userData.DT_NASC_USUARIO ? userData.DT_NASC_USUARIO.split('T')[0] : '';
    document.getElementById('tipo_usuario_input').value = userData.TIPO_USUARIO || '';
    document.getElementById('new_password_input').value = ''; // Sempre vazio
    document.getElementById('confirm_password_input').value = ''; // Sempre vazio
}

// Função principal para buscar e exibir o perfil
async function fetchUserProfile() {
    hideMessage(errorMessage);
    hideMessage(successMessage);
    showMessage(loadingMessage, 'Carregando informações do perfil...', 'info');

    // Pega o ID do usuário do localStorage (armazenado no login)
    const userId = localStorage.getItem('userId');

    if (!userId) {
        hideMessage(loadingMessage);
        showMessage(errorMessage, 'Nenhum usuário logado. Por favor, faça login.', 'error');
        profileDisplaySection.style.display = 'none';
        profileEditSection.style.display = 'none';
        // Redireciona para login se não houver ID de usuário
        setTimeout(() => { window.location.href = '/login'; }, 2000);
        return;
    }

    try {
        const response = await fetch(`${API_PERFIL_URL}?id_usuario=${userId}`); // Envia o ID na query string
        const result = await response.json();

        if (response.ok && result.success) {
            hideMessage(loadingMessage);
            populateProfileDisplay(result.user);
            populateProfileEditForm(result.user); // Preenche o formulário de edição
            profileDisplaySection.style.display = 'block'; // Mostra a seção de exibição
            profileEditSection.style.display = 'none'; // Esconde a seção de edição por padrão
        } else {
            hideMessage(loadingMessage);
            showMessage(errorMessage, result.message || 'Erro ao carregar o perfil do usuário.', 'error');
            profileDisplaySection.style.display = 'none';
            profileEditSection.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro na requisição de perfil:', error);
        hideMessage(loadingMessage);
        showMessage(errorMessage, 'Erro na conexão com o servidor. Tente novamente mais tarde.', 'error');
        profileDisplaySection.style.display = 'none';
        profileEditSection.style.display = 'none';
    }
}

// Event Listener para quando a página carregar
document.addEventListener('DOMContentLoaded', fetchUserProfile);

// --- Lógica de Atualização do Perfil ---
if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideMessage(errorMessage);
        hideMessage(successMessage);

        const userId = localStorage.getItem('userId');
        if (!userId) {
            showMessage(errorMessage, 'Nenhum usuário logado para atualizar.', 'error');
            return;
        }

        const formData = new FormData(editProfileForm);
        const data = Object.fromEntries(formData.entries());

        // Limpa formatação de telefone e CEP antes de enviar para o backend
        data.CELULAR_USUARIO = data.CELULAR_USUARIO ? String(data.CELULAR_USUARIO).replace(/\D/g, '') : '';
        data.CEP_USUARIO = data.CEP_USUARIO ? String(data.CEP_USUARIO).replace(/\D/g, '') : '';

        // Adiciona o ID do usuário ao objeto de dados
        data.id_usuario = userId;

        // Validação das senhas (frontend)
        if (data.NOVA_SENHA_USUARIO && data.NOVA_SENHA_USUARIO !== data.CONFIRM_SENHA_USUARIO) {
            showMessage(errorMessage, 'As novas senhas não coincidem.', 'error');
            return;
        }
        // Se nova senha estiver vazia, remove os campos para não tentar atualizar a senha
        if (!data.NOVA_SENHA_USUARIO) {
            delete data.NOVA_SENHA_USUARIO;
            delete data.CONFIRM_SENHA_USUARIO;
        }

        try {
            const response = await fetch(API_ATUALIZAR_PERFIL_URL, {
                method: 'PUT', // IMPORTANTE: Agora usando PUT!
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showMessage(successMessage, result.message, 'success');
                // Recarrega o perfil para mostrar os dados atualizados
                await fetchUserProfile();
                // Opcional: Voltar para a visualização após salvar
                profileDisplaySection.style.display = 'block';
                profileEditSection.style.display = 'none';
            } else {
                showMessage(errorMessage, result.message || 'Erro ao atualizar o perfil.', 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            showMessage(errorMessage, 'Erro na conexão para atualizar o perfil.', 'error');
        }
    });
}

// Lógica para o botão de Logout
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('userName');
        alert('Você foi desconectado.');
        window.location.href = '/login'; // Redireciona para a página de login
    });
}

// Lógica para alternar entre visualização e edição (Adicione botões no HTML)
if (toggleEditButton) {
    toggleEditButton.addEventListener('click', () => {
        profileDisplaySection.style.display = 'none';
        profileEditSection.style.display = 'block';
        hideMessage(errorMessage); // Limpa mensagens ao alternar
        hideMessage(successMessage);
    });
}

if (cancelEditButton) {
    cancelEditButton.addEventListener('click', () => {
        profileDisplaySection.style.display = 'block';
        profileEditSection.style.display = 'none';
        hideMessage(errorMessage); // Limpa mensagens ao alternar
        hideMessage(successMessage);
        fetchUserProfile(); // Recarrega os dados originais caso o usuário tenha alterado e cancelado
    });
}