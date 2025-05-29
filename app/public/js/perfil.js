// Classe para a navegação móvel (se você ainda usa em outras páginas)
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

const API_PERFIL_URL = 'https://vitrine-lljl.onrender.com/api/buscar_usuario.php'; // Sua nova API para buscar perfil
const API_ATUALIZAR_PERFIL_URL = 'https://vitrine-lljl.onrender.com/api/atualizar_usuario.php';

const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const profileDisplaySection = document.getElementById('profileDisplaySection');
const profileEditSection = document.getElementById('profileEditSection');
const editProfileForm = document.getElementById('editProfileForm');
const logoutButton = document.getElementById('logoutButton');

// Funções para exibir/esconder mensagens
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
}

function hideMessage(element) {
    element.style.display = 'none';
    element.textContent = '';
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
    document.getElementById('celular_input').value = formatCelular(userData.CELULAR_USUARIO) || '';
    document.getElementById('logradouro_input').value = userData.LOGRADOURO_USUARIO || '';
    document.getElementById('bairro_input').value = userData.BAIRRO_USUARIO || '';
    document.getElementById('cidade_input').value = userData.CIDADE_USUARIO || '';
    document.getElementById('uf_input').value = userData.UF_USUARIO || '';
    document.getElementById('cep_input').value = userData.CEP_USUARIO || '';
    document.getElementById('dt_nasc_input').value = userData.DT_NASC_USUARIO ? userData.DT_NASC_USUARIO.split('T')[0] : ''; // Pega apenas a data
    document.getElementById('tipo_usuario_input').value = userData.TIPO_USUARIO || '';
    // Senha e confirmação de senha ficam vazias para serem preenchidas apenas se o usuário quiser alterar
    document.getElementById('new_password_input').value = '';
    document.getElementById('confirm_password_input').value = '';
}

// Funções de formatação (você pode precisar adaptá-las)
function formatCelular(celular) {
    if (!celular) return '';
    celular = celular.replace(/\D/g, ''); // Remove tudo que não é dígito
    if (celular.length === 11) {
        return `(${celular.substring(0, 2)}) <span class="math-inline">\{celular\.substring\(2, 7\)\}\-</span>{celular.substring(7, 11)}`;
    } else if (celular.length === 10) {
        return `(${celular.substring(0, 2)}) <span class="math-inline">\{celular\.substring\(2, 6\)\}\-</span>{celular.substring(6, 10)}`;
    }
    return celular;
}

function formatCEP(cep) {
    if (!cep) return '';
    cep = cep.replace(/\D/g, '');
    if (cep.length === 8) {
        return `<span class="math-inline">\{cep\.substring\(0, 5\)\}\-</span>{cep.substring(5, 8)}`;
    }
    return cep;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR'); // Formato dd/mm/aaaa
}


// Função principal para buscar e exibir o perfil
async function fetchUserProfile() {
    hideMessage(errorMessage);
    hideMessage(successMessage);
    showMessage(loadingMessage, 'Carregando informações do perfil...', 'info'); // 'info' pode ser uma classe CSS que você define

    // ATENÇÃO: AQUI VOCÊ PRECISA DE UM ID DE USUÁRIO REALMENTE LOGADO.
    // Para testes, vamos usar um ID fixo ou simular um login.
    // Em um sistema real, você obteria isso de uma sessão ou token JWT.
    const userId = 1; // SUBSTITUA POR LÓGICA DE USUÁRIO LOGADO REAL

    if (!userId) {
        hideMessage(loadingMessage);
        showMessage(errorMessage, 'Nenhum usuário logado. Por favor, faça login.', 'error');
        profileDisplaySection.style.display = 'none';
        profileEditSection.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`<span class="math-inline">\{API\_PERFIL\_URL\}?id\_usuario\=</span>{userId}`); // Enviando o ID na URL para teste
        const result = await response.json();

        if (response.ok && result.success) {
            hideMessage(loadingMessage);
            populateProfileDisplay(result.user);
            populateProfileEditForm(result.user); // Preenche o formulário de edição também
            profileDisplaySection.style.display = 'block';
            // profileEditSection.style.display = 'block'; // Mostra a seção de edição se quiser
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

// --- Lógica de Atualização do Perfil (Exemplo) ---
editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessage(errorMessage);
    hideMessage(successMessage);

    const userId = 1; // Novamente, substituir por lógica de usuário logado
    if (!userId) {
        showMessage(errorMessage, 'Nenhum usuário logado para atualizar.', 'error');
        return;
    }

    const formData = new FormData(editProfileForm);
    const data = Object.fromEntries(formData.entries());

    // Adaptação dos nomes dos campos para o seu banco de dados
    const updateData = {
        id_usuario: userId,
        nome_usuario: data.NOME_USUARIO,
        email_usuario: data.EMAIL_USUARIO,
        celular_usuario: data.CELULAR_USUARIO.replace(/\D/g, ''), // Remove máscara
        logradouro_usuario: data.LOGRADOURO_USUARIO,
        bairro_usuario: data.BAIRRO_USUARIO,
        cidade_usuario: data.CIDADE_USUARIO,
        uf_usuario: data.UF_USUARIO,
        cep_usuario: data.CEP_USUARIO.replace(/\D/g, ''), // Remove máscara
        dt_nasc_usuario: data.DT_NASC_USUARIO,
        tipo_usuario: data.TIPO_USUARIO,
        nova_senha_usuario: data.NOVA_SENHA_USUARIO,
        confirmar_senha_usuario: data.CONFIRM_SENHA_USUARIO
    };

    if (updateData.nova_senha_usuario && updateData.nova_senha_usuario !== updateData.confirmar_senha_usuario) {
        showMessage(errorMessage, 'As novas senhas não coincidem.', 'error');
        return;
    }

    // Remover campos de senha se não forem alterados
    if (!updateData.nova_senha_usuario) {
        delete updateData.nova_senha_usuario;
        delete updateData.confirmar_senha_usuario;
    }

    try {
        const response = await fetch(API_ATUALIZAR_PERFIL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Adicione aqui Authorization Bearer Token se estiver usando JWT
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showMessage(successMessage, result.message, 'success');
            // Recarrega o perfil para mostrar os dados atualizados
            await fetchUserProfile();
        } else {
            showMessage(errorMessage, result.message || 'Erro ao atualizar o perfil.', 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        showMessage(errorMessage, 'Erro na conexão para atualizar o perfil.', 'error');
    }
});

// Lógica para o botão de Logout (exemplo)
logoutButton.addEventListener('click', () => {
    // Implemente sua lógica de logout aqui:
    // 1. Remover token/cookie de autenticação do localStorage/cookies.
    // 2. Redirecionar para a página de login.
    alert('Funcionalidade de Logout ainda não implementada completamente.');
    window.location.href = '/login'; // Exemplo de redirecionamento
});


// Você pode adicionar botões para alternar entre as seções de exibição e edição
// Exemplo:
// const toggleEditButton = document.getElementById('toggleEditButton');
// toggleEditButton.addEventListener('click', () => {
//     profileDisplaySection.style.display = 'none';
//     profileEditSection.style.display = 'block';
// });