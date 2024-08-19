let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        
        navbar.classList.add('navbar-hidden');
    } else {
        
        navbar.classList.remove('navbar-hidden');
    }
    lastScrollTop = scrollTop;
});

const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
    const slidesContainer = document.querySelector('.slides');
    const totalSlides = slides.length;

    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }


    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

setInterval(nextSlide, 3000);