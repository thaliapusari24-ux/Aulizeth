// Registro — Aulizeth (Firebase Auth + Firestore)
import { auth, db, friendlyAuthError } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ============ Referencias ============
const form = document.getElementById("registerForm");
const nombreInput = document.getElementById("nombre");
const correoInput = document.getElementById("correo");
const nivelInput = document.getElementById("nivel");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const submitBtn = document.getElementById("submitBtn");
const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "Registrarme";
const formStatus = document.getElementById("formStatus");

const nombreWrapper = document.getElementById("nombreWrapper");
const correoWrapper = document.getElementById("correoWrapper");
const passwordWrapper = document.getElementById("passwordWrapper");
const nombreError = document.getElementById("nombreError");
const correoError = document.getElementById("correoError");
const nivelError = document.getElementById("nivelError");
const passwordError = document.getElementById("passwordError");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

// ============ Toggle contraseña ============
function togglePasswordVisibility() {
  if (!password || !togglePassword) return;
  const isHidden = password.type === "password";
  password.type = isHidden ? "text" : "password";
  togglePassword.classList.toggle("fa-eye", !isHidden);
  togglePassword.classList.toggle("fa-eye-slash", isHidden);
  togglePassword.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
}
togglePassword?.addEventListener("click", togglePasswordVisibility);
togglePassword?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePasswordVisibility(); }
});

// ============ Barra de seguridad ============
password?.addEventListener("input", () => {
  const value = password.value;
  let s = 0;
  if (value.length >= 6) s++;
  if (/[A-Z]/.test(value)) s++;
  if (/[0-9]/.test(value)) s++;
  if (/[^A-Za-z0-9]/.test(value)) s++;
  const cfg = [
    ["0%", "#d1d5db", "SIN CONTRASEÑA"],
    ["25%", "#ef4444", "DÉBIL"],
    ["50%", "#f59e0b", "MEDIA"],
    ["75%", "#3b82f6", "BUENA"],
    ["100%", "#22c55e", "FUERTE"],
  ][s];
  if (strengthBar && strengthText) {
    strengthBar.style.width = cfg[0];
    strengthBar.style.background = cfg[1];
    strengthText.innerHTML = cfg[2];
  }
  if (formSubmitted) validatePasswordField();
});

// ============ Validación ============
function validarCorreo(c) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c); }
function setFieldError(wrapper, errorEl, message) {
  wrapper?.classList.add("input-error");
  if (errorEl) errorEl.textContent = message;
}
function clearFieldError(wrapper, errorEl) {
  wrapper?.classList.remove("input-error");
  if (errorEl) errorEl.textContent = "";
}
function validateNombreField() {
  const v = nombreInput.value.trim();
  if (!v) { setFieldError(nombreWrapper, nombreError, "Ingresa tu nombre completo."); return false; }
  if (v.length < 3) { setFieldError(nombreWrapper, nombreError, "El nombre es demasiado corto."); return false; }
  clearFieldError(nombreWrapper, nombreError); return true;
}
function validateCorreoField() {
  const v = correoInput.value.trim();
  if (!v) { setFieldError(correoWrapper, correoError, "Ingresa tu correo electrónico."); return false; }
  if (!validarCorreo(v)) { setFieldError(correoWrapper, correoError, "Ingresa un correo válido."); return false; }
  clearFieldError(correoWrapper, correoError); return true;
}
function validateNivelField() {
  if (nivelInput.value === "") { setFieldError(nivelInput, nivelError, "Selecciona tu nivel con la computadora."); return false; }
  clearFieldError(nivelInput, nivelError); return true;
}
function validatePasswordField() {
  const v = password.value;
  if (!v) { setFieldError(passwordWrapper, passwordError, "Crea una contraseña."); return false; }
  if (v.length < 6) { setFieldError(passwordWrapper, passwordError, "Debe tener mínimo 6 caracteres."); return false; }
  clearFieldError(passwordWrapper, passwordError); return true;
}

let formSubmitted = false;
nombreInput?.addEventListener("input", () => { if (formSubmitted) validateNombreField(); });
correoInput?.addEventListener("input", () => { if (formSubmitted) validateCorreoField(); });
nivelInput?.addEventListener("change", () => { if (formSubmitted) validateNivelField(); });

// ============ Estado ============
function setStatus(message, kind) {
  if (!formStatus) return;
  formStatus.textContent = message || "";
  formStatus.className = "form-status" + (kind ? " " + kind : "");
}
function setLoading(loading) {
  if (!submitBtn) return;
  submitBtn.disabled = loading;
  submitBtn.innerHTML = loading
    ? '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...'
    : originalBtnHTML;
  submitBtn.style.background = "";
}

// ============ Envío ============
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  formSubmitted = true;

  const ok = validateNombreField() & validateCorreoField() & validateNivelField() & validatePasswordField();
  setStatus("", "");
  if (!ok) { setStatus("Revisa los campos marcados en rojo.", "error"); return; }

  if (!auth || !db) {
    setStatus("Servicio no disponible. Recarga la página.", "error");
    return;
  }

  setLoading(true);
  const nombre = nombreInput.value.trim();
  const correo = correoInput.value.trim().toLowerCase();
  const nivel = nivelInput.value;
  const clave = password.value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, correo, clave);

    try { await updateProfile(cred.user, { displayName: nombre }); }
    catch (err) { console.warn("[registro] No se pudo actualizar displayName:", err); }

    try {
      await setDoc(doc(db, "usuarios", cred.user.uid), {
        nombre,
        email: correo,
        nivel,
        role: "student",
        fechaRegistro: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[registro] No se pudo crear el perfil:", err);
      // La cuenta ya existe en Auth: continuamos aún sin doc.
    }

    submitBtn.style.background = "#22c55e";
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Registro Exitoso';
    setStatus("¡Bienvenido a Aulizeth! Redirigiendo a inicio de sesión...", "success");

    setTimeout(() => {
      window.location.href = `iniciarsesion.html?correo=${encodeURIComponent(correo)}`;
    }, 1200);
  } catch (err) {
    console.error("[registro] Error:", err);
    setLoading(false);
    const msg = friendlyAuthError(err);
    setStatus(msg, "error");
    const code = String(err.code || "");
    if (code.includes("email-already-in-use") || code.includes("invalid-email")) {
      setFieldError(correoWrapper, correoError, msg);
    } else if (code.includes("weak-password") || code.includes("password")) {
      setFieldError(passwordWrapper, passwordError, msg);
    }
  }
});

// ============ Efectos UI ============
document.querySelectorAll("input, select").forEach((campo) => {
  campo.addEventListener("focus", () => {
    if (campo.parentElement?.classList.contains("input")) campo.parentElement.style.transform = "scale(1.01)";
  });
  campo.addEventListener("blur", () => {
    if (campo.parentElement?.classList.contains("input")) campo.parentElement.style.transform = "scale(1)";
  });
});
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (!header) return;
  header.style.boxShadow = window.scrollY > 10 ? "0 8px 20px rgba(0,0,0,.12)" : "0 3px 15px rgba(0,0,0,.05)";
});
