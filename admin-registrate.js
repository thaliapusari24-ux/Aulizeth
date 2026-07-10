// Admin Register — Aulizeth
// Crea una cuenta con rol "admin" en Firestore, pero SOLO si el usuario
// proporciona el CÓDIGO DE INVITACIÓN correcto. Este código lo defines
// tú (el propietario) más abajo en la constante ADMIN_INVITE_CODE.
//
// Consejo de seguridad: además de este código, tus reglas de Firestore
// deben validar que solo un admin autenticado o el propio usuario
// durante el registro pueda escribir role="admin" en usuarios/{uid}.

import { auth, db, friendlyAuthError } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ⚠️ CAMBIA ESTE CÓDIGO por uno secreto tuyo. Compártelo solo con
// quienes vayan a ser administradores.
const ADMIN_INVITE_CODE = "AULIZETH-ADMIN-2026";

const form = document.getElementById("registerForm");
const nombreInput = document.getElementById("nombre");
const correoInput = document.getElementById("correo");
const passwordInput = document.getElementById("password");
const codigoInput = document.getElementById("codigo");
const togglePassword = document.getElementById("togglePassword");
const submitBtn = document.getElementById("submitBtn");
const originalBtnHTML = submitBtn ? submitBtn.innerHTML : "Registrar";
const formStatus = document.getElementById("formStatus");

const wrappers = {
  nombre: document.getElementById("nombreWrapper"),
  correo: document.getElementById("correoWrapper"),
  password: document.getElementById("passwordWrapper"),
  codigo: document.getElementById("codigoWrapper"),
};
const errors = {
  nombre: document.getElementById("nombreError"),
  correo: document.getElementById("correoError"),
  password: document.getElementById("passwordError"),
  codigo: document.getElementById("codigoError"),
};

togglePassword?.addEventListener("click", () => {
  if (!passwordInput) return;
  const hidden = passwordInput.type === "password";
  passwordInput.type = hidden ? "text" : "password";
  togglePassword.classList.toggle("fa-eye", !hidden);
  togglePassword.classList.toggle("fa-eye-slash", hidden);
});

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function setErr(k, m) { wrappers[k]?.classList.add("input-error"); if (errors[k]) errors[k].textContent = m; }
function clearErr(k) { wrappers[k]?.classList.remove("input-error"); if (errors[k]) errors[k].textContent = ""; }
function setStatus(m, kind) { if (!formStatus) return; formStatus.textContent = m || ""; formStatus.className = "form-status" + (kind ? " " + kind : ""); }
function setLoading(l) {
  if (!submitBtn) return;
  submitBtn.disabled = l;
  submitBtn.innerHTML = l ? `<i class="fa-solid fa-spinner fa-spin"></i> Creando cuenta...` : originalBtnHTML;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  Object.keys(errors).forEach(clearErr);
  setStatus("", "");

  const nombre = nombreInput.value.trim();
  const correo = correoInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const codigo = codigoInput.value.trim();

  let ok = true;
  if (nombre.length < 3) { setErr("nombre", "Ingresa tu nombre completo."); ok = false; }
  if (!validEmail(correo)) { setErr("correo", "Correo inválido."); ok = false; }
  if (password.length < 6) { setErr("password", "Mínimo 6 caracteres."); ok = false; }
  if (!codigo) { setErr("codigo", "Ingresa el código de invitación."); ok = false; }
  if (!ok) { setStatus("Revisa los campos marcados.", "error"); return; }

  if (codigo !== ADMIN_INVITE_CODE) {
    setErr("codigo", "Código incorrecto.");
    setStatus("El código de invitación no es válido. Contacta al propietario del sistema.", "error");
    return;
  }

  setLoading(true);
  try {
    const cred = await createUserWithEmailAndPassword(auth, correo, password);
    try { await updateProfile(cred.user, { displayName: nombre }); } catch {}

    // Guardar perfil con rol admin
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      uid: cred.user.uid,
      nombre,
      email: correo,
      role: "admin",
      nivel: "Administrador",
      fechaRegistro: serverTimestamp(),
    });

    submitBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Cuenta creada`;
    submitBtn.style.background = "#28a745";
    setStatus("¡Cuenta de administrador creada! Redirigiendo al panel...", "success");
    setTimeout(() => { window.location.href = "admin.html"; }, 1200);
  } catch (err) {
    console.error("[admin-registrate] Error:", err);
    setLoading(false);
    setStatus(friendlyAuthError(err), "error");
    if (String(err.code || "").includes("email-already-in-use")) {
      setErr("correo", "Este correo ya está registrado.");
    }
  }
});
