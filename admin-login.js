// Admin Login — Aulizeth (Firebase Auth + verificación de rol admin)
import { auth, db, friendlyAuthError } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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
const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "Entrar";

function togglePasswordVisibility() {
  if (!passwordInput || !togglePassword) return;
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.classList.toggle("fa-eye", !isHidden);
  togglePassword.classList.toggle("fa-eye-slash", isHidden);
}
togglePassword?.addEventListener("click", togglePasswordVisibility);

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function setFieldError(w, el, m) { w?.classList.add("input-error"); if (el) el.textContent = m; }
function clearFieldError(w, el) { w?.classList.remove("input-error"); if (el) el.textContent = ""; }
function setStatus(m, k) { if (!formStatus) return; formStatus.textContent = m || ""; formStatus.className = "form-status" + (k ? " " + k : ""); }
function setLoading(l) {
  if (!submitBtn) return;
  submitBtn.disabled = l;
  submitBtn.innerHTML = l ? `<i class="fa-solid fa-spinner fa-spin"></i> Verificando...` : originalBtnHTML;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  setStatus("", "");
  clearFieldError(emailWrapper, emailError);
  clearFieldError(passwordWrapper, passwordError);

  if (!email || !validateEmail(email)) { setFieldError(emailWrapper, emailError, "Correo inválido."); return; }
  if (!password || password.length < 6) { setFieldError(passwordWrapper, passwordError, "Contraseña muy corta."); return; }

  setLoading(true);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Verificar rol admin en Firestore
    let role = "student";
    try {
      const snap = await getDoc(doc(db, "usuarios", cred.user.uid));
      if (snap.exists() && snap.data().role === "admin") role = "admin";
    } catch (err) {
      console.warn("[admin-login] No se pudo leer rol:", err);
    }

    if (role !== "admin") {
      // Cerrar sesión inmediatamente — no es admin
      await signOut(auth);
      setLoading(false);
      setStatus("Esta cuenta no tiene privilegios de administrador. Usa el acceso de alumno.", "error");
      return;
    }

    submitBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Acceso concedido`;
    submitBtn.style.background = "#28a745";
    setStatus("Bienvenido, administrador. Redirigiendo al panel...", "success");
    setTimeout(() => { window.location.href = "admin.html"; }, 900);
  } catch (err) {
    console.error("[admin-login] Error:", err);
    setLoading(false);
    setStatus(friendlyAuthError(err), "error");
  }
});
