// Iniciar sesión — Aulizeth (Firebase Auth)
import { auth, db, friendlyAuthError } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ============ Referencias ============
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const emailWrapper = document.getElementById("emailWrapper");
const passwordWrapper = document.getElementById("passwordWrapper");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "Ingresar";

// ============ Prellenar correo desde ?correo= ============
try {
  const params = new URLSearchParams(window.location.search);
  const correo = params.get("correo");
  if (correo && emailInput) {
    emailInput.value = correo;
    passwordInput?.focus();
  }
} catch (err) {
  console.warn("[login] No se pudo leer parámetros de URL:", err);
}

// ============ Mostrar / ocultar contraseña ============
function togglePasswordVisibility() {
  if (!passwordInput || !togglePassword) return;
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.classList.toggle("fa-eye", !isHidden);
  togglePassword.classList.toggle("fa-eye-slash", isHidden);
  togglePassword.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
}
togglePassword?.addEventListener("click", togglePasswordVisibility);
togglePassword?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePasswordVisibility(); }
});

// ============ Validaciones ============
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function setFieldError(wrapper, errorEl, message) {
  wrapper?.classList.add("input-error");
  if (errorEl) errorEl.textContent = message;
}
function clearFieldError(wrapper, errorEl) {
  wrapper?.classList.remove("input-error");
  if (errorEl) errorEl.textContent = "";
}
function validateEmailField() {
  const email = emailInput.value.trim();
  if (!email) { setFieldError(emailWrapper, emailError, "Ingresa tu correo electrónico."); return false; }
  if (!validateEmail(email)) { setFieldError(emailWrapper, emailError, "Ingresa un correo válido."); return false; }
  clearFieldError(emailWrapper, emailError); return true;
}
function validatePasswordField() {
  const password = passwordInput.value;
  if (!password) { setFieldError(passwordWrapper, passwordError, "Ingresa tu contraseña."); return false; }
  if (password.length < 6) { setFieldError(passwordWrapper, passwordError, "Debe contener al menos 6 caracteres."); return false; }
  clearFieldError(passwordWrapper, passwordError); return true;
}

let formSubmitted = false;
emailInput?.addEventListener("input", () => { if (formSubmitted) validateEmailField(); });
passwordInput?.addEventListener("input", () => { if (formSubmitted) validatePasswordField(); });

// ============ Estado del botón / mensajes ============
function setStatus(message, kind) {
  if (!formStatus) return;
  formStatus.textContent = message || "";
  formStatus.className = "form-status" + (kind ? " " + kind : "");
}
function setLoading(loading) {
  if (!submitBtn) return;
  submitBtn.disabled = loading;
  submitBtn.innerHTML = loading
    ? `<i class="fa-solid fa-spinner fa-spin"></i> Ingresando...`
    : originalBtnHTML;
  submitBtn.style.background = "";
}

// ============ Envío ============
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  formSubmitted = true;

  const okEmail = validateEmailField();
  const okPass = validatePasswordField();
  setStatus("", "");
  if (!okEmail || !okPass) {
    setStatus("Revisa los campos marcados en rojo.", "error");
    return;
  }

  if (!auth) {
    setStatus("Servicio de autenticación no disponible. Recarga la página.", "error");
    return;
  }

  setLoading(true);
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Detectar rol para redirigir
    let role = "student";
    try {
      const snap = await getDoc(doc(db, "usuarios", cred.user.uid));
      if (snap.exists() && snap.data().role === "admin") role = "admin";
    } catch (err) {
      console.warn("[login] No se pudo leer rol, se asume estudiante:", err);
    }

    submitBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Bienvenido`;
    submitBtn.style.background = "#28a745";
    setStatus(
      role === "admin" ? "Acceso de administrador. Redirigiendo..." : "Inicio de sesión exitoso. Redirigiendo...",
      "success"
    );

    setTimeout(() => {
      window.location.href = role === "admin" ? "admin.html" : "aula.html";
    }, 900);
  } catch (err) {
    console.error("[login] Error:", err);
    setLoading(false);
    const msg = friendlyAuthError(err);
    setStatus(msg, "error");
    // Marcar visualmente los campos si es error de credenciales
    if (String(err.code || "").includes("password") || String(err.code || "").includes("credential")) {
      setFieldError(passwordWrapper, passwordError, "Verifica tu contraseña.");
    } else if (String(err.code || "").includes("user-not-found") || String(err.code || "").includes("email")) {
      setFieldError(emailWrapper, emailError, "Verifica tu correo.");
    }
  }
});

// ============ Efectos UI ============
document.querySelectorAll(".input input").forEach((input) => {
  input.addEventListener("focus", () => { input.parentElement.style.transform = "scale(1.01)"; });
  input.addEventListener("blur", () => { input.parentElement.style.transform = "scale(1)"; });
});
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (!header) return;
  header.style.boxShadow = window.scrollY > 10 ? "0 5px 20px rgba(0,0,0,.12)" : "0 2px 15px rgba(0,0,0,.06)";
});
submitBtn?.addEventListener("mouseenter", () => { submitBtn.style.transform = "translateY(-3px)"; });
submitBtn?.addEventListener("mouseleave", () => { submitBtn.style.transform = "translateY(0)"; });
