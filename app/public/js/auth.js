// Gerenciamento de autenticação
function checkLoginStatus() {
    const loggedUser = localStorage.getItem('loggedUser');
    const navList = document.querySelector('.nav-list');
    
    if (loggedUser && navList) {
        try {
            const user = JSON.parse(loggedUser);
            
            if (user && user.id) {
                // Configurar profile-icon baseado no tipo de usuário
                const profileLinks = document.querySelectorAll('.profile-icon');
                profileLinks.forEach(profileLink => {
                    if (user.type === 'admin') {
                        profileLink.href = '/admin-dashboard';
                    } else {
                        profileLink.href = '/perfil';
                    }
                    profileLink.style.display = 'flex';
                });
                
                // Encontra os links de login
                const loginLinks = navList.querySelectorAll('a[href="/login"]');
                
                loginLinks.forEach(link => {
                    if (link.textContent.trim() === 'Entrar') {
                        // Redireciona admin para dashboard, outros para perfil
                        if (user.type === 'admin') {
                            link.href = '/admin-dashboard';
                            link.innerHTML = `<i class="fa fa-crown"></i> ${user.name.split(' ')[0]}`;
                        } else {
                            link.href = '/perfil';
                            link.innerHTML = `<i class="fa fa-user"></i> ${user.name.split(' ')[0]}`;
                        }
                        
                        // Carregar foto de perfil do banco de dados
                        loadUserProfileImage(user.id);
                    }
                });
                
                // Encontra e oculta o link "Seja um Vendedor" para vendedores e admins
                const sellerLinks = navList.querySelectorAll('a');
                sellerLinks.forEach(link => {
                    if (link.textContent.trim() === 'Seja um Vendedor') {
                        console.log('Found seller link, user type:', user.type, 'sellerId:', user.sellerId);
                        if (user.type === 'seller' || user.sellerId || user.type === 'admin') {
                            console.log('Hiding seller link for seller/admin user');
                            link.style.display = 'none';
                        }
                    }
                });
                
                // Adiciona aba "Meus Pedidos" para compradores (exceto em páginas admin)
                if (user.type === 'buyer' && !window.location.pathname.includes('admin')) {
                    const ordersLi = document.createElement('li');
                    ordersLi.innerHTML = '<a href="/meus-pedidos"><i class="fa fa-shopping-bag"></i> Meus Pedidos</a>';
                    navList.appendChild(ordersLi);
                }
                
                // Verifica se já existe botão de logout
                const existingLogout = navList.querySelector('a[onclick="logout()"]');
                if (!existingLogout) {
                    // Adiciona botão de logout
                    const logoutLi = document.createElement('li');
                    logoutLi.innerHTML = '<a href="#" onclick="logout()"><i class="fa fa-sign-out"></i> Sair</a>';
                    navList.appendChild(logoutLi);
                }
            }
        } catch (e) {
            console.error('Erro ao processar dados do usuário logado:', e);
            // Se houver erro, limpar dados corrompidos
            localStorage.removeItem('loggedUser');
        }
    } else if (!loggedUser && window.location.pathname === '/perfil') {
        // Se não está logado e está na página de perfil, redireciona para login
        console.log('AUTH.JS: Tentando redirecionar para login');
        // window.location.href = '/login';
    }
}

async function loadUserProfileImage(userId) {
    try {
        const response = await fetch(`/api/user/${userId}`);
        const result = await response.json();
        
        if (result.success && result.user.IMAGEM_PERFIL_BASE64) {
            const headerProfileImage = document.getElementById('header-profile-image');
            if (headerProfileImage) {
                headerProfileImage.src = result.user.IMAGEM_PERFIL_BASE64;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar imagem de perfil:', error);
    }
}

function logout() {
    localStorage.removeItem('loggedUser');
    
    // Reset da imagem de perfil
    const headerProfileImage = document.getElementById('header-profile-image');
    if (headerProfileImage) {
        headerProfileImage.src = 'https://placehold.co/32x32/cccccc/333333?text=U';
    }
    
    window.location.href = '/';
}

// Executa quando a página carrega
document.addEventListener('DOMContentLoaded', checkLoginStatus);