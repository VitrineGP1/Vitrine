// Gerenciamento de autenticação
function checkLoginStatus() {
    const loggedUser = localStorage.getItem('loggedUser');
    const navList = document.querySelector('.nav-list');
    
    if (loggedUser && navList) {
        const user = JSON.parse(loggedUser);
        
        // Mostrar profile-icon
        const profileIconLi = document.getElementById('profile-icon-li');
        if (profileIconLi) {
            profileIconLi.style.display = 'block';
        }
        
        // Encontra os links de login
        const loginLinks = navList.querySelectorAll('a[href="/login"]');
        
        loginLinks.forEach(link => {
            if (link.textContent.trim() === 'Entrar') {
                // Redireciona admin para dashboard, outros para perfil
                if (user.type === 'A') {
                    link.href = '/admin-dashboard';
                    link.innerHTML = `<i class="fa fa-crown"></i> ${user.name.split(' ')[0]}`;
                } else {
                    link.href = '/perfil';
                    link.innerHTML = `<i class="fa fa-user"></i> ${user.name.split(' ')[0]}`;
                }
            }
        });
        
        // Encontra e oculta o link "Seja um Vendedor" para vendedores e admins
        const sellerLinks = navList.querySelectorAll('a');
        sellerLinks.forEach(link => {
            if (link.textContent.trim() === 'Seja um Vendedor') {
                console.log('Found seller link, user type:', user.type, 'user data:', user);
                if (user.type === 'V' || user.sellerId || user.type === 'A') {
                    console.log('Hiding seller link for seller/admin user');
                    link.style.display = 'none';
                }
            }
        });
        

        
        // Adiciona aba "Meus Pedidos" para compradores (exceto em páginas admin)
        if (user.type === 'C' && !window.location.pathname.includes('admin')) {
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
    } else if (!loggedUser && window.location.pathname === '/perfil') {
        // Se não está logado e está na página de perfil, redireciona para login
        console.log('AUTH.JS: Usuário não autenticado na página de perfil');
        // window.location.href = '/login';
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