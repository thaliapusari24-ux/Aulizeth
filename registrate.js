//=========================================
// REFERENCIAS
//=========================================

const form = document.getElementById("registerForm");
const nombreInput = document.getElementById("nombre");
const correoInput = document.getElementById("correo");
const nivelInput = document.getElementById("nivel");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const submitBtn = document.getElementById("submitBtn");
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


//=========================================
// MOSTRAR / OCULTAR CONTRASEÑA
// (con soporte de teclado: Enter / Espacio)
//=========================================

function togglePasswordVisibility() {

    const isHidden = password.type === "password";

    password.type = isHidden ? "text" : "password";

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


//=========================================
// BARRA DE SEGURIDAD
//=========================================

password.addEventListener("input", () => {

    const value = password.value;

    let strength = 0;

    if (value.length >= 6) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^A-Za-z0-9]/.test(value)) strength++;

    switch (strength) {

        case 0:
            strengthBar.style.width = "0%";
            strengthText.innerHTML = "SIN CONTRASEÑA";
            strengthBar.style.background = "#d1d5db";
            break;

        case 1:
            strengthBar.style.width = "25%";
            strengthBar.style.background = "#ef4444";
            strengthText.innerHTML = "DÉBIL";
            break;

        case 2:
            strengthBar.style.width = "50%";
            strengthBar.style.background = "#f59e0b";
            strengthText.innerHTML = "MEDIA";
            break;

        case 3:
            strengthBar.style.width = "75%";
            strengthBar.style.background = "#3b82f6";
            strengthText.innerHTML = "BUENA";
            break;

        case 4:
            strengthBar.style.width = "100%";
            strengthBar.style.background = "#22c55e";
            strengthText.innerHTML = "FUERTE";
            break;

    }

    if (formSubmitted) validatePasswordField();

});


//=========================================
// UTILIDADES DE VALIDACIÓN
//=========================================

function validarCorreo(email) {

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);

}

function setFieldError(wrapper, errorEl, message) {

    if (wrapper) wrapper.classList.add("input-error");
    errorEl.textContent = message;

}

function clearFieldError(wrapper, errorEl) {

    if (wrapper) wrapper.classList.remove("input-error");
    errorEl.textContent = "";

}

function validateNombreField() {

    const nombre = nombreInput.value.trim();

    if (nombre.length < 4) {
        setFieldError(nombreWrapper, nombreError, "Ingresa tu nombre completo (mínimo 4 caracteres).");
        return false;
    }

    clearFieldError(nombreWrapper, nombreError);
    return true;

}

function validateCorreoField() {

    const correo = correoInput.value.trim();

    if (correo === "") {
        setFieldError(correoWrapper, correoError, "Ingresa tu correo electrónico.");
        return false;
    }

    if (!validarCorreo(correo)) {
        setFieldError(correoWrapper, correoError, "Ingresa un correo válido.");
        return false;
    }

    clearFieldError(correoWrapper, correoError);
    return true;

}

function validateNivelField() {

    if (nivelInput.value === "") {
        setFieldError(nivelInput, nivelError, "Selecciona tu nivel con la computadora.");
        return false;
    }

    clearFieldError(nivelInput, nivelError);
    return true;

}

function validatePasswordField() {

    const clave = password.value.trim();

    if (clave === "") {
        setFieldError(passwordWrapper, passwordError, "Crea una contraseña.");
        return false;
    }

    if (clave.length < 6) {
        setFieldError(passwordWrapper, passwordError, "Debe tener mínimo 6 caracteres.");
        return false;
    }

    clearFieldError(passwordWrapper, passwordError);
    return true;

}


// Validar en tiempo real una vez que ya se intentó enviar

let formSubmitted = false;

nombreInput.addEventListener("input", () => { if (formSubmitted) validateNombreField(); });
correoInput.addEventListener("input", () => { if (formSubmitted) validateCorreoField(); });
nivelInput.addEventListener("change", () => { if (formSubmitted) validateNivelField(); });


//=========================================
// VALIDAR Y ENVIAR FORMULARIO
//=========================================

form.addEventListener("submit", function (e) {

    e.preventDefault();

    formSubmitted = true;

    const nombreOk = validateNombreField();
    const correoOk = validateCorreoField();
    const nivelOk = validateNivelField();
    const passwordOk = validatePasswordField();

    formStatus.textContent = "";
    formStatus.className = "form-status";

    if (!nombreOk || !correoOk || !nivelOk || !passwordOk) {

        formStatus.textContent = "Revisa los campos marcados en rojo.";
        formStatus.classList.add("error");
        return;

    }

    registrar();

});


//=========================================
// ANIMACIÓN Y REDIRECCIÓN
//
// NOTA: Aquí se simula el registro. Para conectarlo
// a un backend real, reemplaza el setTimeout por un
// fetch a tu API, por ejemplo:
//
// fetch("https://tu-api.com/registro", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ nombre, correo, nivel, clave })
// })
//=========================================

function registrar() {

    const correo = correoInput.value.trim();

    submitBtn.disabled = true;

    submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Registrando...';

    setTimeout(() => {

        submitBtn.style.background = "#22c55e";

        submitBtn.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> Registro Exitoso';

        formStatus.textContent = "¡Bienvenido a Aulizeth! Redirigiendo a inicio de sesión...";
        formStatus.className = "form-status success";

        setTimeout(() => {

            // Después de registrarse, el flujo lógico es ir a
            // iniciar sesión con el correo ya escrito, para
            // que el estudiante entre a su Aula.
            window.location.href =
                `iniciarsesión.html?correo=${encodeURIComponent(correo)}`;

        }, 1400);

    }, 1500);

}


//=========================================
// EFECTO INPUTS
//=========================================

const inputs = document.querySelectorAll("input, select");

inputs.forEach(campo => {

    campo.addEventListener("focus", () => {

        if (campo.parentElement && campo.parentElement.classList.contains("input")) {
            campo.parentElement.style.transform = "scale(1.01)";
        }

    });

    campo.addEventListener("blur", () => {

        if (campo.parentElement && campo.parentElement.classList.contains("input")) {
            campo.parentElement.style.transform = "scale(1)";
        }

    });

});


//=========================================
// HEADER AL HACER SCROLL
//=========================================

window.addEventListener("scroll", () => {

    const header = document.querySelector("header");

    if (window.scrollY > 10) {
        header.style.boxShadow = "0 8px 20px rgba(0,0,0,.12)";
    } else {
        header.style.boxShadow = "0 3px 15px rgba(0,0,0,.05)";
    }

});
