// ==============================
// Referencias
// ==============================

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


// ==============================
// Prellenar correo si viene desde el registro
// (registrate.js redirige aquí con ?correo=...)
// ==============================

(function prefillEmailFromRegister() {

    const params = new URLSearchParams(window.location.search);
    const correo = params.get("correo");

    if (correo) {
        emailInput.value = correo;
        passwordInput.focus();
    }

})();


// ==============================
// Mostrar / Ocultar contraseña
// (funciona con click y con teclado: Enter / Espacio)
// ==============================

function togglePasswordVisibility() {

    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    togglePassword.classList.toggle("fa-eye", !isHidden);
    togglePassword.classList.toggle("fa-eye-slash", isHidden);

    togglePassword.setAttribute(
        "aria-label",
        isHidden ? "Ocultar contraseña" : "Mostrar contraseña"
    );

}

togglePassword.addEventListener("click", togglePasswordVisibility);

togglePassword.addEventListener("keydown", (e) => {

    if (e.key === "Enter" || e.key === " ") {

        e.preventDefault();
        togglePasswordVisibility();

    }

});


// ==============================
// Utilidades de validación
// ==============================

function validateEmail(email) {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);

}

function setFieldError(wrapper, errorEl, message) {

    wrapper.classList.add("input-error");
    errorEl.textContent = message;

}

function clearFieldError(wrapper, errorEl) {

    wrapper.classList.remove("input-error");
    errorEl.textContent = "";

}

function validateEmailField() {

    const email = emailInput.value.trim();

    if (email === "") {
        setFieldError(emailWrapper, emailError, "Ingresa tu correo electrónico.");
        return false;
    }

    if (!validateEmail(email)) {
        setFieldError(emailWrapper, emailError, "Ingresa un correo válido.");
        return false;
    }

    clearFieldError(emailWrapper, emailError);
    return true;

}

function validatePasswordField() {

    const password = passwordInput.value.trim();

    if (password === "") {
        setFieldError(passwordWrapper, passwordError, "Ingresa tu contraseña.");
        return false;
    }

    if (password.length < 6) {
        setFieldError(passwordWrapper, passwordError, "Debe contener al menos 6 caracteres.");
        return false;
    }

    clearFieldError(passwordWrapper, passwordError);
    return true;

}


// Validar en tiempo real mientras el usuario escribe (una vez que ya intentó enviar)

let formSubmitted = false;

emailInput.addEventListener("input", () => {
    if (formSubmitted) validateEmailField();
});

passwordInput.addEventListener("input", () => {
    if (formSubmitted) validatePasswordField();
});


// ==============================
// Envío del formulario
// ==============================

form.addEventListener("submit", function (e) {

    e.preventDefault();

    formSubmitted = true;

    const isEmailValid = validateEmailField();
    const isPasswordValid = validatePasswordField();

    formStatus.textContent = "";
    formStatus.className = "form-status";

    if (!isEmailValid || !isPasswordValid) {

        formStatus.textContent = "Revisa los campos marcados en rojo.";
        formStatus.classList.add("error");
        return;

    }

    loginAnimation();

});


// ==============================
// Animación / simulación de login
//
// NOTA: Aquí se simula el proceso de autenticación.
// Para conectarlo a un backend real, reemplaza el
// setTimeout por una petición fetch a tu API, por ejemplo:
//
// fetch("https://tu-api.com/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password })
// })
// ==============================

// Página a la que se redirige tras iniciar sesión correctamente:
// el dashboard/aula del estudiante, no la página pública de inicio.
const REDIRECT_PAGE = "aula.html";

function loginAnimation() {

    const email = emailInput.value.trim();

    submitBtn.disabled = true;

    submitBtn.innerHTML =
        `<i class="fa-solid fa-spinner fa-spin"></i> Ingresando...`;

    setTimeout(() => {

        submitBtn.innerHTML =
            `<i class="fa-solid fa-circle-check"></i> Bienvenido`;

        submitBtn.style.background = "#28a745";

        formStatus.textContent = "Inicio de sesión exitoso. Redirigiendo...";
        formStatus.className = "form-status success";

        setTimeout(() => {

            window.location.href =
                `${REDIRECT_PAGE}?correo=${encodeURIComponent(email)}`;

        }, 1200);

    }, 1200);

}


// ==============================
// Efecto Focus Inputs
// ==============================

const inputs = document.querySelectorAll(".input input");

inputs.forEach((input) => {

    input.addEventListener("focus", () => {
        input.parentElement.style.transform = "scale(1.01)";
    });

    input.addEventListener("blur", () => {
        input.parentElement.style.transform = "scale(1)";
    });

});


// ==============================
// Animación Navbar
// ==============================

window.addEventListener("scroll", () => {

    const header = document.querySelector("header");

    if (window.scrollY > 10) {
        header.style.boxShadow = "0 5px 20px rgba(0,0,0,.12)";
    } else {
        header.style.boxShadow = "0 2px 15px rgba(0,0,0,.06)";
    }

});


// ==============================
// Hover del botón principal
// ==============================

submitBtn.addEventListener("mouseenter", () => {
    submitBtn.style.transform = "translateY(-3px)";
});

submitBtn.addEventListener("mouseleave", () => {
    submitBtn.style.transform = "translateY(0)";
});
