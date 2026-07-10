// Nav-auth: cambia el botón "Iniciar Sesión" por "Cerrar Sesión" cuando el
// usuario está autenticado. Se carga en las páginas públicas.
import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

function replaceLoginLinks(loggedIn) {
  // Busca cualquier <a> que apunte a iniciarsesion.html o tenga clase .login
  const links = document.querySelectorAll('a[href="iniciarsesion.html"], a.login, a.btn-ghost[href*="iniciarsesion"]');
  links.forEach((a) => {
    if (loggedIn) {
      a.textContent = "Cerrar Sesión";
      a.href = "#";
      a.dataset.logout = "1";
    } else {
      if (a.dataset.logout) {
        a.textContent = a.classList.contains("btn-ghost") ? "Iniciar sesión" : "Iniciar Sesión";
        a.href = "iniciarsesion.html";
        delete a.dataset.logout;
      }
    }
  });
  // Oculta botones de "Regístrate" cuando está logueado
  const regs = document.querySelectorAll('a[href="registrate.html"], a.registro[href*="registrate"], a.btn-solid[href*="registrate"]');
  regs.forEach((a) => { a.style.display = loggedIn ? "none" : ""; });
}

onAuthStateChanged(auth, (user) => {
  replaceLoginLinks(!!user);
});

document.addEventListener("click", async (e) => {
  const a = e.target.closest('a[data-logout="1"]');
  if (!a) return;
  e.preventDefault();
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (err) {
    console.error("[nav-auth] Error al cerrar sesión:", err);
    alert("No se pudo cerrar sesión. Intenta nuevamente.");
  }
});
