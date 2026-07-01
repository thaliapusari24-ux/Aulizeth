document.addEventListener("DOMContentLoaded", () => {
    // Manejo de clicks en botones de inicio de curso
    const courseButtons = document.querySelectorAll(".btn-start");

    courseButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const courseName = button.parentElement.querySelector("h3").innerText;
            alert(`¡Pronto podrás iniciar el curso: ${courseName}!`);
        });
    });

    // Acción básica del banner de Registro
    const registerButtons = document.querySelectorAll(".btn-register, .btn-orange, .btn-white");
    
    registerButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            alert("Redirigiendo al formulario de registro...");
        });
    });
});
// === Script extraído de index.html ===
        
        // --- 1. CONFIGURACIÓN E INTERACCIÓN GENERAL DEL SISTEMA ---
        
        // Obtener la clave API de Gemini desde el elemento input
        function getGeminiApiKey() {
            return document.getElementById('apiKeyInput').value.trim() || "";
        }

        // Llamada de utilidad para llamadas a Gemini 3-flash con Exponential Backoff
        async function fetchGemini(payload) {
            const apiKey = getGeminiApiKey();
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
            
            let delay = 1000;
            const maxRetries = 3;

            for (let i = 0; i < maxRetries; i++) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        return await response.json();
                    }

                    if (response.status === 429) {
                        // Retroceso exponencial en Throttling
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= 2;
                        continue;
                    }

                    throw new Error(`Error de Gemini: ${response.status}`);
                } catch (error) {
                    if (i === maxRetries - 1) throw error;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                }
            }
        }


        // Sistema de Rutas Simple (Toggle entre vistas)
        function showSection(sectionId) {
            const sections = ['view-home', 'view-about', 'view-courses', 'view-contact', 'view-register', 'view-login', 'view-dashboard', 'view-course-content', 'view-intranet', 'view-admin-register', 'view-admin-login', 'view-admin-panel'];

            sections.forEach(s => {
                const el = document.getElementById(s);
                if (el) el.classList.add('hidden');
            });
            const activeEl = document.getElementById(sectionId);
            if (activeEl) activeEl.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (sectionId === 'view-admin-panel') {
                if (!isAdmin()) {
                    triggerNotification('Inicia sesión como administrador.', 'info');
                    showSection('view-admin-login');
                    return;
                }
                renderAdminCoursesList();
                renderAdminPendingList();
                resetAdminCourseForm();
            }
            if (sectionId === 'view-admin-login' && !getAdminAccount()) {
                showSection('view-admin-register');
                return;
            }
        }

        // Menú Móvil Desplegable
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('hidden');
        }

        // --- 2. SISTEMA DE CARRUSEL DE ALTA FIDELIDAD ---
        let currentSlide = 0;
        let slideInterval;

        function startCarouselTimer() {
            clearInterval(slideInterval);
            slideInterval = setInterval(() => {
                nextSlide();
            }, 5000);
        }

        function updateCarouselUI() {
            const slides = document.querySelectorAll('.carousel-item');
            const dots = document.querySelectorAll('.carousel-dot');

            slides.forEach((slide, i) => {
                if (i === currentSlide) {
                    slide.classList.remove('opacity-0');
                    slide.classList.add('opacity-100', 'z-10');
                } else {
                    slide.classList.remove('opacity-100', 'z-10');
                    slide.classList.add('opacity-0');
                }
            });

            dots.forEach((dot, i) => {
                if (i === currentSlide) {
                    dot.className = "carousel-dot w-5 h-2.5 rounded-full bg-brandAccent transition-all";
                } else {
                    dot.className = "carousel-dot w-2.5 h-2.5 rounded-full bg-white/40 transition-all";
                }
            });
        }

        function nextSlide() {
            const slides = document.querySelectorAll('.carousel-item');
            currentSlide = (currentSlide + 1) % slides.length;
            updateCarouselUI();
            startCarouselTimer();
        }

        function prevSlide() {
            const slides = document.querySelectorAll('.carousel-item');
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            updateCarouselUI();
            startCarouselTimer();
        }

        function goToSlide(index) {
            currentSlide = index;
            updateCarouselUI();
            startCarouselTimer();
        }

        // Inicializar carrusel al cargar la página
        startCarouselTimer();

        // --- 3. ALMACENAMIENTO DE CLAVE API Erussellespinoza085@gmail.comN NAVEGADOR ---
        function saveApiKey() {
            const key = getGeminiApiKey();
            if (key) {
                localStorage.setItem('aulizeth_gemini_key', key);
                triggerNotification("¡API Key guardada con éxito en tu navegador!", "success");
            } else {
                localStorage.removeItem('aulizeth_gemini_key');
                triggerNotification("Clave eliminada. Se usará la clave del entorno.", "info");
            }
        }

        // Cargar clave guardada
        window.addEventListener('DOMContentLoaded', () => {
            const savedKey = localStorage.getItem('aulizeth_gemini_key');
            if (savedKey) {
                document.getElementById('apiKeyInput').value = savedKey;
            }
        });

        // --- SISTEMA DE ALERTA NOTIFICACIÓN PERSONALIZADA ---
        function triggerNotification(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = "p-3.5 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 bg-white transform translate-y-2 opacity-0 transition-all duration-350 pointer-events-auto max-w-sm";
            
            let icon = '';
            if (type === 'success') {
                toast.classList.add('border-emerald-100', 'text-emerald-800');
                icon = '<i class="fa-solid fa-circle-check text-emerald-500 text-sm"></i>';
            } else if (type === 'error') {
                toast.classList.add('border-rose-100', 'text-rose-800');
                icon = '<i class="fa-solid fa-circle-xmark text-rose-500 text-sm"></i>';
            } else {
                toast.classList.add('border-blue-100', 'text-brandBlue');
                icon = '<i class="fa-solid fa-circle-info text-brandLightBlue text-sm"></i>';
            }

            toast.innerHTML = `${icon} <span class="leading-normal">${message}</span>`;
            container.appendChild(toast);

            // Animar entrada
            setTimeout(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            }, 10);

            // Salida automática
            setTimeout(() => {
                toast.classList.add('translate-y-2', 'opacity-0');
                setTimeout(() => toast.remove(), 400);
            }, 4500);
        }


        // --- 3A. CONTROL DE FORMULARIOS INTERACTIVOS Y SESIÓN ---
        
        // Base de Datos en Memoria para simulación de Estudiante
        let studentData = {
            uid: null,
            fullName: "Usuario de Prueba",
            email: "maria.lopez@correo.com",
            experience: "Ninguno: Es mi primera vez tocando una computadora",
            customInterests: "Aprender lo básico para conversar con mi familia por WhatsApp",
            enrollments: [],
            progress: {}
        };

        // Mostrar u ocultar contraseñas
        function togglePasswordVisibility(inputId) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
            } else {
                input.type = 'password';
            }
        }

        // Validar fortaleza de la clave al escribir
        function checkPasswordStrength() {
            const pwd = document.getElementById('reg-password').value;
            const bar = document.getElementById('pwd-strength-bar');
            const txt = document.getElementById('pwd-strength-txt');

            if (!pwd) {
                bar.style.width = '0%';
                txt.innerText = 'Sin Contraseña';
                txt.className = 'text-[9px] font-bold uppercase text-slate-400';
                return;
            }

            let score = 0;
            if (pwd.length >= 6) score++;
            if (/[A-Z]/.test(pwd)) score++;
            if (/[0-9]/.test(pwd)) score++;

            if (score === 1) {
                bar.style.width = '33%';
                bar.className = 'h-full bg-rose-500 transition-all';
                txt.innerText = 'Seguridad: Baja';
                txt.className = 'text-[9px] font-bold uppercase text-rose-500';
            } else if (score === 2) {
                bar.style.width = '66%';
                bar.className = 'h-full bg-amber-500 transition-all';
                txt.innerText = 'Seguridad: Media';
                txt.className = 'text-[9px] font-bold uppercase text-amber-500';
            } else {
                bar.style.width = '100%';
                bar.className = 'h-full bg-emerald-500 transition-all';
                txt.innerText = 'Seguridad: Excelente';
                txt.className = 'text-[9px] font-bold uppercase text-emerald-500';
            }
        }

        // ============================================================
        // SISTEMA DE AUTENTICACIÓN DE ESTUDIANTES CON FIREBASE
        // ============================================================
        // - Las cuentas de estudiantes se crean con Firebase Authentication
        //   (correo + contraseña), así que funcionan desde cualquier
        //   dispositivo con el mismo correo y clave.
        // - El perfil de cada estudiante (nombre, nivel, cursos inscritos,
        //   progreso de lecciones) se guarda en Firestore, en la colección
        //   "users", documento con id = uid del usuario de Firebase Auth.
        // - Además se envía una notificación real por correo a la dueña
        //   del sitio mediante EmailJS (igual que antes).
        // ============================================================

        function _genPasscode() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }
        function _expireTime(mins) {
            const d = new Date(Date.now() + mins * 60000);
            return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        }

        // Hash ligero de contraseña, usado solo por el panel de Administrador
        // (que sigue funcionando con localStorage, sin cambios).
        async function _hashPassword(pwd) {
            const enc = new TextEncoder().encode(pwd);
            const buf = await crypto.subtle.digest('SHA-256', enc);
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
        }

        // Traduce los códigos de error de Firebase a mensajes amigables
        function _firebaseErrorMessage(err) {
            const map = {
                'auth/email-already-in-use': 'Este correo ya está registrado. Inicia sesión.',
                'auth/invalid-email': 'Ese correo no parece válido. Revísalo, por favor.',
                'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
                'auth/user-not-found': 'Este correo no está registrado. Regístrate primero.',
                'auth/wrong-password': 'Contraseña incorrecta. Intenta de nuevo.',
                'auth/invalid-credential': 'Correo o contraseña incorrectos.',
                'auth/too-many-requests': 'Demasiados intentos. Espera un momento e intenta de nuevo.',
                'auth/network-request-failed': 'Sin conexión a internet. Revisa tu red e intenta de nuevo.'
            };
            return map[err && err.code] || 'Ocurrió un error inesperado. Intenta de nuevo.';
        }

        // Envía un correo vía EmailJS. Devuelve una promesa.
        function _sendEmail(params) {
            const cfg = window.AULIZETH_EMAIL;
            if (!window.emailjs || !cfg) {
                console.warn('EmailJS no está disponible.');
                return Promise.reject('EmailJS no disponible');
            }
            // Incluimos varias variantes de los nombres de variables para
            // que funcione tanto si tu plantilla usa {{passcode}} / {{time}}
            // como {{código de acceso}} / {{tiempo}}.
            const fullParams = Object.assign({
                to_email: cfg.ownerEmail,
                reply_to: params.user_email || cfg.ownerEmail,
                user_name: params.user_name || 'Estudiante',
                user_email: params.user_email || '',
                message: params.message || '',
                passcode: params.passcode || '',
                'código de acceso': params.passcode || '',
                time: params.time || '',
                'tiempo': params.time || ''
            }, params);
            return emailjs.send(cfg.serviceId, cfg.templateId, fullParams);
        }

        // Carga (o crea si no existe) el documento de perfil del estudiante en Firestore
        // y lo vuelca sobre la variable studentData usada por el resto de la app.
        async function _loadStudentProfile(user, extra) {
            extra = extra || {};
            const docRef = firebaseDb.collection('users').doc(user.uid);
            const snap = await docRef.get();
            let data = snap.exists ? snap.data() : null;
            if (!data) {
                data = {
                    fullName: extra.fullName || user.displayName || 'Estudiante',
                    email: user.email,
                    experience: extra.experience || '',
                    enrollments: [],
                    progress: {},
                    createdAt: new Date().toISOString()
                };
                await docRef.set(data);
            }
            studentData = {
                uid: user.uid,
                fullName: data.fullName || 'Estudiante',
                email: user.email,
                experience: data.experience || '',
                enrollments: data.enrollments || [],
                progress: data.progress || {}
            };
        }

        // -------- REGISTRO REAL (Firebase Auth + Firestore) --------
        async function handleRegistration(event) {
            event.preventDefault();

            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim().toLowerCase();
            const experience = document.getElementById('reg-experience').value;
            const password = document.getElementById('reg-password').value;

            if (password.length < 6) {
                triggerNotification("La contraseña debe tener al menos 6 caracteres.", "error");
                return;
            }

            triggerNotification("Creando tu cuenta de forma segura...", "info");

            try {
                const cred = await firebaseAuth.createUserWithEmailAndPassword(email, password);
                const user = cred.user;
                await user.updateProfile({ displayName: name });
                await _loadStudentProfile(user, { fullName: name, experience: experience });

                // Enviar correo de notificación a la dueña (no bloquea el registro si falla)
                const passcode = _genPasscode();
                try {
                    await _sendEmail({
                        user_name: name,
                        user_email: email,
                        passcode: passcode,
                        time: _expireTime(15),
                        message: `🎉 NUEVO REGISTRO en Aulizeth\n\nNombre: ${name}\nCorreo: ${email}\nNivel: ${experience}\nFecha: ${new Date().toLocaleString('es-PE')}\n\nCódigo de bienvenida: ${passcode}`
                    });
                    triggerNotification(`¡Registro exitoso! Bienvenido/a, ${name}. Correo enviado.`, "success");
                } catch (err) {
                    console.error('EmailJS error:', err);
                    triggerNotification(`Cuenta creada, pero no se pudo enviar el correo de notificación.`, "info");
                }

                loginSuccessful();
            } catch (err) {
                console.error('Firebase registro error:', err);
                triggerNotification(_firebaseErrorMessage(err), "error");
            }
        }

        // -------- LOGIN REAL (Firebase Auth + Firestore) --------
        async function handleLogin(event) {
            event.preventDefault();

            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            triggerNotification("Verificando tus credenciales...", "info");

            try {
                const cred = await firebaseAuth.signInWithEmailAndPassword(email, password);
                await _loadStudentProfile(cred.user);

                // Notificación real por correo (no bloquea el login si falla)
                const passcode = _genPasscode();
                try {
                    await _sendEmail({
                        user_name: studentData.fullName,
                        user_email: studentData.email,
                        passcode: passcode,
                        time: _expireTime(15),
                        message: `🔐 INICIO DE SESIÓN en Aulizeth\n\nUsuario: ${studentData.fullName}\nCorreo: ${studentData.email}\nFecha: ${new Date().toLocaleString('es-PE')}\n\nCódigo de verificación: ${passcode}`
                    });
                    triggerNotification(`¡Bienvenido/a de nuevo, ${studentData.fullName}!`, "success");
                } catch (err) {
                    console.error('EmailJS error:', err);
                    triggerNotification(`Sesión iniciada (sin envío de correo).`, "info");
                }
                loginSuccessful();
            } catch (err) {
                console.error('Firebase login error:', err);
                triggerNotification(_firebaseErrorMessage(err), "error");
            }
        }

        // Cerrar sesión
        function logoutStudent() {
            firebaseAuth.signOut().catch(err => console.error('Error al cerrar sesión:', err));

            // Restaurar header público, ocultar intranet
            const publicHeader = document.querySelector('header:not(#intranet-header)');
            if (publicHeader) publicHeader.classList.remove('hidden');
            const intranetHeader = document.getElementById('intranet-header');
            if (intranetHeader) intranetHeader.classList.add('hidden');

            document.getElementById('nav-visitor-actions').classList.remove('hidden');
            document.getElementById('nav-student-actions').classList.add('hidden');
            showSection('view-home');
            triggerNotification("Sesión cerrada correctamente.", "info");
        }

        // Si el estudiante ya había iniciado sesión en este navegador (Firebase
        // mantiene la sesión activa entre recargas), lo llevamos directo a su intranet.
        let _authAutoLoginHandled = false;
        firebaseAuth.onAuthStateChanged(async (user) => {
            if (_authAutoLoginHandled) return;
            _authAutoLoginHandled = true;
            if (user) {
                try {
                    await _loadStudentProfile(user);
                    document.getElementById('nav-visitor-actions').classList.add('hidden');
                    document.getElementById('nav-student-actions').classList.remove('hidden');
                    loginSuccessful();
                } catch (err) {
                    console.error('Error al restaurar sesión:', err);
                }
            }
        });


        // --- 3B. SISTEMA DE CURSOS Y DETALLE ---

        const CATEGORY_LABELS = {
            inicial: 'Computación Inicial',
            ofimatica: 'Ofimática Clave',
            comunicacion: 'Comunicación',
            seguridad: 'Seguridad Digital'
        };

        const DEFAULT_VIDEO = 'https://www.youtube.com/embed/1RS4E2bh_CH';

        function buildLessonFromTitle(title, index) {
            const isVideo = index % 2 === 0;
            return {
                title,
                type: isVideo ? 'video' : 'form',
                videoUrl: isVideo ? DEFAULT_VIDEO : '',
                description: title,
                formQuestions: isVideo ? [] : [{
                    question: `¿Qué aprendiste en: "${title}"?`,
                    options: ['Lo practicé y lo entendí', 'Necesito repasar este tema'],
                    correctIndex: 0
                }]
            };
        }

        // Por el momento solo se muestran 3 cursos al público. El resto (o nuevos)
        // se agregan poco a poco desde el Panel de Administrador (botón "Administrador" del nav).
        const DEFAULT_COURSES = [
            {
                id: 'c1', category: 'inicial', categoryLabel: 'Computación Inicial',
                title: 'Fundamentos de Computación e Internet',
                description: 'Aprende las partes físicas de la computadora de manera segura, a usar el ratón (mouse), el teclado y a navegar en internet buscando tus recetas, videos o noticias favoritas.',
                longDescription: 'Este curso está diseñado con un lenguaje 100% amigable para personas que jamás han tocado una computadora.',
                lessons: 5, duration: '4 horas', price: 'Gratuito', rating: 4.9, reviews: '1,240 alumnos',
                icon: 'fa-desktop', bgColor: 'bg-blue-600', imageUrl: '',
                syllabus: ['¿Cómo encender y apagar correctamente tu computadora?', 'El uso del mouse (ratón)', 'Conociendo tu teclado', 'Abrir el navegador de internet', 'Buscar videos en YouTube paso a paso']
            },
            {
                id: 'c2', category: 'ofimatica', categoryLabel: 'Ofimática Clave',
                title: 'Microsoft Word y Escritura Digital Básica',
                description: 'Aprende a redactar cartas, listas y hojas de vida. Guarda documentos ordenadamente en carpetas.',
                longDescription: 'Escribe de manera limpia y presentable con las herramientas principales de Word.',
                lessons: 5, duration: '5 horas', price: 'Gratuito', rating: 4.8, reviews: '850 alumnos',
                icon: 'fa-file-word', bgColor: 'bg-indigo-600', imageUrl: '',
                syllabus: ['¿Qué es Microsoft Word?', 'Escribir y corregir texto', 'Cambiar color y tamaño de letras', 'Guardar tu documento', 'Imprimir tu primera carta']
            },
            {
                id: 'c4', category: 'comunicacion', categoryLabel: 'Comunicación',
                title: 'Correo Electrónico y WhatsApp Web desde Cero',
                description: 'Crea tu primer correo, envía mensajes con fotos y maneja WhatsApp desde la computadora.',
                longDescription: 'Aprende a enviar cartas electrónicas y vincular tu teléfono con tu PC.',
                lessons: 5, duration: '3 horas', price: 'Gratuito', rating: 4.9, reviews: '2,100 alumnos',
                icon: 'fa-envelope-open-text', bgColor: 'bg-purple-600', imageUrl: '',
                syllabus: ['Creación de correo en Gmail', 'Leer y redactar correos', 'Adjuntar fotos a un correo', 'Abrir WhatsApp Web', 'Enviar mensajes desde la PC']
            }
        ];

        // Cursos adicionales listos para agregarse desde el Panel de Administrador
        // (no aparecen todavía en el catálogo público; usa "Agregar existente" o cópialos
        // en el formulario del panel cuando quieras publicarlos).
        const PENDING_COURSES_LIBRARY = [
            {
                id: 'c3', category: 'ofimatica', categoryLabel: 'Ofimática Clave',
                title: 'Microsoft Excel Básico y Control de Gastos',
                description: 'Lleva las cuentas de tu hogar o pequeño emprendimiento en tablas sencillas.',
                longDescription: 'Crea tablas, ingresa ingresos y gastos, y haz que la computadora sume automáticamente.',
                lessons: 5, duration: '6 horas', price: 'Gratuito', rating: 4.7, reviews: '920 alumnos',
                icon: 'fa-file-excel', bgColor: 'bg-emerald-600', imageUrl: '',
                syllabus: ['Conociendo la cuadrícula de Excel', 'Escribir en las celdas', 'Tu primera suma automática', 'Plantilla de gastos familiares', 'Dar formato con colores']
            },
            {
                id: 'c5', category: 'seguridad', categoryLabel: 'Seguridad Digital',
                title: 'Seguridad Digital Básica: Evita Estafas',
                description: 'Reconoce correos falsos, mensajes sospechosos y navega seguro.',
                longDescription: 'Identifica páginas peligrosas, crea claves seguras y navega sin temor.',
                lessons: 5, duration: '4 horas', price: 'Gratuito', rating: 4.9, reviews: '640 alumnos',
                icon: 'fa-shield-halved', bgColor: 'bg-rose-600', imageUrl: '',
                syllabus: ['¿Qué es un virus informático?', 'Contraseñas seguras', 'Identificar ofertas falsas', 'Comprar de forma segura', 'Alertas sospechosas']
            },
            {
                id: 'c6', category: 'comunicacion', categoryLabel: 'Servicios del Estado',
                title: 'Trámites en Línea y Servicios Digitales',
                description: 'Sacar citas de salud, pagar servicios en línea y consultas gubernamentales.',
                longDescription: 'Utiliza portales web oficiales para trámites desde tu hogar.',
                lessons: 5, duration: '3 horas', price: 'Gratuito', rating: 4.6, reviews: '430 alumnos',
                icon: 'fa-landmark', bgColor: 'bg-amber-600', imageUrl: '',
                syllabus: ['Páginas web del Gobierno', 'Descargar documentos PDF', 'Pagos de agua, luz y teléfono', 'Citas médicas en línea', 'Proteger datos personales']
            }
        ];

        function initDefaultLessonDetails(course) {
            if (!course.lessonDetails || course.lessonDetails.length === 0) {
                course.lessonDetails = (course.syllabus || []).map((t, i) => buildLessonFromTitle(t, i));
            }
            course.lessons = course.lessonDetails.length;
            course.price = 'Gratuito';
            return course;
        }

        function getCoursesData() {
            try {
                const stored = localStorage.getItem('aulizeth_courses');
                if (stored) {
                    let parsed = JSON.parse(stored);
                    let needsSave = false;
                    parsed = parsed.map(c => {
                        const hadLessons = c.lessonDetails && c.lessonDetails.length > 0;
                        const result = initDefaultLessonDetails({ ...c });
                        if (!hadLessons) needsSave = true;
                        if (c.price !== 'Gratuito') needsSave = true;
                        return result;
                    });
                    if (needsSave) saveCoursesData(parsed);
                    return parsed;
                }
            } catch (e) { /* ignore */ }
            const defaults = DEFAULT_COURSES.map(c => initDefaultLessonDetails({ ...c }));
            localStorage.setItem('aulizeth_courses', JSON.stringify(defaults));
            return defaults;
        }

        function saveCoursesData(courses) {
            localStorage.setItem('aulizeth_courses', JSON.stringify(courses));
        }

        let coursesData = getCoursesData();
        let selectedCourseId = '';
        let currentLessonIndex = null;
        let adminRecoveryState = { code: null, email: '' };

        // Guarda un campo del perfil del estudiante en Firestore (silencioso si es invitado)
        function _persistStudentField(field, value) {
            if (!studentData.uid || !window.firebaseDb) return;
            firebaseDb.collection('users').doc(studentData.uid).set({ [field]: value }, { merge: true })
                .catch(err => console.error('Error guardando en Firestore:', err));
        }

        function getEnrollments() {
            return studentData.enrollments || [];
        }

        function saveEnrollments(list) {
            studentData.enrollments = list;
            _persistStudentField('enrollments', list);
        }

        function enrollInCourse(courseId) {
            const course = coursesData.find(c => c.id === courseId);
            if (!course) return;
            const enrollments = getEnrollments();
            if (!enrollments.includes(courseId)) {
                enrollments.push(courseId);
                saveEnrollments(enrollments);
            }
            triggerNotification(`¡Inscripción exitosa en "${course.title}"! Todos los cursos son gratuitos.`, 'success');
            renderEnrolledCourses();
            renderIntranetCatalog();
        }

        function renderEnrolledCourses() {
            const container = document.getElementById('enrolled-courses-list');
            if (!container) return;
            const enrollments = getEnrollments();
            if (enrollments.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Aún no estás inscrito en ningún curso. Explora el catálogo e inscríbete gratis.</p>';
                return;
            }
            container.innerHTML = enrollments.map(id => {
                const c = coursesData.find(x => x.id === id);
                if (!c) return '';
                const prog = getLessonProgress(id);
                const lessons = getCourseLessonDetails(c);
                const pct = lessons.length ? Math.round((Object.values(prog).filter(p => p && p.complete).length / lessons.length) * 100) : 0;
                return `
                    <div class="flex items-center justify-between p-4 bg-slate-50 border border-slate-150 rounded-xl hover:border-brandLightBlue transition-all">
                        <div class="flex items-center gap-3">
                            <div class="${c.bgColor} w-10 h-10 rounded-lg flex items-center justify-center text-white"><i class="fa-solid ${c.icon}"></i></div>
                            <div>
                                <h4 class="font-bold text-xs text-slate-800">${c.title}</h4>
                                <p class="text-[10px] text-slate-500">${pct}% completado · Gratuito</p>
                            </div>
                        </div>
                        <button onclick="openCourseContent('${c.id}')" class="bg-brandLightBlue hover:bg-brandBlue text-white font-bold text-[10px] px-4 py-2 rounded-xl transition-all">Continuar</button>
                    </div>`;
            }).join('');
        }

        // Renderizar Cursos en la Grilla
        function renderCatalog(coursesList) {
            const grid = document.getElementById('catalog-grid');
            grid.innerHTML = '';

            if (coursesList.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-1 md:col-span-3 text-center py-12 space-y-2">
                        <i class="fa-solid fa-folder-open text-slate-300 text-5xl"></i>
                        <p class="text-xs text-slate-500 font-semibold">No encontramos cursos que coincidan con tu búsqueda.</p>
                    </div>
                `;
                return;
            }

            const enrolled = getEnrollments();
            coursesList.forEach(course => {
                const card = document.createElement('div');
                card.className = "bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-150 flex flex-col justify-between hover:shadow-md transition-all";
                const headerContent = course.imageUrl
                    ? `<img src="${course.imageUrl}" alt="${course.title}" class="w-full h-36 object-cover">`
                    : `<div class="${course.bgColor} text-white h-36 flex items-center justify-center p-6 text-center relative">
                            <i class="fa-solid ${course.icon} text-5xl opacity-80"></i>
                            <span class="absolute top-3 right-3 bg-emerald-500 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded-lg">Gratis</span>
                       </div>`;
                const isEnrolled = enrolled.includes(course.id);
                card.innerHTML = `
                    <div>
                        ${headerContent}
                        <div class="p-6 space-y-3">
                            <span class="text-[10px] font-bold text-brandLightBlue bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">${course.categoryLabel}</span>
                            <h3 class="font-bold text-sm text-slate-800 line-clamp-1">${course.title}</h3>
                            <p class="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">${course.description}</p>
                            <div class="flex items-center gap-1.5 text-xs text-amber-500 pt-1">
                                <i class="fa-solid fa-star"></i>
                                <span class="font-bold text-slate-700">${course.rating}</span>
                                <span class="text-slate-400 text-[10px]">(${course.reviews})</span>
                            </div>
                        </div>
                    </div>
                    <div class="px-6 pb-6 pt-3 border-t border-slate-50 space-y-2">
                        <span class="text-[11px] font-bold text-emerald-600"><i class="fa-solid fa-gift"></i> Gratuito · ${course.lessons} lecciones</span>
                        <div class="flex gap-2">
                            <button onclick="openCourseModal('${course.id}')" class="flex-1 border border-brandLightBlue text-brandLightBlue hover:bg-blue-50 font-bold text-[10px] uppercase tracking-wide px-3 py-2 rounded-xl transition-all">
                                Ver más detalles
                            </button>
                            <button onclick="enrollInCourse('${course.id}')" class="flex-1 ${isEnrolled ? 'bg-slate-200 text-slate-500' : 'bg-brandLightBlue hover:bg-brandBlue text-white'} font-bold text-[10px] uppercase tracking-wide px-3 py-2 rounded-xl shadow-sm transition-all">
                                ${isEnrolled ? 'Inscrito' : 'Inscribirse'}
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // Filtrar Catálogo por Botones de Categorías
        function filterCatalog(category) {
            coursesData = getCoursesData();
            const filters = ['all', 'inicial', 'ofimatica', 'comunicacion', 'seguridad'];
            filters.forEach(f => {
                const btn = document.getElementById(`filter-${f}`);
                if (f === category) {
                    btn.className = "px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-brandBlue text-white shadow-sm";
                } else {
                    btn.className = "px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50";
                }
            });

            if (category === 'all') {
                renderCatalog(coursesData);
            } else {
                const filtered = coursesData.filter(c => c.category === category);
                renderCatalog(filtered);
            }
        }

        // Buscador de Cursos Directo
        function searchCatalog() {
            coursesData = getCoursesData();
            const query = document.getElementById('courseSearchInput').value.toLowerCase().trim();
            const filtered = coursesData.filter(c => 
                c.title.toLowerCase().includes(query) || 
                c.description.toLowerCase().includes(query) ||
                c.categoryLabel.toLowerCase().includes(query)
            );
            renderCatalog(filtered);
        }

        // RECOMENDACIÓN INTELIGENTE DE CURSOS CON GEMINI API
        async function getAICourseRecommendation() {
            const prompt = document.getElementById('courseAIPrompt').value.trim();
            const output = document.getElementById('aiRecommendationOutput');
            const btn = document.getElementById('recommendCourseBtn');

            if (!prompt) {
                triggerNotification("Por favor describe brevemente qué te gustaría lograr hoy.", "info");
                return;
            }

            output.classList.remove('hidden');
            output.className = "p-4 rounded-xl text-xs leading-relaxed border bg-purple-50/50 border-purple-100 text-slate-700 space-y-3 font-medium italic";
            output.innerHTML = `
                <div class="flex items-center gap-1.5 text-purple-700">
                    <i class="fa-solid fa-spinner animate-spin"></i>
                    <span>Tutor de IA analizando tu perfil y comparando nuestro catálogo...</span>
                </div>
            `;
            btn.disabled = true;

            const systemPrompt = `Eres un asesor académico de la escuela Aulizeth de computación básica. El usuario te contará sus miedos, anhelos o lo que quiere lograr (ej. "quiero escribir una solicitud de trabajo", "quiero mandarle fotos a mis nietos").
Tu catálogo oficial tiene estos 6 cursos:
1. id: c1 | Fundamentos de Computación e Internet
2. id: c2 | Microsoft Word y Escritura Digital Básica
3. id: c3 | Microsoft Excel Básico y Control de Gastos
4. id: c4 | Correo Electrónico y WhatsApp Web desde Cero
5. id: c5 | Seguridad Digital Básica: Evita Estafas
6. id: c6 | Trámites en Línea y Servicios Digitales

Tu misión es recomendar el curso que mejor se adapte a su solicitud. Sé sumamente dulce, paciente, empático y alentador. Explícale en un formato amigable por qué ese curso específico es perfecto para él y cómo le facilitará la vida. Responde obligatoriamente en formato JSON rígido que incluya las propiedades 'courseId', 'explanation' (explicación breve y amigable), 'reasons' (una lista de por qué le conviene en viñetas sencillas) y 'encouragement' (una frase de aliento tierna).`;

            const payload = {
                contents: [{ parts: [{ text: `Deseo lo siguiente: "${prompt}". Recomiéndame el mejor curso.` }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "courseId": { "type": "STRING" },
                            "explanation": { "type": "STRING" },
                            "reasons": {
                                "type": "ARRAY",
                                "items": { "type": "STRING" }
                            },
                            "encouragement": { "type": "STRING" }
                        },
                        "required": ["courseId", "explanation", "reasons", "encouragement"]
                    }
                }
            };

            try {
                const response = await fetchGemini(payload);
                const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!resultText) throw new Error("No se obtuvo respuesta del recomendador.");

                const data = JSON.parse(resultText);
                const courseMatched = coursesData.find(c => c.id === data.courseId) || coursesData[0];

                let reasonsHTML = '';
                data.reasons.forEach(r => {
                    reasonsHTML += `<li class="flex items-start gap-1.5"><i class="fa-solid fa-circle-check text-purple-600 mt-1"></i> <span>${r}</span></li>`;
                });

                output.className = "p-5 rounded-2xl border bg-purple-50 border-purple-100 text-slate-700 space-y-3";
                output.innerHTML = `
                    <div class="border-b border-purple-200 pb-3 space-y-1">
                        <span class="text-[9px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">¡Recomendación del Tutor!</span>
                        <h4 class="font-bold text-sm text-purple-950">Curso Sugerido: <strong class="text-brandLightBlue">${courseMatched.title}</strong></h4>
                        <p class="text-[11px] text-slate-600">${data.explanation}</p>
                    </div>
                    <div class="space-y-1.5">
                        <span class="font-bold text-[10px] text-slate-500 uppercase tracking-wide">¿Por qué te servirá tanto?</span>
                        <ul class="space-y-1 text-[11px] text-slate-600 font-medium">
                            ${reasonsHTML}
                        </ul>
                    </div>
                    <div class="pt-2 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p class="text-[11px] font-bold text-amber-800 leading-normal flex items-center gap-1.5">
                            <i class="fa-solid fa-heart text-red-500 animate-pulse"></i> <span>${data.encouragement}</span>
                        </p>
                        <button onclick="openCourseModal('${courseMatched.id}')" class="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] uppercase py-2 px-4 rounded-xl shadow-sm transition-all self-end sm:self-auto">
                            Ver Curso Sugerido
                        </button>
                    </div>
                `;
            } catch (err) {
                output.className = "p-4 rounded-xl text-xs bg-red-50 border border-red-150 text-red-700";
                output.innerHTML = `Disculpa, no pudimos conectar con el recomendador inteligente de IA. Detalles: ${err.message}. Recuerda configurar tu API Key arriba.`;
            } finally {
                btn.disabled = false;
            }
        }

        // Abrir Modal de Detalle de Curso
        function openCourseModal(courseId) {
            coursesData = getCoursesData();
            selectedCourseId = courseId;
            const course = coursesData.find(c => c.id === courseId);
            if (!course) return;

            document.getElementById('modalCourseCategory').innerText = course.categoryLabel;
            document.getElementById('modalCourseTitle').innerText = course.title;
            document.getElementById('modalCourseDescription').innerText = course.longDescription || course.description;
            document.getElementById('modalCourseLessons').innerText = `${course.lessons} Lecciones Prácticas`;
            document.getElementById('modalCourseDuration').innerText = course.duration;
            document.getElementById('modalCoursePrice').innerText = 'Gratuito';

            const syllabusList = document.getElementById('modalCourseSyllabus');
            syllabusList.innerHTML = '';
            const lessons = getCourseLessonDetails(course);
            lessons.forEach((lesson, i) => {
                const li = document.createElement('li');
                li.className = "flex items-start gap-2 text-slate-600 text-[11px]";
                const icon = lesson.type === 'video' ? 'fa-play-circle text-blue-500' : 'fa-clipboard-list text-purple-500';
                li.innerHTML = `<span class="bg-slate-100 text-slate-700 font-bold rounded-lg w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">${i + 1}</span> <span class="leading-normal"><i class="fa-solid ${icon} mr-1"></i>${lesson.title}</span>`;
                syllabusList.appendChild(li);
            });

            const actionBtn = document.getElementById('modalActionBtn');
            const enrolled = getEnrollments().includes(courseId);
            actionBtn.innerText = enrolled ? 'Ir al curso' : 'Inscribirse al curso';
            actionBtn.className = enrolled
                ? 'bg-brandLightBlue hover:bg-brandBlue text-white font-bold px-5 py-2 rounded-xl shadow-md transition-all text-xs'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl shadow-md transition-all text-xs';

            document.getElementById('courseDetailModal').classList.remove('hidden');
        }

        // Cerrar Modal de Detalle
        function closeCourseModal() {
            document.getElementById('courseDetailModal').classList.add('hidden');
        }

        // Inscripción desde modal
        function enrollInCurrentCourse() {
            const course = coursesData.find(c => c.id === selectedCourseId);
            if (!course) return;
            closeCourseModal();
            if (!getEnrollments().includes(course.id)) {
                enrollInCourse(course.id);
            }
            setTimeout(() => openCourseContent(course.id), 400);
        }

        // ===== DESARROLLO DEL CURSO (Contenido con videos y formularios) =====
        let currentCourseContentId = null;

        function getCourseLessonDetails(course) {
            if (course.lessonDetails && course.lessonDetails.length) return course.lessonDetails;
            return (course.syllabus || []).map((t, i) => buildLessonFromTitle(t, i));
        }

        function getLessonProgress(courseId) {
            return (studentData.progress && studentData.progress[courseId]) || {};
        }

        function saveLessonProgress(courseId, prog) {
            if (!studentData.progress) studentData.progress = {};
            studentData.progress[courseId] = prog;
            _persistStudentField('progress', studentData.progress);
        }

        function isLessonComplete(prog, index, lesson) {
            const p = prog[index];
            if (!p) return false;
            if (lesson.type === 'video') return p.videoWatched && p.complete;
            if (lesson.type === 'form') return p.formCompleted && p.complete;
            return p.complete;
        }

        function calcCourseProgress(courseId) {
            const course = coursesData.find(c => c.id === courseId);
            if (!course) return 0;
            const lessons = getCourseLessonDetails(course);
            const prog = getLessonProgress(courseId);
            if (!lessons.length) return 0;
            const done = lessons.filter((l, i) => isLessonComplete(prog, i, l)).length;
            return Math.round((done / lessons.length) * 100);
        }

        function goBackFromCourse() {
            if (document.getElementById('view-intranet') && !document.getElementById('view-intranet').classList.contains('hidden')) {
                showSection('view-intranet');
            } else {
                showSection('view-courses');
            }
        }

        function openCourseContent(courseId) {
            coursesData = getCoursesData();
            const course = coursesData.find(c => c.id === courseId);
            if (!course) { triggerNotification("Curso no encontrado", "error"); return; }
            currentCourseContentId = courseId;
            currentLessonIndex = null;

            document.getElementById('ccCategory').innerText = course.categoryLabel;
            document.getElementById('ccTitle').innerText = course.title;
            document.getElementById('ccDescription').innerText = course.longDescription || course.description;

            const imgWrap = document.getElementById('ccCourseImageWrap');
            const imgEl = document.getElementById('ccCourseImage');
            if (course.imageUrl && imgWrap && imgEl) {
                imgEl.src = course.imageUrl;
                imgWrap.classList.remove('hidden');
            } else if (imgWrap) {
                imgWrap.classList.add('hidden');
            }

            renderCourseContentLessons();
            document.getElementById('ccLessonDetail').innerHTML = '<p class="text-xs text-slate-400 text-center py-12">Selecciona una lección de la lista para ver el video o completar el formulario.</p>';
            showSection('view-course-content');
        }

        function renderCourseContentLessons() {
            const course = coursesData.find(c => c.id === currentCourseContentId);
            if (!course) return;
            const lessons = getCourseLessonDetails(course);
            const prog = getLessonProgress(course.id);
            const list = document.getElementById('ccLessons');
            const pct = calcCourseProgress(course.id);

            list.innerHTML = '';
            lessons.forEach((lesson, i) => {
                const complete = isLessonComplete(prog, i, lesson);
                const active = currentLessonIndex === i;
                const li = document.createElement('li');
                li.className = `flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-50 border-brandLightBlue' : complete ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-150 hover:border-brandLightBlue'}`;
                li.onclick = () => openLessonDetail(i);
                const typeIcon = lesson.type === 'video' ? 'fa-play' : 'fa-clipboard-list';
                li.innerHTML = `
                    <div class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${complete ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}">
                        ${complete ? '<i class="fa-solid fa-check"></i>' : i + 1}
                    </div>
                    <div class="flex-1 min-w-0">
                        <span class="block text-[9px] font-bold text-slate-400 uppercase"><i class="fa-solid ${typeIcon}"></i> Lección ${i + 1}</span>
                        <span class="text-xs text-slate-700 leading-snug line-clamp-2">${lesson.title}</span>
                    </div>
                    <span class="text-[9px] font-bold shrink-0 ${complete ? 'text-emerald-600' : 'text-slate-400'}">${complete ? '100%' : '0%'}</span>
                `;
                list.appendChild(li);
            });

            document.getElementById('ccProgressBar').style.width = pct + '%';
            document.getElementById('ccProgressLabel').innerText = pct + '%';
        }

        function openLessonDetail(index) {
            currentLessonIndex = index;
            const course = coursesData.find(c => c.id === currentCourseContentId);
            if (!course) return;
            const lessons = getCourseLessonDetails(course);
            const lesson = lessons[index];
            const prog = getLessonProgress(course.id);
            const p = prog[index] || { videoWatched: false, formCompleted: false, complete: false };
            const container = document.getElementById('ccLessonDetail');

            let content = `
                <div class="space-y-4">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <span class="text-[9px] font-bold text-brandLightBlue uppercase">Lección ${index + 1} de ${lessons.length}</span>
                            <h3 class="font-bold text-base text-slate-800 mt-1">${lesson.title}</h3>
                            <p class="text-xs text-slate-500 mt-1">${lesson.description || ''}</p>
                        </div>
                        <span class="text-[10px] font-bold px-2 py-1 rounded-full ${isLessonComplete(prog, index, lesson) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">
                            ${isLessonComplete(prog, index, lesson) ? '✓ 100% completada' : 'En progreso'}
                        </span>
                    </div>`;

            if (lesson.type === 'video' && lesson.videoUrl) {
                const embedUrl = lesson.videoUrl.includes('embed') ? lesson.videoUrl : lesson.videoUrl.replace('watch?v=', 'embed/');
                content += `
                    <div class="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-black">
                        <iframe src="${embedUrl}" class="w-full h-full" allowfullscreen title="Video de la lección"></iframe>
                    </div>
                    <button onclick="markVideoWatched(${index})" class="${p.videoWatched ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-brandLightBlue hover:bg-brandBlue text-white'} font-bold text-xs py-2.5 px-5 rounded-xl transition-all border">
                        ${p.videoWatched ? '<i class="fa-solid fa-check mr-1"></i> Video visto' : '<i class="fa-solid fa-play mr-1"></i> Marcar video como visto'}
                    </button>`;
            }

            if (lesson.type === 'form' && lesson.formQuestions && lesson.formQuestions.length) {
                const q = lesson.formQuestions[0];
                content += `
                    <div class="bg-purple-50 border border-purple-100 rounded-xl p-5 space-y-3">
                        <h4 class="font-bold text-xs text-purple-900 flex items-center gap-2"><i class="fa-solid fa-clipboard-list"></i> Formulario de la lección</h4>
                        <p class="text-sm text-slate-700 font-medium">${q.question}</p>
                        <div class="space-y-2" id="lesson-form-options">
                            ${q.options.map((opt, oi) => `
                                <label class="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 transition-all">
                                    <input type="radio" name="lessonFormAnswer" value="${oi}" class="text-purple-600">
                                    <span class="text-xs text-slate-700">${opt}</span>
                                </label>
                            `).join('')}
                        </div>
                        <button onclick="submitLessonForm(${index})" class="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all">
                            <i class="fa-solid fa-paper-plane mr-1"></i> Enviar respuesta
                        </button>
                        ${p.formCompleted ? '<p class="text-[10px] text-emerald-600 font-bold"><i class="fa-solid fa-check"></i> Formulario completado correctamente</p>' : ''}
                    </div>`;
            }

            if (lesson.type === 'video' && p.videoWatched && !lesson.formQuestions?.length) {
                content += `<button onclick="completeLesson(${index})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all">
                    ${p.complete ? 'Lección completada' : 'Completar lección al 100%'}
                </button>`;
            }

            content += '</div>';
            container.innerHTML = content;
            renderCourseContentLessons();
        }

        function markVideoWatched(index) {
            const id = currentCourseContentId;
            const prog = getLessonProgress(id);
            prog[index] = prog[index] || {};
            prog[index].videoWatched = true;
            const course = coursesData.find(c => c.id === id);
            const lesson = getCourseLessonDetails(course)[index];
            if (lesson.type === 'video') {
                prog[index].complete = true;
            }
            saveLessonProgress(id, prog);
            triggerNotification('Video marcado como visto.', 'success');
            openLessonDetail(index);
            renderEnrolledCourses();
        }

        function submitLessonForm(index) {
            const selected = document.querySelector('input[name="lessonFormAnswer"]:checked');
            if (!selected) {
                triggerNotification('Selecciona una respuesta antes de enviar.', 'info');
                return;
            }
            const id = currentCourseContentId;
            const course = coursesData.find(c => c.id === id);
            const lesson = getCourseLessonDetails(course)[index];
            const q = lesson.formQuestions[0];
            const answerIdx = parseInt(selected.value, 10);

            if (answerIdx !== q.correctIndex) {
                triggerNotification('Respuesta incorrecta. Intenta de nuevo.', 'error');
                return;
            }

            const prog = getLessonProgress(id);
            prog[index] = prog[index] || {};
            prog[index].formCompleted = true;
            prog[index].complete = true;
            saveLessonProgress(id, prog);
            triggerNotification('¡Formulario completado correctamente! Lección al 100%.', 'success');
            openLessonDetail(index);
            renderEnrolledCourses();
        }

        function completeLesson(index) {
            const id = currentCourseContentId;
            const prog = getLessonProgress(id);
            prog[index] = prog[index] || {};
            prog[index].complete = true;
            saveLessonProgress(id, prog);
            triggerNotification('¡Lección completada al 100%!', 'success');
            openLessonDetail(index);
            renderEnrolledCourses();
        }

        // ===== ADMIN: REGISTRO, LOGIN Y GESTIÓN DE CURSOS =====
        const ADMIN_SESSION_KEY = 'aulizeth_admin_session';
        const ADMIN_ACCOUNT_KEY = 'aulizeth_admin_account';

        function isAdmin() { return localStorage.getItem(ADMIN_SESSION_KEY) === '1'; }

        function getAdminAccount() {
            try { return JSON.parse(localStorage.getItem(ADMIN_ACCOUNT_KEY) || 'null'); }
            catch (e) { return null; }
        }

        function saveAdminAccount(acc) {
            localStorage.setItem(ADMIN_ACCOUNT_KEY, JSON.stringify(acc));
        }

        async function handleAdminRegister(event) {
            event.preventDefault();
            const existing = getAdminAccount();
            if (existing) {
                triggerNotification('Ya existe una cuenta de administrador. Inicia sesión.', 'error');
                showSection('view-admin-login');
                return;
            }
            const name = document.getElementById('admin-reg-name').value.trim();
            const email = document.getElementById('admin-reg-email').value.trim().toLowerCase();
            const password = document.getElementById('admin-reg-password').value;
            if (password.length < 8) {
                triggerNotification('La contraseña debe tener al menos 8 caracteres.', 'error');
                return;
            }
            const passHash = await _hashPassword(password);
            saveAdminAccount({
                fullName: name,
                email,
                passwordHash: passHash,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem(ADMIN_SESSION_KEY, '1');
            triggerNotification('Cuenta de administrador creada. Bienvenido/a.', 'success');
            showSection('view-admin-panel');
        }

        async function handleAdminLogin(event) {
            event.preventDefault();
            const account = getAdminAccount();
            if (!account) {
                triggerNotification('No hay administrador registrado. Regístrate primero.', 'error');
                showSection('view-admin-register');
                return;
            }
            const email = document.getElementById('admin-login-email').value.trim().toLowerCase();
            const password = document.getElementById('admin-login-password').value;
            if (email !== account.email) {
                triggerNotification('Credenciales incorrectas.', 'error');
                return;
            }
            const passHash = await _hashPassword(password);
            if (passHash !== account.passwordHash) {
                triggerNotification('Contraseña incorrecta.', 'error');
                return;
            }
            localStorage.setItem(ADMIN_SESSION_KEY, '1');
            triggerNotification('Sesión de administrador iniciada.', 'success');
            showSection('view-admin-panel');
        }

        function logoutAdmin() {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            triggerNotification('Sesión de administrador cerrada.', 'info');
            showSection('view-admin-login');
        }

        function openAdminForgotPassword() {
            document.getElementById('adminForgotPanel').classList.remove('hidden');
        }

        function closeAdminForgotPassword() {
            document.getElementById('adminForgotPanel').classList.add('hidden');
            document.getElementById('admin-forgot-step2').classList.add('hidden');
            adminRecoveryState = { code: null, email: '' };
        }

        function sendAdminRecoveryCode() {
            const account = getAdminAccount();
            if (!account) {
                triggerNotification('No hay cuenta de administrador registrada.', 'error');
                return;
            }
            const email = document.getElementById('admin-forgot-email').value.trim().toLowerCase();
            if (email !== account.email) {
                triggerNotification('El correo no coincide con el administrador registrado.', 'error');
                return;
            }
            const code = _genPasscode();
            adminRecoveryState = { code, email };
            document.getElementById('admin-forgot-step2').classList.remove('hidden');
            const demoEl = document.getElementById('admin-demo-code');
            demoEl.classList.remove('hidden');
            demoEl.textContent = `Código de verificación (demo): ${code}`;
            triggerNotification('Código enviado. Revisa tu correo o usa el código mostrado en pantalla.', 'success');
        }

        async function submitAdminNewPassword() {
            const code = document.getElementById('admin-recovery-code').value.trim();
            const newPwd = document.getElementById('admin-new-password').value;
            if (code !== adminRecoveryState.code) {
                triggerNotification('Código incorrecto.', 'error');
                return;
            }
            if (newPwd.length < 8) {
                triggerNotification('La contraseña debe tener al menos 8 caracteres.', 'error');
                return;
            }
            const account = getAdminAccount();
            if (!account) return;
            account.passwordHash = await _hashPassword(newPwd);
            saveAdminAccount(account);
            closeAdminForgotPassword();
            triggerNotification('Contraseña actualizada. Ya puedes iniciar sesión.', 'success');
        }

        function adminAddLessonRow(lessonData) {
            const builder = document.getElementById('admin-lessons-builder');
            const row = document.createElement('div');
            row.className = 'admin-lesson-row border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50';
            const type = lessonData?.type || 'video';
            row.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-slate-500 uppercase">Lección</span>
                    <button type="button" onclick="this.closest('.admin-lesson-row').remove()" class="text-red-500 hover:text-red-700 text-xs"><i class="fa-solid fa-trash"></i></button>
                </div>
                <input type="text" class="lesson-title w-full border border-slate-200 rounded-lg px-3 py-2 text-xs" placeholder="Título de la lección" value="${lessonData?.title || ''}">
                <select class="lesson-type w-full border border-slate-200 rounded-lg px-3 py-2 text-xs">
                    <option value="video" ${type === 'video' ? 'selected' : ''}>Video</option>
                    <option value="form" ${type === 'form' ? 'selected' : ''}>Formulario</option>
                </select>
                <input type="text" class="lesson-video w-full border border-slate-200 rounded-lg px-3 py-2 text-xs" placeholder="URL del video (YouTube embed)" value="${lessonData?.videoUrl || ''}">
                <input type="text" class="lesson-question w-full border border-slate-200 rounded-lg px-3 py-2 text-xs" placeholder="Pregunta del formulario (si aplica)" value="${lessonData?.formQuestions?.[0]?.question || ''}">
            `;
            builder.appendChild(row);
        }

        function resetAdminCourseForm() {
            document.getElementById('admin-edit-course-id').value = '';
            document.getElementById('admin-form-title').textContent = 'Crear nuevo curso';
            document.getElementById('admin-course-title').value = '';
            document.getElementById('admin-course-category').value = 'inicial';
            document.getElementById('admin-course-duration').value = '';
            document.getElementById('admin-course-description').value = '';
            document.getElementById('admin-course-longdesc').value = '';
            document.getElementById('admin-course-icon').value = 'fa-book';
            document.getElementById('admin-course-bgcolor').value = 'bg-blue-600';
            document.getElementById('admin-course-image').value = '';
            document.getElementById('admin-lessons-builder').innerHTML = '';
            document.getElementById('admin-image-preview').classList.add('hidden');
            adminAddLessonRow();
        }

        function handleAdminImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('admin-course-image').value = e.target.result;
                document.getElementById('admin-image-preview-img').src = e.target.result;
                document.getElementById('admin-image-preview').classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }

        function collectAdminLessonRows() {
            const rows = document.querySelectorAll('.admin-lesson-row');
            const lessons = [];
            rows.forEach((row, i) => {
                const title = row.querySelector('.lesson-title').value.trim();
                if (!title) return;
                const type = row.querySelector('.lesson-type').value;
                const videoUrl = row.querySelector('.lesson-video').value.trim();
                const question = row.querySelector('.lesson-question').value.trim();
                const lesson = {
                    title,
                    type,
                    videoUrl: type === 'video' ? (videoUrl || DEFAULT_VIDEO) : '',
                    description: title,
                    formQuestions: type === 'form' ? [{
                        question: question || `¿Completaste "${title}"?`,
                        options: ['Sí, lo practicé', 'Necesito repasar'],
                        correctIndex: 0
                    }] : []
                };
                lessons.push(lesson);
            });
            return lessons;
        }

        function handleAdminSaveCourse(event) {
            event.preventDefault();
            if (!isAdmin()) {
                triggerNotification('Debes iniciar sesión como administrador.', 'error');
                showSection('view-admin-login');
                return;
            }
            const editId = document.getElementById('admin-edit-course-id').value;
            const title = document.getElementById('admin-course-title').value.trim();
            const category = document.getElementById('admin-course-category').value;
            const lessonDetails = collectAdminLessonRows();
            if (!lessonDetails.length) {
                triggerNotification('Añade al menos una lección al curso.', 'error');
                return;
            }

            coursesData = getCoursesData();
            const courseData = {
                category,
                categoryLabel: CATEGORY_LABELS[category] || category,
                title,
                description: document.getElementById('admin-course-description').value.trim(),
                longDescription: document.getElementById('admin-course-longdesc').value.trim() || document.getElementById('admin-course-description').value.trim(),
                lessons: lessonDetails.length,
                duration: document.getElementById('admin-course-duration').value.trim() || '— horas',
                price: 'Gratuito',
                rating: 5.0,
                reviews: 'Nuevo',
                icon: document.getElementById('admin-course-icon').value.trim() || 'fa-book',
                bgColor: document.getElementById('admin-course-bgcolor').value,
                imageUrl: document.getElementById('admin-course-image').value.trim(),
                syllabus: lessonDetails.map(l => l.title),
                lessonDetails
            };

            if (editId) {
                const idx = coursesData.findIndex(c => c.id === editId);
                if (idx >= 0) {
                    coursesData[idx] = { ...coursesData[idx], ...courseData };
                }
                triggerNotification('Curso actualizado. Los estudiantes verán los cambios.', 'success');
            } else {
                courseData.id = 'course_' + Date.now();
                coursesData.push(courseData);
                triggerNotification('Curso creado y publicado en el aula virtual.', 'success');
            }

            saveCoursesData(coursesData);
            resetAdminCourseForm();
            renderAdminCoursesList();
            renderAdminPendingList();
            renderCatalog(coursesData);
            renderIntranetCatalog();
        }

        function adminEditCourse(courseId) {
            coursesData = getCoursesData();
            const course = coursesData.find(c => c.id === courseId);
            if (!course) return;
            document.getElementById('admin-edit-course-id').value = course.id;
            document.getElementById('admin-form-title').textContent = 'Editar curso';
            document.getElementById('admin-course-title').value = course.title;
            document.getElementById('admin-course-category').value = course.category;
            document.getElementById('admin-course-duration').value = course.duration || '';
            document.getElementById('admin-course-description').value = course.description || '';
            document.getElementById('admin-course-longdesc').value = course.longDescription || '';
            document.getElementById('admin-course-icon').value = course.icon || 'fa-book';
            document.getElementById('admin-course-bgcolor').value = course.bgColor || 'bg-blue-600';
            document.getElementById('admin-course-image').value = course.imageUrl || '';
            if (course.imageUrl) {
                document.getElementById('admin-image-preview-img').src = course.imageUrl;
                document.getElementById('admin-image-preview').classList.remove('hidden');
            }
            document.getElementById('admin-lessons-builder').innerHTML = '';
            const lessons = getCourseLessonDetails(course);
            lessons.forEach(l => adminAddLessonRow(l));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function adminDeleteCourse(courseId) {
            if (!isAdmin()) return;
            const course = coursesData.find(c => c.id === courseId);
            if (!course) return;
            if (!confirm(`¿Eliminar el curso "${course.title}"? Esta acción no se puede deshacer.`)) return;
            coursesData = coursesData.filter(c => c.id !== courseId);
            saveCoursesData(coursesData);
            triggerNotification('Curso eliminado.', 'success');
            renderAdminCoursesList();
            renderAdminPendingList();
            renderCatalog(coursesData);
            renderIntranetCatalog();
        }

        function renderAdminPendingList() {
            const container = document.getElementById('admin-pending-list');
            if (!container) return;
            coursesData = getCoursesData();
            const publishedIds = coursesData.map(c => c.id);
            const pending = PENDING_COURSES_LIBRARY.filter(c => !publishedIds.includes(c.id));
            if (!pending.length) {
                container.innerHTML = '<p class="text-xs text-slate-400">No hay más cursos pendientes en la biblioteca. Crea uno nuevo con el formulario de arriba.</p>';
                return;
            }
            container.innerHTML = pending.map(c => `
                <div class="flex items-center justify-between p-4 border border-dashed border-purple-200 bg-purple-50/40 rounded-xl">
                    <div class="flex items-center gap-3">
                        <div class="${c.bgColor} w-12 h-12 rounded-lg flex items-center justify-center text-white"><i class="fa-solid ${c.icon}"></i></div>
                        <div>
                            <h4 class="font-bold text-xs text-slate-800">${c.title}</h4>
                            <p class="text-[10px] text-slate-500">${c.lessons} lecciones · Gratuito · ${c.categoryLabel}</p>
                        </div>
                    </div>
                    <button onclick="adminPublishPendingCourse('${c.id}')" class="text-xs font-bold text-purple-600 hover:text-purple-800 px-3 py-1.5 border border-purple-200 rounded-lg bg-white">
                        <i class="fa-solid fa-upload mr-1"></i> Publicar
                    </button>
                </div>
            `).join('');
        }

        function adminPublishPendingCourse(courseId) {
            if (!isAdmin()) return;
            const course = PENDING_COURSES_LIBRARY.find(c => c.id === courseId);
            if (!course) return;
            coursesData = getCoursesData();
            if (coursesData.some(c => c.id === courseId)) return;
            coursesData.push(initDefaultLessonDetails({ ...course }));
            saveCoursesData(coursesData);
            triggerNotification(`Curso "${course.title}" publicado en el catálogo.`, 'success');
            renderAdminCoursesList();
            renderAdminPendingList();
            renderCatalog(coursesData);
            renderIntranetCatalog();
        }

        function renderAdminCoursesList() {
            const container = document.getElementById('admin-courses-list');
            if (!container) return;
            coursesData = getCoursesData();
            if (!coursesData.length) {
                container.innerHTML = '<p class="text-xs text-slate-400">No hay cursos publicados.</p>';
                return;
            }
            container.innerHTML = coursesData.map(c => `
                <div class="flex items-center justify-between p-4 border border-slate-150 rounded-xl hover:border-amber-300 transition-all">
                    <div class="flex items-center gap-3">
                        ${c.imageUrl ? `<img src="${c.imageUrl}" class="w-12 h-12 rounded-lg object-cover" alt="">` : `<div class="${c.bgColor} w-12 h-12 rounded-lg flex items-center justify-center text-white"><i class="fa-solid ${c.icon}"></i></div>`}
                        <div>
                            <h4 class="font-bold text-xs text-slate-800">${c.title}</h4>
                            <p class="text-[10px] text-slate-500">${c.lessons} lecciones · Gratuito · ${c.categoryLabel}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="adminEditCourse('${c.id}')" class="text-xs font-bold text-amber-600 hover:text-amber-700 px-3 py-1.5 border border-amber-200 rounded-lg">Editar</button>
                        <button onclick="adminDeleteCourse('${c.id}')" class="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-lg">Eliminar</button>
                    </div>
                </div>
            `).join('');
        }


        // --- 4. MODAL DE RECUPERACIÓN DE CONTRASEÑA (Flujo completo) ---
        let recoveryState = { code: null, destination: '', method: 'email', attempts: 0, timerId: null };

        function openForgotPasswordModal() {
            document.getElementById('forgotPasswordModal').classList.remove('hidden');
            goToForgotStep(1);
        }

        function closeForgotPasswordModal() {
            document.getElementById('forgotPasswordModal').classList.add('hidden');
            document.getElementById('forgotPwdAIResponse').classList.add('hidden');
            document.getElementById('forgotPwdEmail').value = '';
            document.getElementById('recoveryCodeInput').value = '';
            document.getElementById('newPasswordInput').value = '';
            document.getElementById('confirmPasswordInput').value = '';
            document.getElementById('demoCodeHint').classList.add('hidden');
            recoveryState = { code: null, destination: '', method: 'email', attempts: 0, timerId: null };
            goToForgotStep(1);
        }

        function goToForgotStep(step) {
            for (let i = 1; i <= 4; i++) {
                const el = document.getElementById('forgot-step-' + i);
                if (el) el.classList.toggle('hidden', i !== step);
            }
            const inds = [
                document.getElementById('step-ind-1'),
                document.getElementById('step-ind-2'),
                document.getElementById('step-ind-3'),
            ];
            inds.forEach((el, idx) => {
                if (!el) return;
                const active = (step >= idx + 1) && step <= 3;
                el.className = (idx === 0 ? 'flex-1 text-center py-1.5 rounded-l-lg ' : idx === 2 ? 'flex-1 text-center py-1.5 rounded-r-lg ' : 'flex-1 text-center py-1.5 ')
                    + (active ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400');
            });
            const titles = {1: '¿Olvidaste tu clave?', 2: 'Validar código', 3: 'Crear nueva contraseña', 4: 'Listo'};
            const t = document.getElementById('forgotTitle');
            if (t) t.textContent = titles[step] || titles[1];
        }

        function maskDestination(value, method) {
            if (method === 'sms') {
                const digits = value.replace(/\D/g, '');
                if (digits.length < 4) return '••• •••• ' + digits;
                return '••• ••• ' + digits.slice(-4);
            }
            const [user, domain] = value.split('@');
            if (!domain) return value;
            const shown = user.slice(0, 2);
            return shown + '•••@' + domain;
        }

        function startResendTimer(seconds) {
            const timerEl = document.getElementById('recoveryTimer');
            let s = seconds;
            if (recoveryState.timerId) clearInterval(recoveryState.timerId);
            timerEl.textContent = `Podrás reenviar en ${s}s`;
            recoveryState.timerId = setInterval(() => {
                s--;
                if (s <= 0) {
                    clearInterval(recoveryState.timerId);
                    timerEl.textContent = 'Puedes reenviar el código.';
                } else {
                    timerEl.textContent = `Podrás reenviar en ${s}s`;
                }
            }, 1000);
        }

        function generateRecoveryCode(destination, method) {
            const code = String(Math.floor(100000 + Math.random() * 900000));
            recoveryState.code = code;
            recoveryState.destination = destination;
            recoveryState.method = method;
            recoveryState.attempts = 0;
            return code;
        }

        function sendRecoveryCode() {
            const destination = document.getElementById('forgotPwdEmail').value.trim().toLowerCase();
            const method = (document.querySelector('input[name="recoveryMethod"]:checked') || {}).value || 'email';

            if (!destination) {
                triggerNotification('Por favor ingresa tu correo electrónico.', 'info');
                return;
            }
            if (!destination.includes('@')) {
                triggerNotification('Ese correo no parece válido. Revísalo, por favor.', 'error');
                return;
            }
            if (method === 'sms') {
                triggerNotification('La recuperación por SMS no está disponible. Usa tu correo electrónico.', 'info');
                return;
            }

            const btn = document.getElementById('sendCodeBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Enviando enlace...';

            recoveryState.destination = destination;
            recoveryState.method = 'email';

            firebaseAuth.sendPasswordResetEmail(destination)
                .then(() => {
                    document.getElementById('recoveryDestination').textContent = maskDestination(destination, 'email');
                    triggerNotification(`Te enviamos un enlace para restablecer tu contraseña a ${maskDestination(destination, 'email')}`, 'success');
                    goToForgotStep(4);
                })
                .catch(err => {
                    console.error('Firebase reset error:', err);
                    triggerNotification(_firebaseErrorMessage(err), 'error');
                })
                .finally(() => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar código de recuperación';
                });
        }

        function resendRecoveryCode() {
            if (!recoveryState.destination) {
                goToForgotStep(1);
                return;
            }
            firebaseAuth.sendPasswordResetEmail(recoveryState.destination)
                .then(() => triggerNotification('Hemos reenviado el enlace a tu correo.', 'info'))
                .catch(err => {
                    console.error('Firebase reset error:', err);
                    triggerNotification(_firebaseErrorMessage(err), 'error');
                });
        }

        function verifyRecoveryCode() {
            const input = document.getElementById('recoveryCodeInput').value.trim();
            if (input.length !== 6) {
                triggerNotification('El código debe tener 6 dígitos.', 'error');
                return;
            }
            if (input !== recoveryState.code) {
                recoveryState.attempts++;
                if (recoveryState.attempts >= 3) {
                    triggerNotification('Demasiados intentos. Solicita un código nuevo.', 'error');
                    goToForgotStep(1);
                    return;
                }
                triggerNotification(`Código incorrecto. Te quedan ${3 - recoveryState.attempts} intentos.`, 'error');
                return;
            }
            triggerNotification('Código verificado correctamente.', 'success');
            goToForgotStep(3);
        }

        function evaluatePasswordStrength(pwd) {
            let score = 0;
            if (pwd.length >= 8) score++;
            if (pwd.length >= 12) score++;
            if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
            if (/\d/.test(pwd)) score++;
            if (/[^A-Za-z0-9]/.test(pwd)) score++;
            const levels = [
                { w: '10%',  color: 'bg-rose-500',   label: 'Muy débil' },
                { w: '25%',  color: 'bg-rose-500',   label: 'Débil' },
                { w: '50%',  color: 'bg-amber-500',  label: 'Aceptable' },
                { w: '75%',  color: 'bg-lime-500',   label: 'Buena' },
                { w: '100%', color: 'bg-emerald-600',label: 'Excelente' },
            ];
            return levels[Math.min(score, 4)];
        }

        function submitNewPassword() {
            const pwd = document.getElementById('newPasswordInput').value;
            const confirm = document.getElementById('confirmPasswordInput').value;

            if (pwd.length < 8) {
                triggerNotification('La contraseña debe tener mínimo 8 caracteres.', 'error');
                return;
            }
            if (pwd !== confirm) {
                triggerNotification('Las contraseñas no coinciden.', 'error');
                return;
            }
            // Persistir localmente la nueva clave asociada al destino (demo)
            try {
                const store = JSON.parse(localStorage.getItem('aulizeth_recovered_pwds') || '{}');
                store[recoveryState.destination] = { updatedAt: new Date().toISOString() };
                localStorage.setItem('aulizeth_recovered_pwds', JSON.stringify(store));
            } catch (e) { /* ignore */ }

            triggerNotification('¡Tu contraseña fue actualizada correctamente!', 'success');
            goToForgotStep(4);
        }

        // Live strength meter
        document.addEventListener('input', (e) => {
            if (e.target && e.target.id === 'newPasswordInput') {
                const lvl = evaluatePasswordStrength(e.target.value);
                const bar = document.getElementById('pwdStrengthBar');
                const lbl = document.getElementById('pwdStrengthLabel');
                if (bar && lbl) {
                    bar.style.width = lvl.w;
                    bar.className = 'h-full transition-all ' + lvl.color;
                    lbl.textContent = 'Fortaleza: ' + lvl.label;
                }
            }
        });

        // Generar Guía de Recuperación con Gemini
        async function getForgotPasswordGUIDE() {
            const email = document.getElementById('forgotPwdEmail').value.trim();
            const output = document.getElementById('forgotPwdAIResponse');
            const btn = document.getElementById('forgotBtn');

            if (!email) {
                triggerNotification("Por favor ingresa tu correo electrónico registrado.", "info");
                return;
            }

            output.classList.remove('hidden');
            output.innerHTML = `<span class="flex items-center gap-1.5 text-purple-700 font-medium italic"><i class="fa-solid fa-spinner animate-spin"></i> Generando guía de soporte amigable...</span>`;
            btn.disabled = true;

            const systemPrompt = `Eres un asesor de soporte técnico paciente y muy dulce de la escuela Aulizeth. El usuario olvidó su contraseña de su cuenta de estudios.
Escribe un mensaje de 3 párrafos muy breves y tranquilizadores.
Párrafo 1: Consuélalo y dile que es totalmente normal olvidar las contraseñas, que no tiene nada de malo.
Párrafo 2: Dale una instrucción simulada de 2 pasos sencillos (ej: "hemos enviado un código a tu correo", "apúntalo en una libreta de papel física para que no se te pierda").
Párrafo 3: Una despedida motivadora firmando como "Tutor de Soporte Aulizeth".`;

            const payload = {
                contents: [{ parts: [{ text: `Olvidé mi contraseña. Mi correo es ${email}` }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            };

            try {
                const response = await fetchGemini(payload);
                const guideText = response.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!guideText) throw new Error("No se pudo estructurar el mensaje.");

                output.innerHTML = `
                    <div class="space-y-2.5">
                        <span class="text-[9px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">Guía de Ayuda Generada</span>
                        <div class="text-slate-700 leading-relaxed space-y-2 whitespace-pre-line font-medium text-[11px]">${guideText}</div>
                    </div>
                `;
            } catch (err) {
                output.innerHTML = `<span class="text-rose-700 font-semibold mt-1">Error al conectar con el soporte de IA: ${err.message}. Asegúrate de configurar la clave arriba.</span>`;
            } finally {
                btn.disabled = false;
            }
        }

        // --- 5. INTERACTUAR CON SIMULADOR DE PEDAGOGÍA (QUIENES SOMOS) ---
        async function simulatePedagogyConsult() {
            const fear = document.getElementById('pedagogyFearInput').value.trim();
            const output = document.getElementById('pedagogyResponseContainer');
            const btn = document.getElementById('consultBtn');

            if (!fear) {
                triggerNotification("Por favor ingresa tu duda o temor tecnológico.", "info");
                return;
            }

            output.classList.remove('hidden');
            output.innerHTML = `<span class="flex items-center gap-1.5 text-purple-700 italic"><i class="fa-solid fa-spinner animate-spin"></i> Consultando la filosofía del Director...</span>`;
            btn.disabled = true;

            const systemPrompt = `Eres el Director Pedagógico de la Escuela de Computación Aulizeth. Tu especialidad es enseñar computación desde cero absoluto a personas de todas las edades con un amor, empatía y paciencia desbordantes.
El alumno te contará un miedo tecnológico (ej: "miedo a romper la PC", "miedo a que se rían de mí por preguntar").
Escríbele una respuesta sumamente tierna, cercana y clara de un párrafo (máximo 4 líneas) explicándole cómo el método de Aulizeth elimina ese temor específico por completo. Trátalo con muchísimo respeto y cariño.`;

            const payload = {
                contents: [{ parts: [{ text: `Tengo este miedo: "${fear}"` }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            };

            try {
                const response = await fetchGemini(payload);
                const directorText = response.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!directorText) throw new Error("No se obtuvo respuesta del Director.");

                output.innerHTML = `
                    <div class="space-y-1.5">
                        <span class="text-[9px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">Mensaje del Director Pedagógico</span>
                        <p class="text-slate-700 font-medium leading-relaxed italic text-[11px] border-l-4 border-purple-300 pl-3">"${directorText}"</p>
                    </div>
                `;
            } catch (err) {
                output.innerHTML = `<span class="text-rose-700 mt-1">No pudimos conectar con el Director de IA: ${err.message}. Recuerda ingresar tu API Key.</span>`;
            } finally {
                btn.disabled = false;
            }
        }

        // --- 5B. CONTROL DE LA SECCIÓN DE CONTACTO E INTERACCIÓN DE PREGUNTAS FRECUENTES ---

        // Enviar Formulario de Contacto Amigable
        function handleContactSubmit(event) {
            event.preventDefault();
            
            const name = document.getElementById('contact-name').value.trim();
            const phone = document.getElementById('contact-phone').value.trim();
            const callbackChecked = document.getElementById('contact-callback').checked;

            triggerNotification("Enviando tu consulta de forma segura a soporte...", "info");

            setTimeout(() => {
                let successMsg = `¡Gracias, ${name}! Hemos recibido tu mensaje con total éxito.`;
                if (callbackChecked) {
                    successMsg += ` Nos comunicaremos contigo por llamada de voz al celular ${phone} muy pronto.`;
                } else {
                    successMsg += " Uno de nuestros asesores pacientes te responderá por correo electrónico.";
                }
                triggerNotification(successMsg, "success");

                // Limpiar campos del formulario
                document.getElementById('contact-name').value = '';
                document.getElementById('contact-phone').value = '';
                document.getElementById('contact-email').value = '';
                document.getElementById('contact-message').value = '';
                document.getElementById('contact-callback').checked = false;
            }, 1200);
        }

        // Definir texto de FAQ al presionar botón sugerido
        function setFAQSearch(promptText) {
            document.getElementById('faqAIPrompt').value = promptText;
        }

        // Consultar respuesta inteligente de FAQ con Gemini API
        async function getAIFAQAnswer() {
            const prompt = document.getElementById('faqAIPrompt').value.trim();
            const output = document.getElementById('faqAIResponseContainer');
            const btn = document.getElementById('faqBtn');

            if (!prompt) {
                triggerNotification("Por favor ingresa o selecciona una de las preguntas de soporte.", "info");
                return;
            }

            output.classList.remove('hidden');
            output.innerHTML = `
                <div class="flex items-center gap-1.5 text-purple-700 italic font-medium">
                    <i class="fa-solid fa-spinner animate-spin"></i>
                    <span>Buscando respuesta empática y comprensible en nuestro manual de paciencia...</span>
                </div>
            `;
            btn.disabled = true;

            const systemPrompt = `Eres el Asistente de Soporte Técnico de Aulizeth. Respondes dudas sobre el método de estudio, requisitos de computadora, pagos o uso de la plataforma a personas que le tienen miedo a la tecnología.
Tu tono debe ser extremadamente empático, cercano, sencillo, y tierno (explicando paso a paso).
Escribe una respuesta corta de máximo dos párrafos:
Párrafo 1: La respuesta directa a su pregunta usando alguna analogía o lenguaje muy claro libre de palabras raras (máximo 4 líneas).
Párrafo 2: Una frase sincera de aliento para que confíe en su propio aprendizaje en la escuela (máximo 2 líneas).`;

            const payload = {
                contents: [{ parts: [{ text: `Hola, tengo esta duda sobre Aulizeth: "${prompt}"` }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            };

            try {
                const response = await fetchGemini(payload);
                const tutorFAQText = response.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!tutorFAQText) throw new Error("No se pudo obtener respuesta del soporte inteligente.");

                output.innerHTML = `
                    <div class="space-y-2">
                        <span class="text-[9px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">Soporte IA Aulizeth</span>
                        <div class="text-slate-700 font-medium leading-relaxed whitespace-pre-line text-[11px] border-l-4 border-purple-300 pl-3 italic">"${tutorFAQText}"</div>
                    </div>
                `;
            } catch (err) {
                output.innerHTML = `<span class="text-rose-700 font-semibold text-xs">No fue posible obtener la explicación por IA: ${err.message}. Asegúrate de ingresar tu API Key.</span>`;
            } finally {
                btn.disabled = false;
            }
        }

        // --- 6. EJECUTAR CAMBIO DE VISTA A LOGUEADO Y DASHBOARD INTERACTIVO ---
        function loginSuccessful() {
            // Actualizar textos informativos en el Dashboard antiguo (por compatibilidad)
            document.getElementById('studentNameDisplay').innerText = studentData.fullName;
            document.getElementById('studentRouteDisplay').innerText = studentData.experience;

            // ── MODO INTRANET: ocultar header público, mostrar header de intranet ──
            const publicHeader = document.querySelector('header:not(#intranet-header)');
            if (publicHeader) publicHeader.classList.add('hidden');

            const intranetHeader = document.getElementById('intranet-header');
            if (intranetHeader) {
                intranetHeader.classList.remove('hidden');
                // Actualizar nombre e inicial en el header de intranet
                const firstName = studentData.fullName.split(' ')[0];
                const avatarEl = document.getElementById('intranet-avatar');
                const nameEl   = document.getElementById('intranet-student-name');
                if (avatarEl) avatarEl.textContent = firstName.charAt(0).toUpperCase();
                if (nameEl)   nameEl.textContent   = firstName;
            }

            // Actualizar saludos en la intranet
            const greetEl = document.getElementById('intranet-greeting-name');
            const levelEl = document.getElementById('intranet-level-display');
            if (greetEl) greetEl.textContent = studentData.fullName.split(' ')[0];
            if (levelEl) levelEl.textContent = studentData.experience;

            // Rellenar catálogo de cursos en la intranet
            renderIntranetCatalog();
            renderEnrolledCourses();

            // Ir a la intranet y activar la pestaña de cursos
            showSection('view-intranet');
            switchIntranetTab('tab-ruta');
            initChatWelcome();
        }

        // ── Cambiar pestaña dentro de la intranet ──
        function switchIntranetTab(tabId) {
            const tabs = ['tab-ruta', 'tab-calendario', 'tab-chat'];
            tabs.forEach(t => {
                document.getElementById(t).classList.add('hidden');
                const btn = document.getElementById('intranet-btn-' + t);
                const ind = document.getElementById('intranet-indicator-' + t);
                if (btn) {
                    btn.classList.remove('bg-white/20', 'text-white', 'border-white/30');
                    btn.classList.add('text-slate-300', 'hover:text-white', 'hover:bg-white/10', 'border-transparent');
                }
                if (ind) ind.classList.replace('bg-brandAccent', 'bg-transparent');
            });
            const active = document.getElementById(tabId);
            if (active) active.classList.remove('hidden');
            const activeBtn = document.getElementById('intranet-btn-' + tabId);
            const activeInd = document.getElementById('intranet-indicator-' + tabId);
            if (activeBtn) {
                activeBtn.classList.add('bg-white/20', 'text-white', 'border-white/30');
                activeBtn.classList.remove('text-slate-300', 'hover:bg-white/10', 'border-transparent');
            }
            if (activeInd) {
                activeInd.classList.replace('bg-transparent', 'bg-brandAccent');
            }
            // Si es el chat, asegurar que el scroll esté abajo
            if (tabId === 'tab-chat') {
                const chatBox = document.getElementById('chatHistoryContainer');
                if (chatBox) setTimeout(() => chatBox.scrollTop = chatBox.scrollHeight, 100);
            }
            // Si es el calendario, renderizarlo
            if (tabId === 'tab-calendario') {
                renderCalendar();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // ── Renderizar catálogo en la intranet ──
        function renderIntranetCatalog() {
            const grid = document.getElementById('intranet-catalog-grid');
            if (!grid) return;
            coursesData = getCoursesData();
            const enrolled = getEnrollments();
            grid.innerHTML = coursesData.map(c => {
                const isEnrolled = enrolled.includes(c.id);
                const header = c.imageUrl
                    ? `<img src="${c.imageUrl}" alt="${c.title}" class="w-full h-28 object-cover">`
                    : `<div class="${c.bgColor} h-28 flex items-center justify-center text-white text-4xl opacity-90"><i class="fa-solid ${c.icon}"></i></div>`;
                return `
                <div class="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    ${header}
                    <div class="p-4 space-y-2 flex-grow">
                        <span class="text-[9px] font-bold text-brandLightBlue uppercase tracking-wider">${c.categoryLabel}</span>
                        <h4 class="font-bold text-xs text-slate-800 leading-tight">${c.title}</h4>
                        <p class="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">${c.description}</p>
                        <div class="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>${c.lessons} lecciones</span>
                            <span class="text-emerald-600 font-bold">Gratuito</span>
                        </div>
                    </div>
                    <div class="px-4 pb-4 flex gap-2">
                        <button onclick="openCourseModal('${c.id}')" class="flex-1 border border-brandLightBlue text-brandLightBlue hover:bg-blue-50 font-bold text-[10px] py-2 rounded-xl transition-all">
                            Ver más detalles
                        </button>
                        <button onclick="enrollInCourse('${c.id}')" class="flex-1 ${isEnrolled ? 'bg-slate-200 text-slate-500' : 'bg-brandLightBlue hover:bg-brandBlue text-white'} font-bold text-[10px] py-2 rounded-xl transition-all">
                            ${isEnrolled ? 'Inscrito' : 'Inscribirse al curso'}
                        </button>
                    </div>
                </div>`;
            }).join('');
        }

        // ── Calendario ──
        let calCurrentDate = new Date();
        let calEvents = [];

        function renderCalendar() {
            const grid = document.getElementById('cal-grid');
            const title = document.getElementById('cal-month-title');
            if (!grid || !title) return;

            const year  = calCurrentDate.getFullYear();
            const month = calCurrentDate.getMonth();
            const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            title.textContent = `${monthNames[month]} ${year}`;

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();

            let html = '';
            // Espacios vacíos antes del primer día
            for (let i = 0; i < firstDay; i++) html += '<div></div>';

            for (let d = 1; d <= daysInMonth; d++) {
                const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                const hasEvent = calEvents.some(e => e.date === dateStr);
                html += `
                    <div class="aspect-square flex flex-col items-center justify-center rounded-lg text-[11px] font-semibold transition-all cursor-pointer
                        ${isToday ? 'bg-brandBlue text-white shadow-md' : 'hover:bg-slate-100 text-slate-600'}
                        ${hasEvent && !isToday ? 'ring-2 ring-emerald-400' : ''}">
                        ${d}
                        ${hasEvent ? '<span class="w-1 h-1 rounded-full bg-emerald-500 mt-0.5"></span>' : ''}
                    </div>`;
            }
            grid.innerHTML = html;
        }

        function changeCalMonth(dir) {
            calCurrentDate.setMonth(calCurrentDate.getMonth() + dir);
            renderCalendar();
        }

        function addCalEvent() {
            const text = document.getElementById('cal-event-text').value.trim();
            const date = document.getElementById('cal-event-date').value;
            if (!text || !date) { triggerNotification('Completa el texto y la fecha del recordatorio.', 'error'); return; }
            calEvents.push({ text, date });
            document.getElementById('cal-event-text').value = '';
            document.getElementById('cal-event-date').value = '';
            renderCalendar();
            triggerNotification(`Recordatorio "${text}" guardado para el ${date}.`, 'success');
        }

        // Cambiar pestañas del Dashboard (legacy)
        function switchTab(tabId) {
            const tabs = ['tab-ruta-legacy', 'tab-conceptos-legacy', 'tab-chat-legacy'];
            tabs.forEach(t => {
                const el = document.getElementById(t);
                if (el) el.classList.add('hidden');
                const btn = document.getElementById(`btn-${t}`);
                if (btn) btn.className = "tab-btn w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-150";
            });

            const activeEl = document.getElementById(tabId);
            if (activeEl) activeEl.classList.remove('hidden');
            
            let activeColor = 'bg-brandBlue';
            if (tabId === 'tab-chat-legacy' || tabId === 'tab-ruta-legacy') activeColor = 'bg-purple-600';

            const activeBtn = document.getElementById(`btn-${tabId}`);
            if (activeBtn) activeBtn.className = `tab-btn w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeColor} text-white shadow-sm`;
        }

        // PESTAÑA A: GENERAR RUTA DE APRENDIZAJE (removido - ya no usa IA)
        function generateAILearningPath() {
            triggerNotification('La función de plan de aprendizaje con IA fue reemplazada por el catálogo de cursos.', 'info');
        }

        // PESTAÑA B: TRADUCIR CONCEPTO INFORMÁTICO A ANALOGÍAS
        function setConceptTranslation(conceptName) {
            document.getElementById('conceptSearchInput').value = conceptName;
        }

        async function translateTechConcept() {
            const concept = document.getElementById('conceptSearchInput').value.trim();
            const output = document.getElementById('conceptTranslationOutput');
            const btn = document.getElementById('translateBtn');

            if (!concept) {
                triggerNotification("Por favor ingresa o selecciona un concepto de informática.", "info");
                return;
            }

            output.classList.remove('hidden');
            output.innerHTML = `
                <div class="flex items-center gap-1.5 text-brandLightBlue italic font-medium">
                    <i class="fa-solid fa-spinner animate-spin"></i>
                    <span>Tutor de Aulizeth traduciendo concepto a una analogía casera...</span>
                </div>
            `;
            btn.disabled = true;

            const systemPrompt = `Eres un docente de informática básica de la escuela Aulizeth. Tu especialidad es traducir términos tecnológicos complejos a analogías sumamente familiares de la vida diaria (como una cocina, un baúl, una carta física, una biblioteca, un organizador de ropa, etc.).
Explica el concepto que te proveerá el estudiante en dos partes breves:
Parte 1: ¿Qué es realmente? (Explicado de manera hiper simple sin tecnicismos en 2 líneas).
Parte 2: La analogía cotidiana (Una historia o ejemplo que el alumno pueda recordar de inmediato en 4 líneas).
Sé cálido, dulce y sumamente didáctico.`;

            const payload = {
                contents: [{ parts: [{ text: `Quiero entender este concepto: "${concept}"` }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            };

            try {
                const response = await fetchGemini(payload);
                const translationText = response.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!translationText) throw new Error("No se pudo construir la analogía.");

                output.innerHTML = `
                    <div class="space-y-3">
                        <div class="border-b border-blue-100 pb-2">
                            <span class="text-[9px] font-bold text-brandLightBlue bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">Concepto Traducido</span>
                            <h4 class="font-bold text-xs text-brandBlue mt-1">Definición de: <strong>${concept}</strong></h4>
                        </div>
                        <div class="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line font-medium">${translationText}</div>
                    </div>
                `;
            } catch (err) {
                output.innerHTML = `<span class="text-rose-700 font-semibold text-xs">No se pudo traducir. Error: ${err.message}. Introduce tu API Key arriba.</span>`;
            } finally {
                btn.disabled = false;
            }
        }

        // PESTAÑA C: CHAT DE APRENDIZAJE E INTERACCIÓN DIRECTA CON EL TUTOR VIRTUAL
        let chatHistory = [];

        function initChatWelcome() {
            const container = document.getElementById('chatHistoryContainer');
            container.innerHTML = `
                <div class="bg-white p-3.5 rounded-2xl border border-slate-150 space-y-1.5 self-start max-w-[85%]">
                    <span class="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md uppercase">Tutor Virtual</span>
                    <p class="leading-relaxed">¡Hola, <strong>${studentData.fullName}</strong>! Bienvenido/a a tu aula virtual. Soy tu tutor personal paciente. Escríbeme cualquier pregunta que tengas sobre el mouse, teclado, Word, Excel o internet. ¡Aquí no hay prisa alguna!</p>
                </div>
            `;
            chatHistory = [];
        }

        async function sendChatMessage() {
            const input = document.getElementById('chatStudentMessage');
            const message = input.value.trim();
            const container = document.getElementById('chatHistoryContainer');
            const btn = document.getElementById('sendChatBtn');

            if (!message) return;

            // Renderizar mensaje del Estudiante en el chat
            const studentBubble = document.createElement('div');
            studentBubble.className = "bg-purple-100 p-3 rounded-2xl self-end ml-auto max-w-[85%] space-y-1 shadow-sm";
            studentBubble.innerHTML = `
                <span class="block text-[8px] font-bold text-purple-800 uppercase text-right">Tú</span>
                <p class="leading-relaxed font-medium text-purple-950">${message}</p>
            `;
            container.appendChild(studentBubble);
            container.scrollTop = container.scrollHeight;
            input.value = '';

            // Mostrar burbuja de carga del Tutor
            const loadingBubble = document.createElement('div');
            loadingBubble.id = 'chat-loading-bubble';
            loadingBubble.className = "bg-white p-3 rounded-2xl border border-slate-150 self-start mr-auto max-w-[85%] flex items-center gap-1.5 text-slate-400 italic";
            loadingBubble.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Pensando explicación dulce...`;
            container.appendChild(loadingBubble);
            container.scrollTop = container.scrollHeight;

            // Deshabilitar botón temporalmente
            btn.disabled = true;

            const systemPrompt = `Eres el tutor virtual oficial de Aulizeth. Tu alumno tiene un perfil de: "${studentData.experience}".
Responde con un tono extremadamente paciente, empático, motivador y dulce. No uses palabras técnicas de internet o programación sin explicarlas con una analogía del hogar.
Escribe una respuesta corta y directo de máximo dos párrafos. El alumno te puede preguntar sobre cualquier uso de computadoras, redes sociales, internet, correo o contraseñas.`;

            // Construir payload conversacional básico
            chatHistory.push({ role: 'user', parts: [{ text: message }] });
            const payload = {
                contents: chatHistory,
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            };

            try {
                const response = await fetchGemini(payload);
                const tutorReply = response.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!tutorReply) throw new Error("No pudimos conectar.");

                // Eliminar burbuja de carga
                document.getElementById('chat-loading-bubble').remove();

                // Agregar burbuja real de respuesta
                const replyBubble = document.createElement('div');
                replyBubble.className = "bg-white p-3.5 rounded-2xl border border-slate-150 self-start mr-auto max-w-[85%] space-y-1.5 shadow-sm";
                replyBubble.innerHTML = `
                    <span class="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md uppercase">Tutor Virtual</span>
                    <p class="leading-relaxed font-medium text-slate-700 whitespace-pre-line">${tutorReply}</p>
                `;
                container.appendChild(replyBubble);
                container.scrollTop = container.scrollHeight;

                // Guardar réplica en el historial local para consistencia en la charla
                chatHistory.push(response.candidates[0].content);

            } catch (err) {
                document.getElementById('chat-loading-bubble').remove();
                const errorBubble = document.createElement('div');
                errorBubble.className = "bg-rose-50 border border-rose-100 p-3 rounded-2xl self-start mr-auto max-w-[85%] text-rose-800 text-[11px]";
                errorBubble.innerText = `Disculpa, no me fue posible estructurar mi respuesta. Error: ${err.message}. Asegúrate de ingresar tu API Key en la parte superior del portal para interactuar con el chat.`;
                container.appendChild(errorBubble);
                container.scrollTop = container.scrollHeight;
            } finally {
                btn.disabled = false;
            }
        }

        // --- 7. AUTO-RANGEO AL CARGAR LA PÁGINA ---
        window.onload = function() {
            coursesData = getCoursesData();
            renderCatalog(coursesData);
            const adminAccount = getAdminAccount();
            if (document.getElementById('view-admin-register') && !adminAccount) {
                // Si no hay admin, la vista de registro está disponible
            }
        };

        // Exponer funciones globales para onclick en HTML
        window.showSection = showSection;
        window.openCourseModal = openCourseModal;
        window.closeCourseModal = closeCourseModal;
        window.enrollInCourse = enrollInCourse;
        window.enrollInCurrentCourse = enrollInCurrentCourse;
        window.openCourseContent = openCourseContent;
        window.goBackFromCourse = goBackFromCourse;
        window.markVideoWatched = markVideoWatched;
        window.submitLessonForm = submitLessonForm;
        window.completeLesson = completeLesson;
        window.handleAdminRegister = handleAdminRegister;
        window.handleAdminLogin = handleAdminLogin;
        window.logoutAdmin = logoutAdmin;
        window.openAdminForgotPassword = openAdminForgotPassword;
        window.closeAdminForgotPassword = closeAdminForgotPassword;
        window.sendAdminRecoveryCode = sendAdminRecoveryCode;
        window.submitAdminNewPassword = submitAdminNewPassword;
        window.adminAddLessonRow = adminAddLessonRow;
        window.resetAdminCourseForm = resetAdminCourseForm;
        window.handleAdminImageUpload = handleAdminImageUpload;
        window.handleAdminSaveCourse = handleAdminSaveCourse;
        window.adminEditCourse = adminEditCourse;
        window.adminDeleteCourse = adminDeleteCourse;
