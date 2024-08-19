let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // Rolar para baixo - esconder navbar
        navbar.classList.add('navbar-hidden');
    } else {
        // Rolar para cima - mostrar navbar
        navbar.classList.remove('navbar-hidden');
    }
    lastScrollTop = scrollTop;
});