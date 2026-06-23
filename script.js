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
            const sections = ['view-home', 'view-about', 'view-courses', 'view-contact', 'view-register', 'view-login', 'view-dashboard', 'view-course-content'];

            sections.forEach(s => {
                const el = document.getElementById(s);
                if (el) el.classList.add('hidden');
            });
            const activeEl = document.getElementById(sectionId);
            if (activeEl) activeEl.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

        // --- 3. ALMACENAMIENTO DE CLAVE API EN NAVEGADOR ---
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
            fullName: "Usuario de Prueba",
            email: "maria.lopez@correo.com",
            experience: "Ninguno: Es mi primera vez tocando una computadora",
            customInterests: "Aprender lo básico para conversar con mi familia por WhatsApp"
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
        // SISTEMA DE AUTENTICACIÓN REAL CON EmailJS + localStorage
        // ============================================================
        // - Los usuarios registrados se guardan en localStorage (clave "aulizeth_users")
        // - Cada registro / inicio de sesión envía una notificación REAL
        //   por correo a la dueña del sitio mediante EmailJS.
        // ============================================================

        function _getUsers() {
            try { return JSON.parse(localStorage.getItem('aulizeth_users') || '[]'); }
            catch (e) { return []; }
        }
        function _saveUsers(users) {
            localStorage.setItem('aulizeth_users', JSON.stringify(users));
        }
        // Hash ligero de contraseña (no es seguridad bancaria, pero evita guardar texto plano)
        async function _hashPassword(pwd) {
            const enc = new TextEncoder().encode(pwd);
            const buf = await crypto.subtle.digest('SHA-256', enc);
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
        }
        function _genPasscode() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }
        function _expireTime(mins) {
            const d = new Date(Date.now() + mins * 60000);
            return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
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

        // -------- REGISTRO REAL --------
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

            const users = _getUsers();
            if (users.find(u => u.email === email)) {
                triggerNotification("Este correo ya está registrado. Inicia sesión.", "error");
                return;
            }

            triggerNotification("Creando tu cuenta de forma segura...", "info");

            const passHash = await _hashPassword(password);
            const newUser = {
                fullName: name,
                email: email,
                experience: experience,
                passwordHash: passHash,
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            _saveUsers(users);

            studentData.fullName = name;
            studentData.email = email;
            studentData.experience = experience;

            // Enviar correo de notificación a la dueña
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
        }

        // -------- LOGIN REAL --------
        async function handleLogin(event) {
            event.preventDefault();

            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            triggerNotification("Verificando tus credenciales...", "info");

            const users = _getUsers();
            const user = users.find(u => u.email === email);
            if (!user) {
                triggerNotification("Este correo no está registrado. Regístrate primero.", "error");
                return;
            }
            const passHash = await _hashPassword(password);
            if (passHash !== user.passwordHash) {
                triggerNotification("Contraseña incorrecta. Intenta de nuevo.", "error");
                return;
            }

            studentData.fullName = user.fullName;
            studentData.email = user.email;
            studentData.experience = user.experience;

            // Notificación real por correo
            const passcode = _genPasscode();
            try {
                await _sendEmail({
                    user_name: user.fullName,
                    user_email: user.email,
                    passcode: passcode,
                    time: _expireTime(15),
                    message: `🔐 INICIO DE SESIÓN en Aulizeth\n\nUsuario: ${user.fullName}\nCorreo: ${user.email}\nFecha: ${new Date().toLocaleString('es-PE')}\n\nCódigo de verificación: ${passcode}`
                });
                triggerNotification(`¡Bienvenido/a de nuevo, ${user.fullName}!`, "success");
            } catch (err) {
                console.error('EmailJS error:', err);
                triggerNotification(`Sesión iniciada (sin envío de correo).`, "info");
            }
            loginSuccessful();
        }

        // Cerrar sesión
        function logoutStudent() {
            document.getElementById('nav-visitor-actions').classList.remove('hidden');
            document.getElementById('nav-student-actions').classList.add('hidden');
            showSection('view-home');
            triggerNotification("Sesión cerrada correctamente.", "info");
        }


        // --- 3B. SISTEMA DE CURSOS Y DETALLE ---

        // Base de Datos de Cursos Local (Alta fidelidad)
        const coursesData = [
            {
                id: 'c1',
                category: 'inicial',
                categoryLabel: 'Computación Inicial',
                title: 'Fundamentos de Computación e Internet',
                description: 'Aprende las partes físicas de la computadora de manera segura, a usar el ratón (mouse), el teclado y a navegar en internet buscando tus recetas, videos o noticias favoritas.',
                longDescription: 'Este taller está diseñado con un lenguaje 100% amigable para personas que jamás han tocado una computadora. Aprenderemos paso a paso, sin palabras raras de tecnología, para que puedas valerte por ti mismo ante el ordenador.',
                lessons: 8,
                duration: '4 horas',
                price: 'Gratuito',
                rating: 4.9,
                reviews: '1,240 alumnos',
                icon: 'fa-desktop',
                bgColor: 'bg-blue-600',
                syllabus: [
                    '¿Cómo encender y apagar correctamente tu computadora?',
                    'El uso del mouse (ratón): clic, doble clic y arrastrar sin miedo.',
                    'Conociendo tu teclado: las teclas más importantes para escribir.',
                    'Abrir el navegador de internet y buscar tus primeros sitios web.',
                    'Buscar videos musicales y noticias en YouTube paso a paso.'
                ]
            },
            {
                id: 'c2',
                category: 'ofimatica',
                categoryLabel: 'Ofimática Clave',
                title: 'Microsoft Word y Escritura Digital Básica',
                description: 'Aprende a redactar tus propias cartas de solicitud, listas de mercado u hojas de vida. Aprende a guardar documentos ordenadamente en carpetas.',
                longDescription: 'Escribe de manera limpia y presentable. Te enseñaremos las herramientas principales para cambiar de tamaño las letras, darles color, agregar márgenes y guardar tus archivos en la computadora para encontrarlos en segundos.',
                lessons: 10,
                duration: '5 horas',
                price: 'S/. 49.00',
                rating: 4.8,
                reviews: '850 alumnos',
                icon: 'fa-file-word',
                bgColor: 'bg-indigo-600',
                syllabus: [
                    '¿Qué es Microsoft Word y cómo abrir tu primera página blanca?',
                    'Escribir texto libre, corregir errores ortográficos y borrar palabras.',
                    'Cambiar de color, tamaño y estilo de las letras (negrita, cursiva).',
                    'Cómo guardar tu documento con un nombre fácil en tu PC.',
                    'Imprimir tu primera carta o solicitud de manera directa.'
                ]
            },
            {
                id: 'c3',
                category: 'ofimatica',
                categoryLabel: 'Ofimática Clave',
                title: 'Microsoft Excel Básico y Control de Gastos',
                description: 'Lleva las cuentas de tu hogar, control de gastos diarios o de tu pequeño emprendimiento en tablas sumamente sencillas sin fórmulas difíciles.',
                longDescription: 'Olvídate del miedo a los números. En este taller aprenderás a crear una tabla cuadriculada, ingresar tus ingresos y gastos, y hacer que la computadora sume y reste todo de manera automática.',
                lessons: 12,
                duration: '6 horas',
                price: 'S/. 59.00',
                rating: 4.7,
                reviews: '920 alumnos',
                icon: 'fa-file-excel',
                bgColor: 'bg-emerald-600',
                syllabus: [
                    'Conociendo la cuadrícula de Excel: columnas, filas y celdas.',
                    'Cómo escribir números y nombres en las casillas.',
                    'Tu primera suma automática: ahorra tiempo y evita errores.',
                    'Crear una plantilla de gastos familiares mensuales fácil.',
                    'Dar formato bonito con colores a tus tablas financieras.'
                ]
            },
            {
                id: 'c4',
                category: 'comunicacion',
                categoryLabel: 'Comunicación',
                title: 'Correo Electrónico y WhatsApp Web desde Cero',
                description: 'Mantente comunicado con tus seres queridos. Crea tu primer correo, envía mensajes con fotos y maneja WhatsApp desde la pantalla grande de tu computadora.',
                longDescription: 'Aprenderás a enviar cartas electrónicas, ver correos que te envíen entidades de salud o familiares, y a vincular tu teléfono con tu computadora para leer tus mensajes en grande con total comodidad.',
                lessons: 6,
                duration: '3 horas',
                price: 'Gratuito',
                rating: 4.9,
                reviews: '2,100 alumnos',
                icon: 'fa-envelope-open-text',
                bgColor: 'bg-purple-600',
                syllabus: [
                    'Creación de tu primer correo electrónico en Gmail paso a paso.',
                    'Cómo leer correos entrantes y cómo redactar un correo nuevo.',
                    'Adjuntar una foto o un documento a un correo electrónico.',
                    'Cómo instalar o abrir WhatsApp Web en tu computadora.',
                    'Enviar mensajes, emojis y notas de voz desde la computadora.'
                ]
            },
            {
                id: 'c5',
                category: 'seguridad',
                categoryLabel: 'Seguridad Digital',
                title: 'Seguridad Digital Básica: Evita Estafas',
                description: 'Aprende a reconocer correos falsos, mensajes sospechosos en redes sociales y navega seguro evitando virus y estafas telefónicas.',
                longDescription: 'La seguridad es lo primero. En este taller te equiparemos con los conocimientos necesarios para identificar cuando una página web es peligrosa, crear claves muy seguras que no olvides y navegar sin temor.',
                lessons: 8,
                duration: '4 horas',
                price: 'S/. 39.00',
                rating: 4.9,
                reviews: '640 alumnos',
                icon: 'fa-shield-halved',
                bgColor: 'bg-rose-600',
                syllabus: [
                    '¿Qué es un virus informático y cómo entra a tu computadora?',
                    'Cómo crear y apuntar contraseñas seguras y fáciles de recordar.',
                    'Identificar ofertas falsas o premios mentirosos en internet.',
                    'Comprar de forma segura utilizando tarjetas digitales.',
                    'Qué hacer si tu computadora te lanza alertas sospechosas.'
                ]
            },
            {
                id: 'c6',
                category: 'comunicacion',
                categoryLabel: 'Servicios del Estado',
                title: 'Trámites en Línea y Servicios Digitales',
                description: 'Aprende a sacar tus citas de salud por internet, pagar tus servicios (agua, luz) en línea y hacer consultas en entidades gubernamentales de forma autónoma.',
                longDescription: 'Ahorra horas de colas y desplazamientos. Aprende a utilizar los portales web oficiales para realizar tus trámites cotidianos de forma segura y desde la calidez de tu hogar.',
                lessons: 6,
                duration: '3 horas',
                price: 'Gratuito',
                rating: 4.6,
                reviews: '430 alumnos',
                icon: 'fa-landmark',
                bgColor: 'bg-amber-600',
                syllabus: [
                    'Cómo ingresar y buscar de forma segura páginas web del Gobierno.',
                    'Descargar y guardar documentos en PDF (recibos, constancias).',
                    'Uso de pasarelas de pago oficiales para agua, luz y teléfono.',
                    'Solicitar citas médicas o consultar estados de trámites públicos.',
                    'Mantener tus datos personales seguros en portales del estado.'
                ]
            }
        ];

        let selectedCourseId = '';

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

            coursesList.forEach(course => {
                const card = document.createElement('div');
                card.className = "bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-150 flex flex-col justify-between hover:shadow-md transition-all";
                card.innerHTML = `
                    <div>
                        <div class="${course.bgColor} text-white h-36 flex items-center justify-center p-6 text-center relative">
                            <i class="fa-solid ${course.icon} text-5xl opacity-80"></i>
                            <span class="absolute top-3 right-3 bg-white/20 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded-lg">
                                ${course.price === 'Gratuito' ? 'Gratis' : 'Premium'}
                            </span>
                        </div>
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
                    <div class="px-6 pb-6 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span class="text-[11px] font-bold text-slate-500"><i class="fa-regular fa-clock"></i> ${course.lessons} Lecciones</span>
                        <button onclick="openCourseModal('${course.id}')" class="bg-brandLightBlue hover:bg-brandBlue text-white font-bold text-[10px] uppercase tracking-wide px-4 py-2 rounded-xl shadow-sm transition-all">
                            Ver Detalles
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // Filtrar Catálogo por Botones de Categorías
        function filterCatalog(category) {
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
            selectedCourseId = courseId;
            const course = coursesData.find(c => c.id === courseId);
            if (!course) return;

            document.getElementById('modalCourseCategory').innerText = course.categoryLabel;
            document.getElementById('modalCourseTitle').innerText = course.title;
            document.getElementById('modalCourseDescription').innerText = course.longDescription;
            document.getElementById('modalCourseLessons').innerText = `${course.lessons} Lecciones Prácticas`;
            document.getElementById('modalCourseDuration').innerText = course.duration;
            document.getElementById('modalCoursePrice').innerText = course.price;

            // Rellenar Temario
            const syllabusList = document.getElementById('modalCourseSyllabus');
            syllabusList.innerHTML = '';
            course.syllabus.forEach((topic, i) => {
                const li = document.createElement('li');
                li.className = "flex items-start gap-2 text-slate-600 text-[11px]";
                li.innerHTML = `<span class="bg-slate-100 text-slate-700 font-bold rounded-lg w-5 h-5 flex items-center justify-center text-[10px] shrink-0 mt-0.5">${i + 1}</span> <span class="leading-normal">${topic}</span>`;
                syllabusList.appendChild(li);
            });

            // Acción del Botón del Modal
            const actionBtn = document.getElementById('modalActionBtn');
            if (course.price === 'Gratuito') {
                actionBtn.innerText = 'Inscribirme Gratis';
                actionBtn.className = "bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-xl shadow-md transition-all";
            } else {
                actionBtn.innerText = `Comprar Curso (${course.price})`;
                actionBtn.className = "bg-brandAccent hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-xl shadow-md transition-all";
            }

            document.getElementById('courseDetailModal').classList.remove('hidden');
        }

        // Cerrar Modal de Detalle
        function closeCourseModal() {
            document.getElementById('courseDetailModal').classList.add('hidden');
        }

        // Simular Inscripción o Compra → redirige al desarrollo del curso
        function enrollInCurrentCourse() {
            const course = coursesData.find(c => c.id === selectedCourseId);
            if (!course) return;

            closeCourseModal();

            if (course.price === 'Gratuito') {
                triggerNotification(`¡Te has inscrito con éxito en: "${course.title}"! Abriendo el curso...`, "success");
            } else {
                triggerNotification(`¡Compra exitosa! Has adquirido "${course.title}" por ${course.price}. Abriendo el curso...`, "success");
            }
            setTimeout(() => openCourseContent(course.id), 900);
        }

        // ===== DESARROLLO DEL CURSO (Contenido) =====
        let currentCourseContentId = null;

        function _lessonsKey(id) { return `aulizeth_lessons_${id}`; }
        function _progressKey(id) { return `aulizeth_progress_${id}`; }

        function getCourseLessons(course) {
            const stored = localStorage.getItem(_lessonsKey(course.id));
            if (stored) {
                try { return JSON.parse(stored); } catch (e) {}
            }
            return [...(course.syllabus || [])];
        }
        function saveCourseLessons(courseId, lessons) {
            localStorage.setItem(_lessonsKey(courseId), JSON.stringify(lessons));
        }
        function getProgress(courseId) {
            try { return JSON.parse(localStorage.getItem(_progressKey(courseId)) || '{}'); } catch (e) { return {}; }
        }
        function saveProgress(courseId, prog) {
            localStorage.setItem(_progressKey(courseId), JSON.stringify(prog));
        }

        function openCourseContent(courseId) {
            const course = coursesData.find(c => c.id === courseId);
            if (!course) { triggerNotification("Curso no encontrado", "error"); return; }
            currentCourseContentId = courseId;

            document.getElementById('ccCategory').innerText = course.categoryLabel;
            document.getElementById('ccTitle').innerText = course.title;
            document.getElementById('ccDescription').innerText = course.longDescription || course.description;
            document.getElementById('ccDuration').innerText = course.duration;
            document.getElementById('ccPrice').innerText = course.price;

            renderCourseContentLessons();
            showSection('view-course-content');
            updateAdminPanelVisibility();
        }

        function renderCourseContentLessons() {
            const course = coursesData.find(c => c.id === currentCourseContentId);
            if (!course) return;
            const lessons = getCourseLessons(course);
            const progress = getProgress(course.id);
            const list = document.getElementById('ccLessons');
            document.getElementById('ccLessonCount').innerText = `${lessons.length} lecciones`;

            list.innerHTML = '';
            lessons.forEach((topic, i) => {
                const done = !!progress[i];
                const li = document.createElement('li');
                li.className = `flex items-start gap-3 p-3 border rounded-xl transition-all ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-150 hover:border-brandLightBlue'}`;
                li.innerHTML = `
                    <button onclick="toggleLessonDone(${i})" class="shrink-0 w-7 h-7 rounded-lg border-2 ${done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent hover:border-brandLightBlue'} flex items-center justify-center transition-all">
                        <i class="fa-solid fa-check text-[10px]"></i>
                    </button>
                    <div class="flex-1">
                        <span class="block text-[10px] font-bold text-slate-400 uppercase">Lección ${i + 1}</span>
                        <span class="text-xs ${done ? 'text-slate-500 line-through' : 'text-slate-700'} leading-snug">${topic}</span>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 self-center">${done ? '✓ Hecho' : 'Pendiente'}</span>
                    ${isAdmin() ? `<button onclick="adminDeleteLesson(${i})" class="text-red-500 hover:text-red-700 self-center text-xs px-2" title="Eliminar"><i class="fa-solid fa-trash"></i></button>` : ''}
                `;
                list.appendChild(li);
            });

            const pct = lessons.length ? Math.round((Object.values(progress).filter(Boolean).length / lessons.length) * 100) : 0;
            document.getElementById('ccProgressBar').style.width = pct + '%';
            document.getElementById('ccProgressLabel').innerText = pct + '% completado';
        }

        function toggleLessonDone(i) {
            const id = currentCourseContentId;
            const prog = getProgress(id);
            prog[i] = !prog[i];
            saveProgress(id, prog);
            renderCourseContentLessons();
        }

        // ===== ADMIN =====
        function isAdmin() { return localStorage.getItem('aulizeth_admin') === '1'; }

        function openAdminLogin() {
            document.getElementById('adminLoginModal').classList.remove('hidden');
        }
        function closeAdminLogin() {
            document.getElementById('adminLoginModal').classList.add('hidden');
        }
        function submitAdminLogin() {
            const u = document.getElementById('adminUser').value.trim();
            const p = document.getElementById('adminPass').value;
            if (u === 'admin' && p === 'admin123') {
                localStorage.setItem('aulizeth_admin', '1');
                closeAdminLogin();
                triggerNotification('Sesión de administrador iniciada. Ya puedes editar el curso.', 'success');
                updateAdminPanelVisibility();
                renderCourseContentLessons();
            } else {
                triggerNotification('Credenciales incorrectas. Usa admin / admin123.', 'error');
            }
        }
        function logoutAdmin() {
            localStorage.removeItem('aulizeth_admin');
            triggerNotification('Sesión de administrador cerrada.', 'info');
            updateAdminPanelVisibility();
            renderCourseContentLessons();
        }
        function updateAdminPanelVisibility() {
            const panel = document.getElementById('ccAdminPanel');
            if (panel) panel.classList.toggle('hidden', !isAdmin());
        }
        function adminAddLesson() {
            if (!isAdmin()) return;
            const input = document.getElementById('ccNewLesson');
            const txt = input.value.trim();
            if (!txt) return;
            const course = coursesData.find(c => c.id === currentCourseContentId);
            const lessons = getCourseLessons(course);
            lessons.push(txt);
            saveCourseLessons(course.id, lessons);
            input.value = '';
            triggerNotification('Lección añadida.', 'success');
            renderCourseContentLessons();
        }
        function adminDeleteLesson(i) {
            if (!isAdmin()) return;
            const course = coursesData.find(c => c.id === currentCourseContentId);
            const lessons = getCourseLessons(course);
            lessons.splice(i, 1);
            saveCourseLessons(course.id, lessons);
            const prog = getProgress(course.id);
            delete prog[i];
            saveProgress(course.id, prog);
            renderCourseContentLessons();
        }
        function openAdminCreateCourse() {
            if (!isAdmin()) return;
            const title = prompt('Título del nuevo curso:');
            if (!title) return;
            const category = prompt('Categoría (inicial / ofimatica / comunicacion / seguridad):', 'inicial') || 'inicial';
            const description = prompt('Descripción breve:') || '';
            const price = prompt('Precio (ej: Gratuito o S/. 49.00):', 'Gratuito') || 'Gratuito';
            const newCourse = {
                id: 'admin_' + Date.now(),
                category, categoryLabel: category.charAt(0).toUpperCase() + category.slice(1),
                title, description, longDescription: description,
                lessons: 0, duration: '— horas', price, rating: 5.0, reviews: 'Nuevo',
                icon: 'fa-star', bgColor: 'bg-amber-500',
                syllabus: ['Introducción al curso']
            };
            coursesData.push(newCourse);
            triggerNotification(`Curso "${title}" creado. Aparecerá en el catálogo.`, 'success');
            openCourseContent(newCourse.id);
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
            const destination = document.getElementById('forgotPwdEmail').value.trim();
            const method = (document.querySelector('input[name="recoveryMethod"]:checked') || {}).value || 'email';

            if (!destination) {
                triggerNotification('Por favor ingresa tu correo o celular.', 'info');
                return;
            }
            if (method === 'email' && !destination.includes('@')) {
                triggerNotification('Ese correo no parece válido. Revísalo, por favor.', 'error');
                return;
            }
            if (method === 'sms' && destination.replace(/\D/g, '').length < 7) {
                triggerNotification('Ingresa un número de celular válido.', 'error');
                return;
            }

            const btn = document.getElementById('sendCodeBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Enviando código...';

            setTimeout(() => {
                const code = generateRecoveryCode(destination, method);
                document.getElementById('recoveryDestination').textContent = maskDestination(destination, method);
                document.getElementById('demoCodeValue').textContent = code;
                document.getElementById('demoCodeHint').classList.remove('hidden');
                triggerNotification(
                    method === 'sms'
                        ? `Código enviado por SMS a ${maskDestination(destination, method)}`
                        : `Código enviado al correo ${maskDestination(destination, method)}`,
                    'success'
                );
                goToForgotStep(2);
                startResendTimer(30);
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar código de recuperación';
            }, 900);
        }

        function resendRecoveryCode() {
            if (!recoveryState.destination) {
                goToForgotStep(1);
                return;
            }
            const code = generateRecoveryCode(recoveryState.destination, recoveryState.method);
            document.getElementById('demoCodeValue').textContent = code;
            document.getElementById('demoCodeHint').classList.remove('hidden');
            triggerNotification('Hemos reenviado un nuevo código.', 'info');
            startResendTimer(30);
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
            // Actualizar textos informativos en el Dashboard
            document.getElementById('studentNameDisplay').innerText = studentData.fullName;
            document.getElementById('studentRouteDisplay').innerText = studentData.experience;

            // Mostrar el menú del estudiante y ocultar el del visitante
            document.getElementById('nav-visitor-actions').classList.add('hidden');
            document.getElementById('nav-student-actions').classList.remove('hidden');

            // Redireccionar al panel
            showSection('view-dashboard');
            initChatWelcome();
        }

        // Cambiar pestañas del Dashboard
        function switchTab(tabId) {
            const tabs = ['tab-ruta', 'tab-conceptos', 'tab-chat'];
            tabs.forEach(t => {
                document.getElementById(t).classList.add('hidden');
                document.getElementById(`btn-${t}`).className = "tab-btn w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-150";
            });

            document.getElementById(tabId).classList.remove('hidden');
            
            // Estilizar botón activo
            let activeColor = 'bg-brandBlue';
            if (tabId === 'tab-chat' || tabId === 'tab-ruta') activeColor = 'bg-purple-600';

            document.getElementById(`btn-${tabId}`).className = `tab-btn w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeColor} text-white shadow-sm`;
        }

        // PESTAÑA A: GENERAR RUTA DE APRENDIZAJE CON GEMINI (JSON)
        async function generateAILearningPath() {
            const output = document.getElementById('learningPathOutput');
            const btn = document.getElementById('generatePathBtn');

            output.classList.remove('hidden');
            output.innerHTML = `
                <div class="p-6 border border-purple-100 rounded-2xl bg-purple-50/50 flex flex-col items-center justify-center text-center gap-3">
                    <i class="fa-solid fa-spinner animate-spin text-purple-600 text-3xl"></i>
                    <p class="text-xs text-purple-950 font-semibold">Tutor de Inteligencia Artificial diseñando tu temario ideal...</p>
                    <p class="text-[10px] text-slate-400">Analizando el nivel: "${studentData.experience}" e intereses: "${studentData.customInterests}"</p>
                </div>
            `;
            btn.disabled = true;

            const systemPrompt = `Eres el tutor principal de la escuela Aulizeth. Diseñarás un plan de estudios estructurado de 4 pasos para un estudiante de computación básica.
Su nivel registrado es: "${studentData.experience}" y su interés inmediato actual es: "${studentData.customInterests}".
Responde obligatoriamente en formato JSON rígido que incluya un arreglo 'path' con 4 objetos, donde cada objeto tenga las propiedades 'step' (ej: Paso 1), 'title' (título de la clase), 'description' (explicación de lo que hará) y 'handsOn' (un pequeño ejercicio práctico y sencillo para hacer en casa).`;

            const payload = {
                contents: [{ parts: [{ text: "Generar plan de estudios personalizado de 4 pasos" }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "path": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "step": { "type": "STRING" },
                                        "title": { "type": "STRING" },
                                        "description": { "type": "STRING" },
                                        "handsOn": { "type": "STRING" }
                                    },
                                    "required": ["step", "title", "description", "handsOn"]
                                }
                            }
                        },
                        "required": ["path"]
                    }
                }
            };

            try {
                const response = await fetchGemini(payload);
                const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!resultText) throw new Error("No se pudo obtener la estructura de la ruta.");

                const data = JSON.parse(resultText);
                let pathHTML = `
                    <div class="border-b border-slate-100 pb-3">
                        <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase">¡Plan Generado con Éxito!</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                `;

                data.path.forEach(step => {
                    pathHTML += `
                        <div class="border border-slate-150 p-5 rounded-2xl bg-slate-50 space-y-3 flex flex-col justify-between">
                            <div class="space-y-1.5">
                                <span class="text-[9px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-md">${step.step}</span>
                                <h4 class="font-bold text-xs text-slate-800 leading-normal">${step.title}</h4>
                                <p class="text-[10.5px] text-slate-500 leading-relaxed">${step.description}</p>
                            </div>
                            <div class="p-3 bg-white border border-purple-100 rounded-xl mt-2">
                                <span class="block text-[9px] font-bold text-purple-700 uppercase tracking-wide"><i class="fa-solid fa-circle-play text-red-500"></i> Práctica del día:</span>
                                <p class="text-[10px] text-slate-600 font-medium mt-1 leading-normal">${step.handsOn}</p>
                            </div>
                        </div>
                    `;
                });

                pathHTML += `</div>`;
                output.innerHTML = pathHTML;
            } catch (err) {
                output.innerHTML = `
                    <div class="p-4 rounded-xl text-xs bg-red-50 border border-red-150 text-red-700">
                        No se pudo construir tu plan de aprendizaje. Error: ${err.message}. Ingresa tu Gemini API Key en el panel superior para habilitar el motor.
                    </div>
                `;
            } finally {
                btn.disabled = false;
            }
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
            renderCatalog(coursesData);
        };
