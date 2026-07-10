/* ================================
   AULIZETH - Interacciones
================================ */

// Navbar con efecto scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Animación de aparición al hacer scroll
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.style.opacity = '1';
      entrada.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.quienes-img, .quienes-texto').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity .8s ease, transform .8s ease';
  observador.observe(el);
});

// Scroll suave en el menú
document.querySelectorAll('.menu a').forEach((enlace) => {
  enlace.addEventListener('click', (e) => {
    const href = enlace.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const destino = document.querySelector(href);
      if (destino) {
        window.scrollTo({
          top: destino.offsetTop - 70,
          behavior: 'smooth',
        });
      }
    }
  });
});
