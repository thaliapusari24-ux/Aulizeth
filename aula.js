// ==============================
// Datos de los talleres activos
// (En un backend real, esto vendría de tu API)
// ==============================

const courses = [

    {
        id: "html-css",
        tag: "DISEÑO WEB",
        title: "Fundamentos de HTML y CSS",
        lesson: "Próxima clase: Flexbox y Grid",
        image: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=600&q=80&auto=format&fit=crop",
        modules: [
            {
                title: "Módulo 1 · Bases de HTML",
                lessons: [
                    {
                        title: "Estructura de un documento HTML",
                        type: "video",
                        duration: "8 min",
                        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                        description: "Aprende cómo se organiza un documento HTML: doctype, etiquetas principales y buenas prácticas de estructura."
                    },
                    {
                        title: "Etiquetas semánticas",
                        type: "texto",
                        duration: "6 min",
                        content: `
                            <p>Las etiquetas semánticas describen el significado del contenido, no solo su apariencia. Usarlas correctamente mejora la accesibilidad y el SEO de tu sitio.</p>
                            <ul>
                                <li><strong>&lt;header&gt;</strong>: encabezado de la página o de una sección.</li>
                                <li><strong>&lt;nav&gt;</strong>: bloque de enlaces de navegación.</li>
                                <li><strong>&lt;main&gt;</strong>: contenido principal, único por página.</li>
                                <li><strong>&lt;footer&gt;</strong>: pie de página con información complementaria.</li>
                            </ul>
                            <p>Antes de usar un &lt;div&gt; genérico, pregúntate si existe una etiqueta semántica más adecuada.</p>
                        `
                    }
                ]
            },
            {
                title: "Módulo 2 · Flexbox y Grid",
                lessons: [
                    {
                        title: "Introducción a Flexbox",
                        type: "video",
                        duration: "10 min",
                        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                        description: "Domina el modelo de caja flexible para alinear y distribuir elementos en una sola dirección."
                    },
                    {
                        title: "CSS Grid paso a paso",
                        type: "video",
                        duration: "12 min",
                        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                        description: "Construye layouts en dos dimensiones usando filas y columnas con CSS Grid."
                    },
                    {
                        title: "Cuestionario rápido",
                        type: "quiz",
                        duration: "4 min",
                        content: `
                            <p>Repasa lo aprendido respondiendo mentalmente:</p>
                            <ul>
                                <li>¿Qué propiedad activa Flexbox en un contenedor?</li>
                                <li>¿Cuál es la diferencia entre <strong>fr</strong> y <strong>%</strong> en Grid?</li>
                                <li>¿Cuándo conviene usar Grid en lugar de Flexbox?</li>
                            </ul>
                            <p>Cuando tengas tus respuestas, coméntalas con tu tutor en la próxima consulta.</p>
                        `
                    }
                ]
            }
        ]
    },

    {
        id: "js-cero",
        tag: "PROGRAMACIÓN",
        title: "JavaScript desde Cero",
        lesson: "Próxima clase: Eventos del DOM",
        image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80&auto=format&fit=crop",
        modules: [
            {
                title: "Módulo 1 · Bases del lenguaje",
                lessons: [
                    {
                        title: "Variables y tipos de datos",
                        type: "video",
                        duration: "9 min",
                        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                        description: "Diferencias entre let, const y var, y los tipos de datos primitivos de JavaScript."
                    },
                    {
                        title: "Funciones y arrow functions",
                        type: "texto",
                        duration: "7 min",
                        content: `
                            <p>Una función agrupa lógica reutilizable. En JavaScript moderno, las <strong>arrow functions</strong> ofrecen una sintaxis más corta:</p>
                            <ul>
                                <li><code>function saludar(nombre) { return "Hola " + nombre; }</code></li>
                                <li><code>const saludar = (nombre) => "Hola " + nombre;</code></li>
                            </ul>
                            <p>Ambas formas son válidas; las arrow functions además no crean su propio <code>this</code>, lo cual es útil dentro de callbacks.</p>
                        `
                    }
                ]
            },
            {
                title: "Módulo 2 · El DOM",
                lessons: [
                    {
                        title: "Seleccionar y modificar elementos",
                        type: "video",
                        duration: "11 min",
                        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                        description: "Cómo usar querySelector, textContent y classList para manipular el HTML desde JavaScript."
                    },
                    {
                        title: "Eventos del DOM",
                        type: "video",
                        duration: "10 min",
                        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                        description: "Escucha clics, envíos de formularios y otras interacciones del usuario con addEventListener."
                    },
                    {
                        title: "Recursos de la clase",
                        type: "texto",
                        duration: "3 min",
                        content: `
                            <p>Guarda estos recursos para practicar por tu cuenta:</p>
                            <ul>
                                <li>Documentación oficial de eventos del DOM (MDN).</li>
                                <li>Reto práctico: construir una lista de tareas interactiva.</li>
                            </ul>
                        `
                    }
                ]
            }
        ]
    },

    {
        id: "ux-ui",
        tag: "DISEÑO UX/UI",
        title: "Principios de Experiencia de Usuario",
        lesson: "Próxima clase: Wireframing",
        image: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=600&q=80&auto=format&fit=crop",
        modules: [
            {
                title: "Módulo 1 · Fundamentos de UX",
                lessons: [
                    {
                        title: "¿Qué es la experiencia de usuario?",
                        type: "video",
                        duration: "7 min",
                        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                        description: "Los principios que hacen que un producto digital sea útil, usable y agradable."
                    },
                    {
                        title: "Investigación de usuarios",
                        type: "texto",
                        duration: "8 min",
                        content: `
                            <p>Antes de diseñar, es clave entender a quién diseñamos. Algunas técnicas comunes:</p>
                            <ul>
                                <li><strong>Entrevistas</strong>: conversaciones abiertas con usuarios reales.</li>
                                <li><strong>Encuestas</strong>: preguntas cerradas para obtener datos cuantitativos.</li>
                                <li><strong>Pruebas de usabilidad</strong>: observar a alguien usando el producto.</li>
                            </ul>
                        `
                    }
                ]
            },
            {
                title: "Módulo 2 · Del boceto al prototipo",
                lessons: [
                    {
                        title: "Wireframing",
                        type: "video",
                        duration: "9 min",
                        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
                        description: "Cómo bocetar la estructura de una pantalla antes de pensar en colores o tipografías."
                    },
                    {
                        title: "De wireframe a prototipo interactivo",
                        type: "texto",
                        duration: "6 min",
                        content: `
                            <p>Un prototipo interactivo permite validar el flujo de navegación antes de programar nada. Herramientas comunes incluyen Figma y Adobe XD.</p>
                            <p>Recuerda: un buen prototipo responde una pregunta concreta, no intenta cubrir todo el producto de una vez.</p>
                        `
                    }
                ]
            }
        ]
    }

];


// ==============================
// Progreso guardado localmente
// ==============================

const PROGRESS_KEY = "aulizeth_progress";

function loadProgress() {

    try {
        return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
    } catch (e) {
        return {};
    }

}

function saveProgress(progress) {

    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));

}

let progressData = loadProgress();

function lessonKey(courseId, moduleIndex, lessonIndex) {

    return `${courseId}-${moduleIndex}-${lessonIndex}`;

}

function isLessonCompleted(course, moduleIndex, lessonIndex) {

    const key = lessonKey(course.id, moduleIndex, lessonIndex);
    return !!progressData[key];

}

function totalLessons(course) {

    return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

}

function completedLessons(course) {

    let count = 0;

    course.modules.forEach((m, mIdx) => {
        m.lessons.forEach((l, lIdx) => {
            if (isLessonCompleted(course, mIdx, lIdx)) count++;
        });
    });

    return count;

}

function courseProgress(course) {

    const total = totalLessons(course);
    if (total === 0) return 0;
    return Math.round((completedLessons(course) / total) * 100);

}


// ==============================
// Bienvenida personalizada
// (toma el correo enviado por la página de login vía la URL)
// ==============================

function setWelcomeName() {

    const params = new URLSearchParams(window.location.search);
    const email = params.get("correo");

    const welcomeTitle = document.getElementById("welcomeTitle");
    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");

    if (email) {

        const namePart = email.split("@")[0];
        const displayName = namePart
            .replace(/[._]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

        welcomeTitle.textContent = `¡Hola, ${displayName}!`;
        userName.textContent = displayName;
        userAvatar.textContent = displayName.charAt(0).toUpperCase();

    }

}


// ==============================
// Estadísticas del banner de bienvenida
// ==============================

function renderStats() {

    const statCourses = document.getElementById("statCourses");
    const statProgress = document.getElementById("statProgress");

    statCourses.textContent = courses.length;

    const avg = courses.length
        ? Math.round(courses.reduce((sum, c) => sum + courseProgress(c), 0) / courses.length)
        : 0;

    statProgress.textContent = `${avg}%`;

}


// ==============================
// Renderizar tarjetas de talleres
// ==============================

function renderCourses() {

    const grid = document.getElementById("coursesGrid");

    grid.innerHTML = courses.map((course, index) => {

        const progress = courseProgress(course);

        return `
        <div class="course-card">
            <div class="course-card-image">
                <img src="${course.image}" alt="${course.title}" loading="lazy">
                <span class="course-tag">${course.tag}</span>
            </div>
            <div class="course-card-body">
                <h3>${course.title}</h3>
                <p class="lesson">${course.lesson}</p>
                <div class="progress-track">
                    <div class="progress-fill" id="progress-${index}"></div>
                </div>
                <div class="progress-label">
                    <span>Progreso</span>
                    <span>${progress}%</span>
                </div>
                <button class="btn-continue" data-course-index="${index}">
                    <i class="fa-solid fa-play"></i> ${progress > 0 ? "Continuar" : "Empezar"}
                </button>
            </div>
        </div>
    `;

    }).join("");

    // Animar las barras de progreso después de insertarlas en el DOM
    requestAnimationFrame(() => {

        courses.forEach((course, index) => {

            const bar = document.getElementById(`progress-${index}`);
            if (bar) bar.style.width = `${courseProgress(course)}%`;

        });

    });

    // Delegar el click de "Continuar / Empezar" a cada tarjeta
    grid.querySelectorAll(".btn-continue").forEach((btn) => {

        btn.addEventListener("click", () => {

            const index = parseInt(btn.dataset.courseIndex, 10);
            openCourseViewer(index);

        });

    });

}


// ==============================
// Visor de taller (módulos + lecciones)
// ==============================

const viewer = {
    courseIndex: null,
    moduleIndex: 0,
    lessonIndex: 0
};

const viewerEl = document.getElementById("courseViewer");
const viewerSidebar = document.getElementById("viewerSidebar");
const viewerContent = document.getElementById("viewerContent");
const viewerCourseTitle = document.getElementById("viewerCourseTitle");
const viewerTag = document.getElementById("viewerTag");
const viewerProgressFill = document.getElementById("viewerProgressFill");
const viewerProgressLabel = document.getElementById("viewerProgressLabel");

function currentCourse() {

    return courses[viewer.courseIndex];

}

function findFirstIncomplete(course) {

    for (let m = 0; m < course.modules.length; m++) {

        for (let l = 0; l < course.modules[m].lessons.length; l++) {

            if (!isLessonCompleted(course, m, l)) {
                return { moduleIndex: m, lessonIndex: l };
            }

        }

    }

    return { moduleIndex: 0, lessonIndex: 0 };

}

function openCourseViewer(courseIndex) {

    viewer.courseIndex = courseIndex;

    const course = currentCourse();
    const start = findFirstIncomplete(course);

    viewer.moduleIndex = start.moduleIndex;
    viewer.lessonIndex = start.lessonIndex;

    viewerTag.textContent = course.tag;
    viewerCourseTitle.textContent = course.title;

    renderViewerSidebar();
    renderViewerLesson();
    updateViewerProgress();

    viewerEl.classList.add("is-open");
    viewerEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

}

function closeCourseViewer() {

    viewerEl.classList.remove("is-open");
    viewerEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    // Refrescar las tarjetas y estadísticas por si hubo lecciones completadas
    renderCourses();
    renderStats();

}

function updateViewerProgress() {

    const course = currentCourse();
    const pct = courseProgress(course);

    viewerProgressFill.style.width = `${pct}%`;
    viewerProgressLabel.textContent = `${pct}% completado`;

}

const lessonIcons = {
    video: "fa-solid fa-play",
    texto: "fa-solid fa-file-lines",
    quiz: "fa-solid fa-circle-question"
};

function renderViewerSidebar() {

    const course = currentCourse();

    viewerSidebar.innerHTML = course.modules.map((module, mIdx) => `
        <div class="viewer-module">
            <div class="viewer-module-title">${module.title}</div>
            ${module.lessons.map((lesson, lIdx) => {

                const completed = isLessonCompleted(course, mIdx, lIdx);
                const active = mIdx === viewer.moduleIndex && lIdx === viewer.lessonIndex;

                return `
                    <div class="viewer-lesson ${completed ? "completed" : ""} ${active ? "active" : ""}"
                         data-module-index="${mIdx}" data-lesson-index="${lIdx}">
                        <div class="viewer-lesson-icon">
                            <i class="${completed ? "fa-solid fa-check" : lessonIcons[lesson.type]}"></i>
                        </div>
                        <div class="viewer-lesson-info">
                            <p>${lesson.title}</p>
                            <span>${lesson.duration}</span>
                        </div>
                    </div>
                `;

            }).join("")}
        </div>
    `).join("");

    viewerSidebar.querySelectorAll(".viewer-lesson").forEach((el) => {

        el.addEventListener("click", () => {

            viewer.moduleIndex = parseInt(el.dataset.moduleIndex, 10);
            viewer.lessonIndex = parseInt(el.dataset.lessonIndex, 10);

            renderViewerSidebar();
            renderViewerLesson();

        });

    });

}

function getAdjacentLesson(direction) {

    const course = currentCourse();
    const flat = [];

    course.modules.forEach((m, mIdx) => {
        m.lessons.forEach((l, lIdx) => flat.push({ mIdx, lIdx }));
    });

    const currentFlatIndex = flat.findIndex(
        (item) => item.mIdx === viewer.moduleIndex && item.lIdx === viewer.lessonIndex
    );

    const targetIndex = currentFlatIndex + direction;

    if (targetIndex < 0 || targetIndex >= flat.length) return null;

    return flat[targetIndex];

}

function renderViewerLesson() {

    const course = currentCourse();
    const module = course.modules[viewer.moduleIndex];
    const lesson = module.lessons[viewer.lessonIndex];
    const completed = isLessonCompleted(course, viewer.moduleIndex, viewer.lessonIndex);

    const typeLabel = { video: "Video", texto: "Lectura", quiz: "Actividad" }[lesson.type];

    let bodyHtml = "";

    if (lesson.type === "video") {

        bodyHtml = `
            <div class="lesson-video">
                <video controls src="${lesson.videoUrl}"></video>
            </div>
            <div class="lesson-text"><p>${lesson.description}</p></div>
        `;

    } else {

        bodyHtml = `<div class="lesson-text">${lesson.content}</div>`;

    }

    const prev = getAdjacentLesson(-1);
    const next = getAdjacentLesson(1);

    viewerContent.innerHTML = `
        <div class="lesson-eyebrow">
            <i class="${lessonIcons[lesson.type]}"></i> ${typeLabel} · ${lesson.duration}
        </div>
        <h1>${lesson.title}</h1>

        ${bodyHtml}

        <div class="lesson-resource-box">
            <i class="fa-solid fa-lightbulb"></i>
            <div>
                <h4>Consejo de tu tutor</h4>
                <p>Practica lo aprendido antes de avanzar a la siguiente lección. Si tienes dudas, agenda una consulta desde tu Aula.</p>
            </div>
        </div>

        <div class="viewer-actions">
            <div class="viewer-nav-btns">
                <button class="btn-secondary" id="prevLessonBtn" ${prev ? "" : "disabled"}>
                    <i class="fa-solid fa-arrow-left"></i> Anterior
                </button>
                <button class="btn-secondary" id="nextLessonBtn" ${next ? "" : "disabled"}>
                    Siguiente <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>

            <button class="btn-complete ${completed ? "is-done" : ""}" id="completeLessonBtn">
                <i class="fa-solid ${completed ? "fa-check" : "fa-circle-check"}"></i>
                ${completed ? "Lección completada" : "Marcar como completada"}
            </button>
        </div>
    `;

    document.getElementById("completeLessonBtn").addEventListener("click", toggleLessonComplete);

    const prevBtn = document.getElementById("prevLessonBtn");
    const nextBtn = document.getElementById("nextLessonBtn");

    if (prev) {
        prevBtn.addEventListener("click", () => goToLesson(prev));
    }

    if (next) {
        nextBtn.addEventListener("click", () => goToLesson(next));
    }

}

function goToLesson(target) {

    viewer.moduleIndex = target.mIdx;
    viewer.lessonIndex = target.lIdx;

    renderViewerSidebar();
    renderViewerLesson();

}

function toggleLessonComplete() {

    const course = currentCourse();
    const key = lessonKey(course.id, viewer.moduleIndex, viewer.lessonIndex);

    progressData[key] = !progressData[key];
    saveProgress(progressData);

    renderViewerSidebar();
    renderViewerLesson();
    updateViewerProgress();

    // Si acaba de completar la lección, avanzar automáticamente a la siguiente
    if (progressData[key]) {

        const next = getAdjacentLesson(1);
        if (next) {
            setTimeout(() => goToLesson(next), 450);
        }

    }

}

document.getElementById("closeViewer").addEventListener("click", closeCourseViewer);
document.getElementById("viewerOverlay").addEventListener("click", closeCourseViewer);

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape" && viewerEl.classList.contains("is-open")) {
        closeCourseViewer();
    }

});


// ==============================
// Cerrar sesión
// ==============================

document.getElementById("logoutBtn").addEventListener("click", () => {

    window.location.href = "iniciarsesión.html";

});


// ==============================
// Inicialización
// ==============================

setWelcomeName();
renderCourses();
renderStats();
