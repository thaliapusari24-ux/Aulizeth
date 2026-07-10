// Configuración de Firebase — Aulizeth
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB7A2YAmyJcbQyaqNzIZn3w-ad6e7jg5lM",
  authDomain: "aulizeth-cbb22.firebaseapp.com",
  projectId: "aulizeth-cbb22",
  storageBucket: "aulizeth-cbb22.firebasestorage.app",
  messagingSenderId: "533448832998",
  appId: "1:533448832998:web:3c03b20809d24722854827",
  measurementId: "G-QGM2LR5EV5",
};

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.error("[firebase-config] Error al inicializar Firebase:", err);
  alert("No se pudo conectar con el servidor. Recarga la página o intenta más tarde.");
}

export { app, auth, db };

/**
 * Traduce códigos de error de Firebase Auth a mensajes amigables en español.
 */
export function friendlyAuthError(error) {
  const code = (error && (error.code || error.message)) || "";
  const map = {
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/user-disabled": "Esta cuenta ha sido deshabilitada. Contacta al administrador.",
    "auth/user-not-found": "No existe una cuenta con ese correo. ¿Deseas registrarte?",
    "auth/wrong-password": "La contraseña es incorrecta. Inténtalo de nuevo.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/invalid-login-credentials": "Correo o contraseña incorrectos.",
    "auth/email-already-in-use": "Este correo ya está registrado. Inicia sesión.",
    "auth/weak-password": "La contraseña es muy débil. Usa al menos 6 caracteres.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e inténtalo otra vez.",
    "auth/network-request-failed": "Sin conexión a internet. Verifica tu red.",
    "auth/operation-not-allowed": "El método de acceso no está habilitado. Contacta al administrador.",
    "auth/popup-closed-by-user": "Cerraste la ventana antes de completar el proceso.",
    "auth/requires-recent-login": "Por seguridad, vuelve a iniciar sesión.",
    "auth/missing-password": "Debes ingresar una contraseña.",
    "auth/missing-email": "Debes ingresar un correo electrónico.",
  };
  for (const key of Object.keys(map)) {
    if (code.includes(key)) return map[key];
  }
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}
