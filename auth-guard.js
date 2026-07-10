// Auth Guard — protege páginas privadas (aula.html, admin.html)
// Fuente de verdad: Firebase Auth + Firestore usuarios/{uid}.role
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const file = (location.pathname.split("/").pop() || "").toLowerCase();
const IS_ADMIN_PAGE = file === "admin.html";
const IS_STUDENT_PAGE = file === "aula.html";
const IS_PROTECTED = IS_ADMIN_PAGE || IS_STUDENT_PAGE;

// Oculta la página hasta validar la sesión
let gateStyle = null;
if (IS_PROTECTED) {
  gateStyle = document.createElement("style");
  gateStyle.id = "__auth_gate";
  gateStyle.textContent = "html{visibility:hidden!important;}";
  document.documentElement.appendChild(gateStyle);
  // Failsafe: si algo falla en 8s, muestra la página
  setTimeout(() => gateStyle?.remove(), 8000);
}
const revealPage = () => gateStyle?.remove();

onAuthStateChanged(auth, async (user) => {
  if (!IS_PROTECTED) return;

  if (!user) {
    window.location.replace("iniciarsesion.html");
    return;
  }

  // Leer rol desde Firestore
  let role = "student";
  let name = user.displayName || (user.email || "").split("@")[0];
  try {
    const snap = await getDoc(doc(db, "usuarios", user.uid));
    if (snap.exists()) {
      const d = snap.data();
      if (d.role === "admin") role = "admin";
      if (d.nombre) name = d.nombre;
    }
  } catch (err) {
    console.warn("[auth-guard] No se pudo leer el rol del usuario:", err);
  }

  // Cache liviano para UI
  try {
    sessionStorage.setItem("aul_user", JSON.stringify({
      uid: user.uid, email: user.email, name, role,
    }));
  } catch {}

  // Enrutamiento por rol
  // El admin puede visitar tanto admin.html como aula.html (para ver la misma
  // experiencia del alumno). El estudiante NO puede entrar a admin.html.
  if (role !== "admin" && IS_ADMIN_PAGE) {
    window.location.replace("aula.html");
    return;
  }

  // Marca el body con el rol para poder mostrar/ocultar elementos por CSS/JS
  document.body?.setAttribute("data-role", role);

  // Muestra la página
  revealPage();

  // Actualiza UI si existe
  const nameEl = document.getElementById("userName");
  const avatarEl = document.getElementById("userAvatar");
  const welcomeEl = document.getElementById("welcomeTitle");
  if (nameEl) nameEl.textContent = name;
  if (avatarEl) avatarEl.textContent = (name || "?").charAt(0).toUpperCase();
  if (welcomeEl) welcomeEl.textContent = `¡Hola, ${name}!`;
});

// Botón cerrar sesión
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("#logoutBtn");
  if (!btn) return;
  e.preventDefault();
  try {
    await signOut(auth);
    sessionStorage.removeItem("aul_user");
    window.location.replace("iniciarsesion.html");
  } catch (err) {
    console.error("[auth-guard] Error al cerrar sesión:", err);
    alert("No se pudo cerrar sesión. Intenta nuevamente.");
  }
});
