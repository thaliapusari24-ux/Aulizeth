//=============================
//      CARRUSEL AUTOMÁTICO
//=============================

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

let index = 0;

// Mostrar slide
function mostrarSlide(i) {

    // Eliminar clases activas
    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    // Agregar clase activa
    slides[i].classList.add("active");
    dots[i].classList.add("active");
}

// Botón siguiente
function siguienteSlide() {

    index++;

    if (index >= slides.length) {
        index = 0;
    }

    mostrarSlide(index);

}

// Botón anterior
function anteriorSlide() {

    index--;

    if (index < 0) {
        index = slides.length - 1;
    }

    mostrarSlide(index);

}

// Eventos botones
next.addEventListener("click", siguienteSlide);
prev.addEventListener("click", anteriorSlide);

// Indicadores
dots.forEach((dot, i) => {

    dot.addEventListener("click", () => {

        index = i;

        mostrarSlide(index);

    });

});

// Cambio automático cada 5 segundos
setInterval(() => {

    siguienteSlide();

}, 5000);