/*=====================================================
  AULIZETH — Cursos (lógica 100% funcional, sin backend)
  Persistencia local: localStorage
=====================================================*/

// ---------- CURSOS FIJOS (5) ----------
const CURSOS_BASE = [
    {
        id: "base-1",
        titulo: "Introducción a la Computación",
        categoria: "computacion",
        autor: "Prof. Lizeth Pusari Gomez",
        descripcion: "Aprende los fundamentos del uso de una computadora, sistemas operativos y ofimática básica.",
        imagen: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
        lecciones: [
            { titulo: "¿Qué es una computadora?", contenido: "Una computadora es una máquina electrónica capaz de recibir datos, procesarlos y entregar resultados.\n\nComponentes principales:\n• Hardware: partes físicas (CPU, monitor, teclado)\n• Software: programas y sistema operativo\n\nEjemplo: cuando escribes en Word, el teclado (hardware) envía señales al sistema operativo, que las muestra en Word (software)." },
            { titulo: "Sistemas operativos", contenido: "El sistema operativo (SO) es el software que gestiona el hardware y permite ejecutar otros programas.\n\nMás usados:\n• Windows\n• macOS\n• Linux\n• Android / iOS\n\nSu función es traducir tus acciones (clic, tecla) en órdenes que la computadora entiende." }
        ]
    },
    {
        id: "base-2",
        titulo: "Diseño Gráfico desde Cero",
        categoria: "diseno",
        autor: "Prof. Karen Gomez",
        descripcion: "Descubre los principios del diseño: color, tipografía y composición para crear piezas visuales impactantes.",
        imagen: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
        lecciones: [
            { titulo: "Teoría del color", contenido: "El color transmite emociones y guía la mirada.\n\n• Colores cálidos (rojo, naranja): energía\n• Colores fríos (azul, verde): calma\n• Complementarios: contraste alto\n• Análogos: armonía\n\nRegla 60-30-10: 60% color dominante, 30% secundario, 10% acento." },
            { titulo: "Tipografía y jerarquía", contenido: "Usa máximo 2 familias tipográficas por diseño.\n\n• Serif (Times): formales, editoriales\n• Sans-serif (Poppins): modernas, digitales\n\nJerarquía: títulos grandes y en negrita, cuerpo cómodo (16px), interlineado 1.5. La jerarquía guía al lector paso a paso." }
        ]
    },
    {
        id: "base-3",
        titulo: "Programación Web con HTML y CSS",
        categoria: "programacion",
        autor: "Luis Mendoza",
        descripcion: "Crea tu primera página web desde cero. Estructura con HTML y estiliza con CSS moderno.",
        imagen: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
        lecciones: [
            { titulo: "Estructura HTML", contenido: "HTML define la estructura de una página con etiquetas.\n\nEjemplo:\n<h1>Título</h1>\n<p>Un párrafo</p>\n<a href='https://...'>Enlace</a>\n\nToda página empieza con <!DOCTYPE html> y contiene <head> (metadatos) y <body> (contenido visible)." },
            { titulo: "Estilos con CSS", contenido: "CSS controla la apariencia.\n\nEjemplo:\nh1 { color: blue; font-size: 32px; }\n.boton { background: #2454d6; padding: 12px; }\n\nSelectores: por etiqueta (h1), por clase (.boton) o por id (#header). Con CSS controlas colores, tamaños, espacios y animaciones." }
        ]
    },
    {
        id: "base-4",
        titulo: "Marketing Digital para Principiantes",
        categoria: "marketing",
        autor: "María Torres",
        descripcion: "Aprende cómo funcionan las redes sociales, el SEO y las estrategias para hacer crecer tu marca.",
        imagen: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
        lecciones: [
            { titulo: "¿Qué es el marketing digital?", contenido: "Es la promoción de productos o servicios usando canales digitales: redes sociales, buscadores, email y sitios web.\n\nVentajas:\n• Bajo costo comparado con medios tradicionales\n• Medición en tiempo real\n• Segmentación precisa del público\n\nCanales principales: Instagram, TikTok, Google, Facebook, YouTube." },
            { titulo: "SEO básico", contenido: "SEO = Search Engine Optimization: hacer que tu web aparezca en Google.\n\nClaves:\n• Palabras clave relevantes en títulos\n• Contenido útil y original\n• Velocidad de carga rápida\n• Enlaces desde otras webs de confianza\n\nEl mejor SEO nace de contenido que realmente ayuda al lector." }
        ]
    },
    {
        id: "base-5",
        titulo: "Excel Práctico",
        categoria: "computacion",
        autor: "Carlos Peña",
        descripcion: "Domina Excel con fórmulas esenciales, tablas y gráficos que aplicarás en tu día a día.",
        imagen: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800",
        lecciones: [
            { titulo: "Fórmulas básicas", contenido: "Toda fórmula empieza con =\n\nMás usadas:\n• =SUMA(A1:A10) suma un rango\n• =PROMEDIO(A1:A10) calcula la media\n• =SI(A1>10;\"Alto\";\"Bajo\") condicional\n• =CONTAR(A1:A10) cuenta números\n\nUsa $ para fijar celdas: =A$1*B2 (A1 fijo, B2 se mueve)." },
            { titulo: "Gráficos y tablas", contenido: "Los gráficos convierten datos en información visual.\n\nPasos:\n1. Selecciona los datos\n2. Menú Insertar → Gráfico\n3. Elige el tipo: columnas (comparar), líneas (tendencias), pastel (proporciones)\n\nUsa tablas dinámicas para resumir grandes volúmenes de datos con clics." }
        ]
    }
];

// ---------- STORAGE ----------
const K_CREADOS = "aulizeth_cursos_creados";
const K_INSCRIPCIONES = "aulizeth_inscripciones"; // { cursoId: [leccionIdx completadas] }

const store = {
    getCreados: () => JSON.parse(localStorage.getItem(K_CREADOS) || "[]"),
    setCreados: (v) => localStorage.setItem(K_CREADOS, JSON.stringify(v)),
    getInscripciones: () => JSON.parse(localStorage.getItem(K_INSCRIPCIONES) || "{}"),
    setInscripciones: (v) => localStorage.setItem(K_INSCRIPCIONES, JSON.stringify(v)),
};

// ---------- HELPERS ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function toast(msg, tipo = "") {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast mostrar " + tipo;
    setTimeout(() => t.classList.remove("mostrar"), 2600);
}

function todosLosCursos() {
    return [...CURSOS_BASE, ...store.getCreados()];
}

function getCursoPorId(id) {
    return todosLosCursos().find(c => c.id === id);
}

function progresoDe(curso) {
    const insc = store.getInscripciones()[curso.id];
    if (!insc) return { inscrito: false, pct: 0, completadas: [] };
    const pct = Math.round((insc.length / curso.lecciones.length) * 100);
    return { inscrito: true, pct, completadas: insc, terminado: pct === 100 };
}

// ---------- RENDER TARJETA ----------
function tarjetaHTML(curso, esCreado = false) {
    const prog = progresoDe(curso);
    const imgStyle = curso.imagen ? `style="background-image:url('${curso.imagen}')"` : "";
    let badge = "";
    if (prog.terminado) badge = `<div class="curso-badge completo"><i class="fa-solid fa-check"></i> Completado</div>`;
    else if (prog.inscrito) badge = `<div class="curso-badge progreso">${prog.pct}%</div>`;
    else badge = `<div class="curso-badge">Gratis</div>`;

    let boton;
    if (prog.terminado) boton = `<button class="btn-curso btn-ver" data-abrir="${curso.id}"><i class="fa-solid fa-eye"></i> Ver curso</button>`;
    else if (prog.inscrito) boton = `<button class="btn-curso btn-continuar" data-abrir="${curso.id}"><i class="fa-solid fa-play"></i> Continuar</button>`;
    else boton = `<button class="btn-curso btn-inscribir" data-abrir="${curso.id}"><i class="fa-solid fa-graduation-cap"></i> Inscribirme</button>`;

    const btnEliminar = esCreado ? `<button class="btn-curso btn-eliminar" data-eliminar="${curso.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>` : "";

    const barra = prog.inscrito ? `<div class="progreso-bar"><div style="width:${prog.pct}%"></div></div>` : "";

    return `
    <div class="curso" data-cat="${curso.categoria}" data-titulo="${curso.titulo.toLowerCase()}">
        <div class="curso-img" ${imgStyle}>${badge}</div>
        <div class="curso-info">
            <h3>${escapeHTML(curso.titulo)}</h3>
            <div class="curso-autor"><i class="fa-solid fa-user"></i>${escapeHTML(curso.autor)}</div>
            <p class="curso-desc">${escapeHTML(curso.descripcion)}</p>
            <div class="curso-meta">
                <span><i class="fa-solid fa-book-open"></i>${curso.lecciones.length} lecciones</span>
                <span><i class="fa-solid fa-tag"></i>${cap(curso.categoria)}</span>
            </div>
            ${barra}
            <div class="curso-acciones">${boton}${btnEliminar}</div>
        </div>
    </div>`;
}

function escapeHTML(s = "") {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---------- RENDER LISTAS ----------
let filtroCat = "todos";
let filtroTexto = "";

function renderTodo() {
    // base
    const base = CURSOS_BASE.filter(c => filtroCat === "todos" || c.categoria === filtroCat)
        .filter(c => c.titulo.toLowerCase().includes(filtroTexto));
    $("#gridCursos").innerHTML = base.map(c => tarjetaHTML(c, false)).join("") || `<p class="vacio">Sin resultados</p>`;

    // creados
    const creados = store.getCreados().filter(c => filtroCat === "todos" || c.categoria === filtroCat)
        .filter(c => c.titulo.toLowerCase().includes(filtroTexto));
    $("#gridCreados").innerHTML = creados.map(c => tarjetaHTML(c, true)).join("");
    $("#sinCreados").style.display = creados.length ? "none" : "block";

    // mis inscripciones
    const insc = store.getInscripciones();
    const mis = todosLosCursos().filter(c => insc[c.id]);
    $("#gridMis").innerHTML = mis.map(c => tarjetaHTML(c, false)).join("");
    $("#sinMis").style.display = mis.length ? "none" : "block";
}

// ---------- VISTAS ----------
function mostrarVista(v) {
    $("#crearSection").style.display = v === "crear" ? "block" : "none";
    $("#misSection").style.display = v === "mis" ? "block" : "none";
    $(".cursos-section").style.display = (v === "home" || v === "cursos") ? "block" : "none";
    $(".hero").style.display = (v === "home" || v === "cursos") ? "block" : "none";
    $(".categorias").style.display = (v === "home" || v === "cursos") ? "grid" : "none";

    $$(".menu a").forEach(a => a.classList.toggle("activo", a.dataset.view === v));
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------- MODAL / LECCIONES ----------
let cursoActivoId = null;
let leccionActiva = 0;

function abrirCurso(id) {
    const curso = getCursoPorId(id);
    if (!curso) return;

    // inscribir si no lo está
    const insc = store.getInscripciones();
    if (!insc[id]) {
        insc[id] = [];
        store.setInscripciones(insc);
        toast("¡Te inscribiste al curso!", "exito");
    }

    cursoActivoId = id;
    leccionActiva = 0;
    renderModal();
    $("#modalCurso").classList.add("abierto");
    document.body.style.overflow = "hidden";
}

function renderModal() {
    const curso = getCursoPorId(cursoActivoId);
    const prog = progresoDe(curso);
    const imgStyle = curso.imagen ? `style="background-image:url('${curso.imagen}')"` : "";

    const leccionActual = curso.lecciones[leccionActiva];
    const yaCompleta = prog.completadas.includes(leccionActiva);

    const lista = curso.lecciones.map((l, i) => {
        const done = prog.completadas.includes(i);
        const activa = i === leccionActiva ? "activa" : "";
        return `<li class="leccion ${done ? "completada" : ""} ${activa}" data-lec="${i}">
            <div class="leccion-num">${done ? '<i class="fa-solid fa-check"></i>' : (i + 1)}</div>
            <div class="leccion-titulo">${escapeHTML(l.titulo)}</div>
            <div class="leccion-status">${done ? "Completada" : "Pendiente"}</div>
        </li>`;
    }).join("");

    const completadoBanner = prog.terminado ? `
        <div class="curso-completado">
            <i class="fa-solid fa-trophy"></i>
            <h3>¡Curso completado!</h3>
            <p>Terminaste todas las lecciones de "${escapeHTML(curso.titulo)}". ¡Sigue aprendiendo!</p>
        </div>` : "";

    $("#modalBody").innerHTML = `
        <div class="modal-header" ${imgStyle}>
            <h2>${escapeHTML(curso.titulo)}</h2>
        </div>
        <div class="modal-cuerpo">
            <div class="modal-meta">
                <span><i class="fa-solid fa-user"></i>${escapeHTML(curso.autor)}</span>
                <span><i class="fa-solid fa-book-open"></i>${curso.lecciones.length} lecciones</span>
                <span><i class="fa-solid fa-tag"></i>${cap(curso.categoria)}</span>
                <span><i class="fa-solid fa-chart-line"></i>${prog.pct}% completado</span>
            </div>
            <p class="modal-desc">${escapeHTML(curso.descripcion)}</p>
            <div class="progreso-bar" style="margin-bottom:24px"><div style="width:${prog.pct}%"></div></div>

            <h3 style="color:#0f1a3d;margin-bottom:14px;">Lecciones</h3>
            <ul class="lecciones-lista">${lista}</ul>

            <div class="contenido-leccion">
                <strong>Lección ${leccionActiva + 1}: ${escapeHTML(leccionActual.titulo)}</strong>
                <br><br>${escapeHTML(leccionActual.contenido)}
            </div>

            <div style="display:flex;gap:10px;justify-content:flex-end;">
                ${yaCompleta
                    ? `<button class="btn-completar" disabled><i class="fa-solid fa-check"></i> Lección completada</button>`
                    : `<button class="btn-completar" id="btnCompletar"><i class="fa-solid fa-check"></i> Marcar como completada</button>`}
            </div>

            ${completadoBanner}
        </div>
    `;

    $$(".leccion").forEach(li => li.addEventListener("click", () => {
        leccionActiva = parseInt(li.dataset.lec);
        renderModal();
    }));

    const btnComp = $("#btnCompletar");
    if (btnComp) btnComp.addEventListener("click", () => {
        const insc = store.getInscripciones();
        if (!insc[cursoActivoId].includes(leccionActiva)) {
            insc[cursoActivoId].push(leccionActiva);
            store.setInscripciones(insc);
        }
        // avanzar si hay siguiente
        const curso = getCursoPorId(cursoActivoId);
        const p = progresoDe(curso);
        if (p.terminado) {
            toast("🎉 ¡Felicidades, curso completado!", "exito");
        } else {
            toast("Lección completada", "exito");
            if (leccionActiva < curso.lecciones.length - 1) leccionActiva++;
        }
        renderModal();
        renderTodo();
    });
}

function cerrarModal() {
    $("#modalCurso").classList.remove("abierto");
    document.body.style.overflow = "";
    cursoActivoId = null;
}

// ---------- CREAR CURSO ----------
function agregarLeccionForm() {
    const div = document.createElement("div");
    div.className = "leccion-item";
    div.innerHTML = `
        <input type="text" placeholder="Título de la lección" class="lec-titulo" required>
        <textarea placeholder="Contenido de la lección..." class="lec-contenido" rows="2" required></textarea>
        <button type="button" class="btn-quitar-lec"><i class="fa-solid fa-xmark"></i></button>
    `;
    div.querySelector(".btn-quitar-lec").addEventListener("click", () => {
        if ($$("#leccionesWrap .leccion-item").length > 1) div.remove();
        else toast("Debe haber al menos 1 lección", "error");
    });
    $("#leccionesWrap").appendChild(div);
}

function bindLecInicial() {
    document.querySelector("#leccionesWrap .btn-quitar-lec").addEventListener("click", (e) => {
        if ($$("#leccionesWrap .leccion-item").length > 1) e.target.closest(".leccion-item").remove();
        else toast("Debe haber al menos 1 lección", "error");
    });
}

async function fileToDataURL(file) {
    return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
    });
}

$("#formCurso").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const titulo = f.titulo.value.trim();
    const categoria = f.categoria.value;
    const autor = f.autor.value.trim();
    const descripcion = f.descripcion.value.trim();
    const imgUrl = f.imagenUrl.value.trim();
    const imgFile = f.imagenArchivo.files[0];

    const lecciones = [...$$("#leccionesWrap .leccion-item")].map(item => ({
        titulo: item.querySelector(".lec-titulo").value.trim(),
        contenido: item.querySelector(".lec-contenido").value.trim()
    })).filter(l => l.titulo && l.contenido);

    if (!titulo || !autor || !descripcion || lecciones.length === 0) {
        toast("Completa todos los campos y añade al menos 1 lección", "error");
        return;
    }

    let imagen = imgUrl;
    if (imgFile) {
        try { imagen = await fileToDataURL(imgFile); }
        catch { toast("Error leyendo imagen", "error"); }
    }
    if (!imagen) {
        // portada por defecto según categoría
        const defaults = {
            computacion: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
            diseno: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800",
            programacion: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
            marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
        };
        imagen = defaults[categoria];
    }

    const nuevo = {
        id: "user-" + Date.now(),
        titulo, categoria, autor, descripcion, imagen, lecciones,
        creadoEn: new Date().toISOString()
    };

    const creados = store.getCreados();
    creados.unshift(nuevo);
    store.setCreados(creados);

    toast("¡Curso publicado con éxito!", "exito");
    f.reset();
    // resetear lecciones a una
    $("#leccionesWrap").innerHTML = `
        <label class="lecciones-label">Lecciones <span class="hint">(mínimo 1)</span></label>
        <div class="leccion-item">
            <input type="text" placeholder="Título de la lección" class="lec-titulo" required>
            <textarea placeholder="Contenido de la lección..." class="lec-contenido" rows="2" required></textarea>
            <button type="button" class="btn-quitar-lec"><i class="fa-solid fa-xmark"></i></button>
        </div>`;
    bindLecInicial();
    renderTodo();
    mostrarVista("cursos");
});

// ---------- EVENTOS GLOBALES ----------
document.addEventListener("click", (e) => {
    const abrir = e.target.closest("[data-abrir]");
    if (abrir) { abrirCurso(abrir.dataset.abrir); return; }

    const eliminar = e.target.closest("[data-eliminar]");
    if (eliminar) {
        const id = eliminar.dataset.eliminar;
        if (confirm("¿Eliminar este curso? Esta acción no se puede deshacer.")) {
            store.setCreados(store.getCreados().filter(c => c.id !== id));
            const insc = store.getInscripciones();
            delete insc[id];
            store.setInscripciones(insc);
            toast("Curso eliminado", "exito");
            renderTodo();
        }
        return;
    }

    const view = e.target.closest("[data-view]");
    if (view) { e.preventDefault(); mostrarVista(view.dataset.view); return; }

    const cat = e.target.closest("[data-cat]");
    if (cat) {
        $$(".categoria").forEach(c => c.classList.remove("activa"));
        cat.classList.add("activa");
        filtroCat = cat.dataset.cat;
        renderTodo();
    }
});

$("#cerrarModal").addEventListener("click", cerrarModal);
$("#modalCurso").addEventListener("click", (e) => { if (e.target.id === "modalCurso") cerrarModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarModal(); });

$("#addLeccion").addEventListener("click", agregarLeccionForm);

// header sombra al scroll
window.addEventListener("scroll", () => {
    const h = document.querySelector("header");
    h.style.boxShadow = window.scrollY > 60 ? "0 8px 20px rgba(0,0,0,.15)" : "0 2px 10px rgba(0,0,0,.08)";
});

// ---------- INIT ----------
bindLecInicial();
renderTodo();
mostrarVista("cursos");
