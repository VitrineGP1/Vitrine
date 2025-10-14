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
                // Todos redirecionam para perfil unificado
                link.href = '/perfil';
                const icon = user.type === 'A' ? 'fa-crown' : 'fa-user';
                link.innerHTML = `<i class="fa ${icon}"></i> ${user.name.split(' ')[0]}`;
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
        

        

        
        // Verifica se já existe botão de logout
        const existingLogout = navList.querySelector('a[onclick="logout()"]');
        if (!existingLogout) {
            // Adiciona botão de logout
            const logoutLi = document.createElement('li');
            logoutLi.innerHTML = '<a href="#" onclick="logout()"><i class="fa fa-sign-out"></i> Sair</a>';
            navList.appendChild(logoutLi);
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
document.addEventListener('DOMContentLoaded', checkLoginStatus)
};