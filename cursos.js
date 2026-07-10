/*=====================================================
  AULIZETH — Cursos (con capacidades de admin en línea)
  - Alumnos: ven todos los cursos (base + admin + comunidad)
  - Admin: puede crear, EDITAR y ELIMINAR cursos desde esta misma
    página. Los cambios se guardan en Firestore y quedan
    visibles al instante para todos los alumnos.
=====================================================*/

import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
    collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc,
    query, orderBy, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ---------- BASE (fallback si Firestore está vacío) ----------
const CURSOS_BASE = [];

// ---------- STORAGE local ----------
const K_CREADOS = "aulizeth_cursos_creados";
const K_INSCRIPCIONES = "aulizeth_inscripciones";

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

function escapeHTML(s = "") {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function cap(s) { return (s || "").charAt(0).toUpperCase() + (s || "").slice(1); }

// ---------- ESTADO ADMIN ----------
let currentUser = null;
let isAdmin = false;
let editingAdminId = null; // id del doc Firestore que se está editando

// Cursos publicados por el admin desde Firestore.
let CURSOS_ADMIN = []; // cada item lleva { id: "admin-<docId>", _docId, ... }

function todosLosCursos() {
    return [...CURSOS_ADMIN, ...CURSOS_BASE, ...store.getCreados()];
}

async function cargarCursosAdmin() {
    try {
        const snap = await getDocs(query(collection(db, "cursos"), orderBy("createdAt", "desc")));
        CURSOS_ADMIN = [];
        snap.forEach((d) => {
            const data = d.data();
            CURSOS_ADMIN.push({
                id: "admin-" + d.id,
                _docId: d.id,
                _admin: true,
                titulo: data.titulo || "Sin título",
                categoria: data.categoria || "otros",
                autor: data.autor || "Aulizeth",
                descripcion: data.descripcion || "",
                imagen: data.imagen || "",
                lecciones: Array.isArray(data.lecciones) && data.lecciones.length
                    ? data.lecciones
                    : [{ titulo: "Contenido", contenido: data.descripcion || "" }],
            });
        });
        renderTodo();
    } catch (err) {
        console.warn("[cursos] No se pudieron cargar cursos del admin:", err);
    }
}

// Detecta si el usuario logueado es admin y refresca la UI
onAuthStateChanged(auth, async (user) => {
    currentUser = user || null;
    isAdmin = false;
    if (user) {
        try {
            const ud = await getDoc(doc(db, "usuarios", user.uid));
            isAdmin = ud.exists() && ud.data().role === "admin";
        } catch (err) { console.warn("[cursos] rol:", err); }
    }
    aplicarModoAdmin();
    renderTodo();
});

function aplicarModoAdmin() {
    document.body.classList.toggle("modo-admin", isAdmin);
    // Cambiar textos del formulario si es admin
    const titForm = document.querySelector("#crearSection .crear-card h2");
    const subForm = document.querySelector("#crearSection .crear-card .sub");
    if (isAdmin) {
        if (titForm) titForm.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Panel del administrador — Gestionar cursos';
        if (subForm) subForm.textContent = "Los cursos que publiques aquí aparecerán al instante en la web para todos los alumnos.";
    }
    // Botón "Todos los cursos (admin)" visible sólo para admin
    let bar = document.getElementById("adminBar");
    if (isAdmin && !bar) {
        bar = document.createElement("div");
        bar.id = "adminBar";
        bar.style.cssText = "max-width:1200px;margin:20px auto 0;padding:12px 20px;background:linear-gradient(90deg,#fef3c7,#fde68a);border:1px solid #f59e0b;border-radius:12px;color:#78350f;font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;";
        bar.innerHTML = `
          <span><i class="fa-solid fa-shield-halved"></i> Estás en modo administrador. Puedes crear, editar y eliminar cualquier curso desde esta página.</span>
          <button id="btnAdminNuevo" style="background:#0f1a3d;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;"><i class="fa-solid fa-plus"></i> Nuevo curso</button>
        `;
        const hero = document.querySelector(".hero");
        hero.parentNode.insertBefore(bar, hero.nextSibling);
        document.getElementById("btnAdminNuevo").addEventListener("click", () => {
            resetForm();
            mostrarVista("crear");
        });
    } else if (!isAdmin && bar) {
        bar.remove();
    }
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

    // Acciones de admin (para cursos de Firestore)
    let adminBtns = "";
    if (isAdmin && curso._admin) {
        adminBtns = `
            <button class="btn-curso" style="background:#0f1a3d;color:#fff;" data-editar-admin="${curso._docId}" title="Editar"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-curso btn-eliminar" data-eliminar-admin="${curso._docId}" title="Eliminar de la web"><i class="fa-solid fa-trash"></i></button>`;
    }
    const btnEliminar = esCreado ? `<button class="btn-curso btn-eliminar" data-eliminar="${curso.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>` : "";
    const barra = prog.inscrito ? `<div class="progreso-bar"><div style="width:${prog.pct}%"></div></div>` : "";

    return `
    <div class="curso" data-cat="${curso.categoria}" data-titulo="${curso.titulo.toLowerCase()}">
        <div class="curso-img" ${imgStyle}>${badge}${isAdmin && curso._admin ? '<span style="position:absolute;top:10px;left:10px;background:#0f1a3d;color:#fff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;">ADMIN</span>' : ''}</div>
        <div class="curso-info">
            <h3>${escapeHTML(curso.titulo)}</h3>
            <div class="curso-autor"><i class="fa-solid fa-user"></i>${escapeHTML(curso.autor)}</div>
            <p class="curso-desc">${escapeHTML(curso.descripcion)}</p>
            <div class="curso-meta">
                <span><i class="fa-solid fa-book-open"></i>${curso.lecciones.length} lecciones</span>
                <span><i class="fa-solid fa-tag"></i>${cap(curso.categoria)}</span>
            </div>
            ${barra}
            <div class="curso-acciones" style="flex-wrap:wrap;gap:6px;">${boton}${adminBtns}${btnEliminar}</div>
        </div>
    </div>`;
}

// ---------- RENDER LISTAS ----------
let filtroCat = "todos";
let filtroTexto = "";

function renderTodo() {
    // Cursos disponibles = admin (Firestore) + base
    const disp = [...CURSOS_ADMIN, ...CURSOS_BASE]
        .filter(c => filtroCat === "todos" || c.categoria === filtroCat)
        .filter(c => c.titulo.toLowerCase().includes(filtroTexto));
    $("#gridCursos").innerHTML = disp.map(c => tarjetaHTML(c, false)).join("") || `<p class="vacio">Sin resultados</p>`;

    // Cursos de la comunidad (localStorage)
    const creados = store.getCreados().filter(c => filtroCat === "todos" || c.categoria === filtroCat)
        .filter(c => c.titulo.toLowerCase().includes(filtroTexto));
    $("#gridCreados").innerHTML = creados.map(c => tarjetaHTML(c, true)).join("");
    $("#sinCreados").style.display = creados.length ? "none" : "block";

    // Mis inscripciones
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

// ---------- FORMULARIO CREAR / EDITAR ----------
function agregarLeccionForm(titulo = "", contenido = "") {
    const div = document.createElement("div");
    div.className = "leccion-item";
    div.innerHTML = `
        <input type="text" placeholder="Título de la lección" class="lec-titulo" required value="${escapeHTML(titulo)}">
        <textarea placeholder="Contenido de la lección..." class="lec-contenido" rows="2" required>${escapeHTML(contenido)}</textarea>
        <button type="button" class="btn-quitar-lec"><i class="fa-solid fa-xmark"></i></button>
    `;
    div.querySelector(".btn-quitar-lec").addEventListener("click", () => {
        if ($$("#leccionesWrap .leccion-item").length > 1) div.remove();
        else toast("Debe haber al menos 1 lección", "error");
    });
    $("#leccionesWrap").appendChild(div);
}

function bindLecInicial() {
    const btn = document.querySelector("#leccionesWrap .btn-quitar-lec");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
        if ($$("#leccionesWrap .leccion-item").length > 1) e.target.closest(".leccion-item").remove();
        else toast("Debe haber al menos 1 lección", "error");
    });
}

function resetForm() {
    editingAdminId = null;
    $("#formCurso").reset();
    $("#leccionesWrap").innerHTML = `
        <label class="lecciones-label">Lecciones <span class="hint">(mínimo 1)</span></label>
        <div class="leccion-item">
            <input type="text" placeholder="Título de la lección" class="lec-titulo" required>
            <textarea placeholder="Contenido de la lección..." class="lec-contenido" rows="2" required></textarea>
            <button type="button" class="btn-quitar-lec"><i class="fa-solid fa-xmark"></i></button>
        </div>`;
    bindLecInicial();
    const submitBtn = document.querySelector(".btn-publicar");
    if (submitBtn) submitBtn.textContent = isAdmin ? "Publicar curso en la web" : "Publicar curso";
}

function cargarEnFormulario(curso) {
    editingAdminId = curso._docId;
    const f = document.getElementById("formCurso");
    f.titulo.value = curso.titulo || "";
    f.categoria.value = ["computacion","diseno","programacion","marketing"].includes(curso.categoria) ? curso.categoria : "computacion";
    f.autor.value = curso.autor || "";
    f.descripcion.value = curso.descripcion || "";
    f.imagenUrl.value = curso.imagen || "";
    // Reconstruir lecciones
    $("#leccionesWrap").innerHTML = `<label class="lecciones-label">Lecciones <span class="hint">(mínimo 1)</span></label>`;
    (curso.lecciones || []).forEach(l => agregarLeccionForm(l.titulo, l.contenido));
    if (!curso.lecciones || !curso.lecciones.length) agregarLeccionForm();
    const submitBtn = document.querySelector(".btn-publicar");
    if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Guardar cambios';
    mostrarVista("crear");
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
        const defaults = {
            computacion: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
            diseno: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800",
            programacion: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
            marketing: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
        };
        imagen = defaults[categoria];
    }

    // === MODO ADMIN: guardar en Firestore ===
    if (isAdmin) {
        try {
            const data = { titulo, categoria, autor, descripcion, imagen, lecciones };
            if (editingAdminId) {
                await updateDoc(doc(db, "cursos", editingAdminId), { ...data, updatedAt: serverTimestamp() });
                toast("Curso actualizado en la web", "exito");
            } else {
                await addDoc(collection(db, "cursos"), {
                    ...data,
                    createdAt: serverTimestamp(),
                    createdBy: currentUser?.uid || null,
                });
                toast("¡Curso publicado! Ya lo ven los alumnos", "exito");
            }
            resetForm();
            await cargarCursosAdmin();
            mostrarVista("cursos");
        } catch (err) {
            console.error(err);
            toast("No se pudo guardar en la web. Revisa permisos.", "error");
        }
        return;
    }

    // === MODO ALUMNO / VISITANTE: guardar en localStorage ===
    const nuevo = {
        id: "user-" + Date.now(),
        titulo, categoria, autor, descripcion, imagen, lecciones,
        creadoEn: new Date().toISOString()
    };
    const creados = store.getCreados();
    creados.unshift(nuevo);
    store.setCreados(creados);
    toast("¡Curso publicado con éxito!", "exito");
    resetForm();
    renderTodo();
    mostrarVista("cursos");
});

// ---------- EVENTOS GLOBALES ----------
document.addEventListener("click", async (e) => {
    // Editar curso admin
    const editAdmin = e.target.closest("[data-editar-admin]");
    if (editAdmin) {
        const docId = editAdmin.dataset.editarAdmin;
        const curso = CURSOS_ADMIN.find(c => c._docId === docId);
        if (curso) cargarEnFormulario(curso);
        return;
    }
    // Eliminar curso admin (Firestore)
    const delAdmin = e.target.closest("[data-eliminar-admin]");
    if (delAdmin) {
        const docId = delAdmin.dataset.eliminarAdmin;
        const curso = CURSOS_ADMIN.find(c => c._docId === docId);
        if (!confirm(`¿Eliminar "${curso?.titulo || 'este curso'}" de la web? Ya no lo verá ningún alumno.`)) return;
        try {
            await deleteDoc(doc(db, "cursos", docId));
            toast("Curso eliminado de la web", "exito");
            await cargarCursosAdmin();
        } catch (err) {
            console.error(err);
            toast("No se pudo eliminar. Verifica permisos.", "error");
        }
        return;
    }

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
    if (view) {
        e.preventDefault();
        if (view.dataset.view === "crear") resetForm();
        mostrarVista(view.dataset.view);
        return;
    }

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

$("#addLeccion").addEventListener("click", () => agregarLeccionForm());

window.addEventListener("scroll", () => {
    const h = document.querySelector("header");
    h.style.boxShadow = window.scrollY > 60 ? "0 8px 20px rgba(0,0,0,.15)" : "0 2px 10px rgba(0,0,0,.08)";
});

// ---------- INIT ----------
bindLecInicial();
renderTodo();
mostrarVista("cursos");
cargarCursosAdmin();
