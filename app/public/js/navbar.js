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

// Função para inicializar ícone de perfil
function initProfileIcon() {
    const headerProfileImage = document.getElementById('header-profile-image');
    if (headerProfileImage) {
        const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
        if (loggedUser) {
            if (loggedUser.profileImage) {
                headerProfileImage.src = loggedUser.profileImage;
            } else {
                const firstName = loggedUser.name ? loggedUser.name.split(' ')[0] : 'U';
                headerProfileImage.src = `https://placehold.co/32x32/cccccc/333333?text=${firstName.charAt(0)}`;
            }
        }
    }
}

// Inicializar ícone de perfil quando a página carregar
document.addEventListener('DOMContentLoaded', initProfileIcon);

// Função global para atualizar ícone de perfil
window.updateProfileIcon = function(imageBase64) {
    const headerProfileImage = document.getElementById('header-profile-image');
    if (headerProfileImage && imageBase64) {
        headerProfileImage.src = imageBase64;
    }
};