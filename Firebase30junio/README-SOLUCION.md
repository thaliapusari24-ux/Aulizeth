# Aulizeth — Guía rápida para dejar el sitio 100% funcional

## ✅ Lo que corregí en el código

- **Bug de imágenes rotas**: en `index.html` las 5 fotos locales (`miss lizeth.png`, `miss lizeth2.png`, `tercera imagen.png`, `cuarta imagen.png`, `sexta imagen.png`) tenían rutas absolutas (`/imagenes/...`). Eso hace que la imagen no cargue si abres el archivo directamente en tu navegador o si el sitio no vive justo en la raíz de un dominio. Las cambié a rutas relativas (`imagenes/...`) y verifiqué con un servidor local que las 8 (HTML, CSS, JS y las 5 imágenes) cargan con código `200 OK`.
- Revisé **todo** `script.js` (2235 líneas) contra `index.html`: comparé cada `onclick`/`onchange` del HTML con las funciones definidas en JS (no falta ninguna) y cada `getElementById` con los `id` del HTML (todos existen; los que no aparecían son ids armados dinámicamente con un número, ej. `forgot-step-2`, que sí se generan en tiempo de ejecución).
- Verifiqué que `script.js` no tiene errores de sintaxis (`node --check`).
- No hay `id` duplicados en el HTML.

Con esto, la parte de **frontend/JavaScript está sólida**. Lo que queda pendiente para el "100% funcional" ya **no es código**, sino configuración de tus servicios externos (Firebase y EmailJS), que yo no puedo activar por ti porque requieren tu cuenta:

## 🔥 Paso 1: Firebase (login/registro de estudiantes + guardado de progreso)

Tu proyecto ya está conectado (`aulizeth-cbb22`). En la [Consola de Firebase](https://console.firebase.google.com/project/aulizeth-cbb22):

1. **Authentication → Sign-in method** → habilita **Correo electrónico/contraseña** si no está habilitado.
2. **Authentication → Settings → Authorized domains** → agrega el dominio donde vayas a publicar el sitio (por ejemplo `tu-proyecto.web.app`, `tu-proyecto.firebaseapp.com` o tu dominio propio). Sin esto, el login/registro fallará con error de dominio no autorizado.
3. **Firestore Database** → si aún no existe, créala (modo producción).
4. Sube las reglas de seguridad que incluí en `firestore.rules` (protegen que cada estudiante solo pueda leer/escribir su propio perfil):
   ```
   firebase deploy --only firestore:rules
   ```

## 📧 Paso 2: EmailJS (correos de notificación de registro/login)

En tu panel de [EmailJS](https://dashboard.emailjs.com/):
- Confirma que el **Service ID** (`service_vg1qrso`), el **Template ID** (`plantilla_rampx53`) y la **Public Key** (`DzEv00wSjSVNOZxM1`) sigan activos y pertenezcan a tu cuenta.
- Revisa que la plantilla tenga variables `{{user_name}}`, `{{user_email}}`, `{{message}}`, `{{passcode}}`, `{{time}}` (o los nombres que uses) para que el correo se vea bien.
- Si algo fue revocado o cambiaste de cuenta, actualiza esos 3 valores en `index.html` (busca `AULIZETH_EMAIL` y `emailjs.init`).

## 🤖 Paso 3 (opcional): Tutor con IA (Gemini)

Las funciones de "Tutor IA", "recomendador de cursos" y "traductor de conceptos" llaman a la API de Gemini usando la clave que cada visitante pegue en el banner superior ("Configuración de Inteligencia Artificial"). Esto es opcional: si nadie pone una clave, esas funciones muestran un mensaje de error controlado, pero el resto del sitio (catálogo, registro, login, cursos, panel admin) funciona igual.

## 🚀 Paso 4: Publicar el sitio

Si no lo has hecho antes en esta carpeta:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```
Ya dejé listos `firebase.json` y `.firebaserc` apuntando a tu proyecto `aulizeth-cbb22`.

## 🧪 Cómo probarlo ya mismo en tu computadora

No hace falta subir nada para ver el diseño y la navegación:
1. Descomprime el zip.
2. Abre una terminal dentro de la carpeta y ejecuta `python3 -m http.server 8000` (o usa la extensión "Live Server" de VS Code).
3. Entra a `http://localhost:8000` en tu navegador.

Con un servidor local así, ya verás el carrusel, el catálogo de cursos, y la navegación completa. El login/registro con Firebase solo funcionará al 100% una vez que agregues `localhost` (o el dominio que uses) a los **dominios autorizados** de Firebase Authentication (Paso 1.2).
