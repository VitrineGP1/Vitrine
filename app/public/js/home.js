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

document.addEventListener("DOMContentLoaded", function() {
    const slides = document.getElementById("slides");
    const totalSlides = document.querySelectorAll(".slide").length;
    let currentSlide = 0;

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides; 
        slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    setInterval(nextSlide, 3000); // Troca de slide a cada 3 segundos
});

const slider = document.getElementById('mySlider');
  const valueDisplay = document.getElementById('valueDisplay');

  slider.addEventListener('input', function() {
    valueDisplay.textContent = slider.value;
});


const carousel = document.querySelector('.carousel');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
let scrollAmount = 0;
const itemWidth = document.querySelector('.carousel-item').offsetWidth;
const maxScroll = carousel.scrollWidth - carousel.offsetWidth;

// Função para mover o carrossel para a direita com animação
rightArrow.addEventListener('click', () => {
    if (scrollAmount + itemWidth * 5 < maxScroll) {
        scrollAmount += itemWidth * 5; // Avançar 5 itens
    } else {
        scrollAmount = maxScroll; // Parar no final
    }
    carousel.style.transform = `translateX(-${scrollAmount}px)`; // Animação para mover
});

// Função para mover o carrossel para a esquerda com animação
leftArrow.addEventListener('click', () => {
    if (scrollAmount - itemWidth * 5 > 0) {
        scrollAmount -= itemWidth * 5; // Voltar 5 itens
    } else {
        scrollAmount = 0; // Parar no início
    }
    carousel.style.transform = `translateX(-${scrollAmount}px)`; // Animação para mover
});

// Função para scroll em dispositivos móveis e desktops com toque
let isDown = false;
let startX;
let scrollLeft;

carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    carousel.classList.add('active');
});

carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.classList.remove('active');
});

carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.classList.remove('active');
});

carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2; // Ajuste de sensibilidade
    carousel.scrollLeft = scrollLeft - walk;
});

// Toque para dispositivos móveis
carousel.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
});

carousel.addEventListener('touchend', () => {
    isDown = false;
});

carousel.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2; // Ajuste de sensibilidade
    carousel.scrollLeft = scrollLeft - walk;
});

function validateEmail() {
    const emailInput = document.getElementById("email");
    const message = document.getElementById("message");
    const email = emailInput.value;

    // Expressão regular para validar o formato de e-mail
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailPattern.test(email)) {
        message.innerText = "Inscrição realizada com sucesso.";
        message.style.color = "green";
        emailInput.value = ""; // Limpa o campo de e-mail
    } else {
        message.innerText = "Por favor, insira um e-mail válido.";
        message.style.color = "red";
    }
}
