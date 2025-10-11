// Fechar menu ao clicar em um link (em dispositivos móveis)
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.style.display = 'none';
                });
            });
            
            // Adicionar efeito de clique nos botões de login
            const loginButtons = document.querySelectorAll('.login-btn');
            loginButtons.forEach(button => {
                button.addEventListener('click', function() {
                    alert('Redirecionando para a página de login...');
                    // Aqui você adicionaria a lógica de redirecionamento
                });
            });
            
            // Adicionar efeito de clique nos links de navegação
            const navLinks = document.querySelectorAll('ul a, .mobile-menu a');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remover classe active de todos os links
                    navLinks.forEach(l => l.classList.remove('active'));
                    
                    // Adicionar classe active ao link clicado
                    this.classList.add('active');
                    
                    // Simular navegação
                    const pageName = this.textContent;
                    alert(`Navegando para: ${pageName}`);
                });
            });