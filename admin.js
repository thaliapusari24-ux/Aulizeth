// Panel Admin — Aulizeth
// Gestiona: usuarios, anuncios y talleres extra (visibles para los alumnos)
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, getDocs, doc, updateDoc, deleteDoc,
  addDoc, serverTimestamp, query, orderBy, getDoc, setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ============ Helpers UI ============
const $ = (id) => document.getElementById(id);
const banner = $("globalBanner");
function showBanner(msg, type = "success") {
  banner.textContent = msg;
  banner.className = `banner show ${type}`;
  setTimeout(() => banner.classList.remove("show"), 4000);
}
function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
function fmtDate(v) {
  try {
    const d = v?.toDate ? v.toDate() : (v ? new Date(v) : null);
    if (!d || isNaN(d)) return "—";
    return d.toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
}

// ============ Tabs ============
document.querySelectorAll(".admin-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    $(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// ============ Espera a que haya un admin autenticado ============
let currentAdmin = null;
onAuthStateChanged(auth, (user) => {
  if (!user) return; // auth-guard.js redirigirá
  currentAdmin = user;
  loadAll();
});

async function loadAll() {
  await Promise.all([loadUsuarios(), loadAnuncios(), loadTalleres(), loadCursos(), loadTalleresAula(), loadMensajes()]);
}

// ============ USUARIOS ============
async function loadUsuarios() {
  const wrap = $("usuariosWrap");
  try {
    const snap = await getDocs(collection(db, "usuarios"));
    const users = [];
    snap.forEach((d) => users.push({ uid: d.id, ...d.data() }));

    $("statUsers").textContent = users.length;
    $("statAdmins").textContent = users.filter((u) => u.role === "admin").length;

    if (!users.length) {
      wrap.innerHTML = `<div class="empty-state">Todavía no hay usuarios registrados.</div>`;
      return;
    }

    wrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr><th>Nombre</th><th>Correo</th><th>Nivel</th><th>Rol</th><th>Registro</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          ${users.map((u) => `
            <tr data-uid="${escapeHtml(u.uid)}">
              <td>${escapeHtml(u.nombre || "—")}</td>
              <td>${escapeHtml(u.email || "—")}</td>
              <td>${escapeHtml(u.nivel || "—")}</td>
              <td><span class="role-pill ${u.role === "admin" ? "role-admin" : "role-student"}">${u.role || "student"}</span></td>
              <td>${fmtDate(u.fechaRegistro)}</td>
              <td>
                ${u.uid === currentAdmin?.uid
                  ? `<span style="color:#9ca3af;font-size:12px;">(tú)</span>`
                  : u.role === "admin"
                    ? `<button class="btn-mini" data-action="demote">Quitar admin</button>`
                    : `<button class="btn-mini" data-action="promote">Hacer admin</button>`
                }
                ${u.uid === currentAdmin?.uid ? "" : `<button class="btn-danger" data-action="delete">Eliminar</button>`}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    wrap.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => handleUserAction(btn));
    });
  } catch (err) {
    console.error("[admin] Error al cargar usuarios:", err);
    wrap.innerHTML = `<div class="empty-state" style="color:#991b1b;">
      No se pudieron cargar los usuarios. Verifica las reglas de Firestore
      (los administradores deben poder leer y modificar la colección <code>usuarios</code>).
    </div>`;
  }
}

async function handleUserAction(btn) {
  const uid = btn.closest("tr").dataset.uid;
  const action = btn.dataset.action;
  try {
    if (action === "promote") {
      await updateDoc(doc(db, "usuarios", uid), { role: "admin" });
      showBanner("Usuario promovido a administrador.");
    } else if (action === "demote") {
      await updateDoc(doc(db, "usuarios", uid), { role: "student" });
      showBanner("Se quitó el rol de administrador.");
    } else if (action === "delete") {
      if (!confirm("¿Eliminar este usuario del registro? (Solo se borra su perfil; su cuenta de acceso debe eliminarse desde Firebase Authentication).")) return;
      await deleteDoc(doc(db, "usuarios", uid));
      showBanner("Perfil de usuario eliminado.");
    }
    await loadUsuarios();
  } catch (err) {
    console.error("[admin] Error en acción de usuario:", err);
    showBanner("No se pudo completar la acción. Revisa las reglas de Firestore.", "error");
  }
}

// ============ ANUNCIOS ============
async function loadAnuncios() {
  const wrap = $("anunciosWrap");
  try {
    const q = query(collection(db, "anuncios"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

    $("statAnuncios").textContent = items.length;

    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state">Todavía no hay anuncios publicados.</div>`;
      return;
    }

    wrap.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Título</th><th>Tipo</th><th>Mensaje</th><th>Publicado</th><th>Acciones</th></tr></thead>
        <tbody>
          ${items.map((a) => `
            <tr data-id="${escapeHtml(a.id)}">
              <td><strong>${escapeHtml(a.titulo)}</strong></td>
              <td><span class="tipo-pill tipo-${escapeHtml(a.tipo || "info")}">${escapeHtml(a.tipo || "info")}</span></td>
              <td style="max-width:340px;">${escapeHtml(a.mensaje)}</td>
              <td>${fmtDate(a.createdAt)}</td>
              <td><button class="btn-danger" data-action="delete-anuncio"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    wrap.querySelectorAll("button[data-action='delete-anuncio']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("¿Eliminar este anuncio? Ya no será visible para los alumnos.")) return;
        try {
          await deleteDoc(doc(db, "anuncios", btn.closest("tr").dataset.id));
          showBanner("Anuncio eliminado.");
          loadAnuncios();
        } catch (err) {
          console.error(err);
          showBanner("No se pudo eliminar el anuncio.", "error");
        }
      });
    });
  } catch (err) {
    console.error("[admin] Error al cargar anuncios:", err);
    wrap.innerHTML = `<div class="empty-state" style="color:#991b1b;">
      No se pudieron cargar los anuncios. Verifica las reglas de Firestore.
    </div>`;
  }
}

$("anuncioForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const titulo = $("anuncioTitulo").value.trim();
  const mensaje = $("anuncioMensaje").value.trim();
  const tipo = $("anuncioTipo").value;

  if (!titulo || !mensaje) {
    showBanner("Completa el título y el mensaje.", "error");
    return;
  }
  submitBtn.disabled = true;
  try {
    await addDoc(collection(db, "anuncios"), {
      titulo, mensaje, tipo,
      createdAt: serverTimestamp(),
      createdBy: currentAdmin?.uid || null,
      createdByEmail: currentAdmin?.email || null,
    });
    e.target.reset();
    showBanner("Anuncio publicado. Los alumnos lo verán al abrir su aula.");
    loadAnuncios();
  } catch (err) {
    console.error("[admin] Error al publicar anuncio:", err);
    showBanner("No se pudo publicar el anuncio. Revisa las reglas de Firestore.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

// ============ TALLERES EXTRA ============
async function loadTalleres() {
  const wrap = $("talleresWrap");
  try {
    const q = query(collection(db, "talleres"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

    $("statTalleres").textContent = items.length;

    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state">Aún no hay talleres extra. Agrega uno arriba.</div>`;
      return;
    }

    wrap.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Título</th><th>Categoría</th><th>Descripción</th><th>Enlace</th><th>Acciones</th></tr></thead>
        <tbody>
          ${items.map((t) => `
            <tr data-id="${escapeHtml(t.id)}">
              <td><strong>${escapeHtml(t.titulo)}</strong></td>
              <td>${escapeHtml(t.tag || "—")}</td>
              <td style="max-width:280px;">${escapeHtml(t.descripcion || "—")}</td>
              <td>${t.enlace ? `<a href="${escapeHtml(t.enlace)}" target="_blank" rel="noopener">Abrir</a>` : "—"}</td>
              <td><button class="btn-danger" data-action="delete-taller"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    wrap.querySelectorAll("button[data-action='delete-taller']").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("¿Eliminar este taller? Ya no será visible para los alumnos.")) return;
        try {
          await deleteDoc(doc(db, "talleres", btn.closest("tr").dataset.id));
          showBanner("Taller eliminado.");
          loadTalleres();
        } catch (err) {
          console.error(err);
          showBanner("No se pudo eliminar el taller.", "error");
        }
      });
    });
  } catch (err) {
    console.error("[admin] Error al cargar talleres:", err);
    wrap.innerHTML = `<div class="empty-state" style="color:#991b1b;">
      No se pudieron cargar los talleres. Verifica las reglas de Firestore.
    </div>`;
  }
}

$("tallerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const titulo = $("tallerTitulo").value.trim();
  const tag = $("tallerTag").value.trim() || "TALLER";
  const descripcion = $("tallerDescripcion").value.trim();
  const imagen = $("tallerImagen").value.trim();
  const enlace = $("tallerEnlace").value.trim();

  if (!titulo) {
    showBanner("El título es obligatorio.", "error");
    return;
  }
  submitBtn.disabled = true;
  try {
    await addDoc(collection(db, "talleres"), {
      titulo, tag, descripcion, imagen, enlace,
      createdAt: serverTimestamp(),
      createdBy: currentAdmin?.uid || null,
    });
    e.target.reset();
    showBanner("Taller agregado. Los alumnos lo verán en su aula.");
    loadTalleres();
  } catch (err) {
    console.error("[admin] Error al agregar taller:", err);
    showBanner("No se pudo agregar el taller. Revisa las reglas de Firestore.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});

// ============ CURSOS (colección `cursos` — visibles en la web pública) ============
function parseLecciones(txt) {
  return String(txt || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [titulo, ...rest] = l.split("|");
      return { titulo: (titulo || "").trim(), contenido: rest.join("|").trim() };
    })
    .filter((x) => x.titulo);
}
function leccionesToText(arr) {
  return (arr || []).map((l) => `${l.titulo} | ${l.contenido || ""}`).join("\n");
}

// Cursos base que se siembran en Firestore la primera vez que un admin abre el panel,
// para que pueda editarlos y eliminarlos igual que cualquier otro curso.
const CURSOS_SEMILLA = [
  { titulo: "Introducción a la Computación", categoria: "computacion", autor: "Prof. Lizeth Pusari Gomez",
    descripcion: "Aprende los fundamentos del uso de una computadora, sistemas operativos y ofimática básica.",
    imagen: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
    lecciones: [
      { titulo: "¿Qué es una computadora?", contenido: "Una computadora es una máquina electrónica capaz de recibir datos, procesarlos y entregar resultados.\n\nComponentes principales:\n• Hardware: partes físicas (CPU, monitor, teclado)\n• Software: programas y sistema operativo" },
      { titulo: "Sistemas operativos", contenido: "El sistema operativo (SO) gestiona el hardware y permite ejecutar otros programas.\n\nMás usados: Windows, macOS, Linux, Android, iOS." },
    ]},
  { titulo: "Diseño Gráfico desde Cero", categoria: "diseno", autor: "Prof. Karen Gomez",
    descripcion: "Descubre los principios del diseño: color, tipografía y composición para crear piezas visuales impactantes.",
    imagen: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
    lecciones: [
      { titulo: "Teoría del color", contenido: "El color transmite emociones y guía la mirada.\nColores cálidos = energía, fríos = calma.\nRegla 60-30-10 para equilibrio." },
      { titulo: "Tipografía y jerarquía", contenido: "Máximo 2 familias por diseño. Serif = formal, Sans-serif = moderno. La jerarquía guía al lector." },
    ]},
  { titulo: "Programación Web con HTML y CSS", categoria: "programacion", autor: "Luis Mendoza",
    descripcion: "Crea tu primera página web desde cero. Estructura con HTML y estiliza con CSS moderno.",
    imagen: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
    lecciones: [
      { titulo: "Estructura HTML", contenido: "HTML define la estructura con etiquetas: <h1>, <p>, <a>. Toda página tiene <head> y <body>." },
      { titulo: "Estilos con CSS", contenido: "CSS controla la apariencia. Selectores por etiqueta, clase o id. Controla colores, tamaños, espacios y animaciones." },
    ]},
  { titulo: "Marketing Digital para Principiantes", categoria: "marketing", autor: "María Torres",
    descripcion: "Aprende cómo funcionan las redes sociales, el SEO y las estrategias para hacer crecer tu marca.",
    imagen: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    lecciones: [
      { titulo: "¿Qué es el marketing digital?", contenido: "Promoción de productos/servicios en canales digitales: redes sociales, buscadores, email y sitios web." },
      { titulo: "SEO básico", contenido: "SEO = aparecer en Google. Claves: palabras clave, contenido útil, velocidad, enlaces de confianza." },
    ]},
  { titulo: "Excel Práctico", categoria: "computacion", autor: "Carlos Peña",
    descripcion: "Domina Excel con fórmulas esenciales, tablas y gráficos que aplicarás en tu día a día.",
    imagen: "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800",
    lecciones: [
      { titulo: "Fórmulas básicas", contenido: "Toda fórmula empieza con =. Ej: =SUMA, =PROMEDIO, =SI, =CONTAR. Usa $ para fijar celdas." },
      { titulo: "Gráficos y tablas", contenido: "Insertar → Gráfico. Columnas para comparar, líneas para tendencias, pastel para proporciones." },
    ]},
];

async function seedCursosSiVacio() {
  // Siempre revisa el estado real de la colección: si está vacía, siembra los
  // cursos base para que el admin pueda editarlos/eliminarlos. Así, aunque un
  // admin haya borrado todos los cursos, al recargar el panel vuelven a
  // aparecer los cursos por defecto de la web.
  try {
    const snap = await getDocs(collection(db, "cursos"));
    if (!snap.empty) return;
    for (const c of CURSOS_SEMILLA) {
      await addDoc(collection(db, "cursos"), {
        ...c, createdAt: serverTimestamp(), createdBy: currentAdmin?.uid || null, semilla: true,
      });
    }
    const flagRef = doc(db, "_meta", "cursos_semilla");
    await setDoc(flagRef, { seeded: true, at: serverTimestamp() });
    showBanner("Se cargaron los cursos base de la web. Ahora puedes editarlos o eliminarlos.");
  } catch (err) { console.warn("[admin] No se pudo sembrar cursos base:", err); }
}

async function loadCursos() {
  await seedCursosSiVacio();
  const wrap = $("cursosWrap");
  try {
    const q = query(collection(db, "cursos"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    if ($("statCursos")) $("statCursos").textContent = items.length;

    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state">Todavía no hay cursos publicados. Agrega uno arriba para que aparezca en la página web.</div>`;
      return;
    }
    wrap.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Título</th><th>Categoría</th><th>Autor</th><th>Lecciones</th><th>Acciones</th></tr></thead>
        <tbody>
          ${items.map((c) => `
            <tr data-id="${escapeHtml(c.id)}">
              <td><strong>${escapeHtml(c.titulo)}</strong><br><small style="color:#6b7280">${escapeHtml((c.descripcion || "").slice(0, 80))}</small></td>
              <td>${escapeHtml(c.categoria || "—")}</td>
              <td>${escapeHtml(c.autor || "—")}</td>
              <td>${(c.lecciones || []).length}</td>
              <td>
                <button class="btn-mini" data-action="edit-curso">Editar</button>
                <button class="btn-danger" data-action="delete-curso"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    wrap.querySelectorAll("button[data-action]").forEach((btn) => {
      const id = btn.closest("tr").dataset.id;
      const item = items.find((x) => x.id === id);
      if (btn.dataset.action === "delete-curso") {
        btn.addEventListener("click", async () => {
          if (!confirm(`¿Eliminar el curso "${item.titulo}"? Ya no aparecerá en la web.`)) return;
          try { await deleteDoc(doc(db, "cursos", id)); showBanner("Curso eliminado."); loadCursos(); }
          catch (err) { console.error(err); showBanner("No se pudo eliminar.", "error"); }
        });
      } else if (btn.dataset.action === "edit-curso") {
        btn.addEventListener("click", () => startEditCurso(item));
      }
    });
  } catch (err) {
    console.error("[admin] Error cursos:", err);
    wrap.innerHTML = `<div class="empty-state" style="color:#991b1b;">No se pudieron cargar los cursos.</div>`;
  }
}

function resetCursoForm() {
  $("cursoForm").reset();
  $("cursoEditId").value = "";
  $("cursoFormTitulo").textContent = "Agregar un curso a la página web";
  $("cursoSubmitBtn").innerHTML = '<i class="fa-solid fa-plus"></i> Agregar curso';
  $("cursoCancelBtn").style.display = "none";
}
function startEditCurso(c) {
  $("cursoEditId").value = c.id;
  $("cursoTitulo").value = c.titulo || "";
  $("cursoCategoria").value = c.categoria || "otros";
  $("cursoAutor").value = c.autor || "";
  $("cursoImagen").value = c.imagen || "";
  $("cursoDescripcion").value = c.descripcion || "";
  $("cursoLecciones").value = leccionesToText(c.lecciones);
  $("cursoFormTitulo").textContent = `Editando: ${c.titulo}`;
  $("cursoSubmitBtn").innerHTML = '<i class="fa-solid fa-save"></i> Guardar cambios';
  $("cursoCancelBtn").style.display = "inline-flex";
  document.querySelector('.admin-tab[data-tab="cursos"]').click();
  $("cursoForm").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("cursoCancelBtn").addEventListener("click", resetCursoForm);

// Botón para forzar la carga (o restauración) de los cursos base de la web.
// Útil cuando el admin abre el panel por primera vez y aún no ve los cursos
// que ya aparecen (o aparecían) en la página pública.
const btnRestaurar = $("btnRestaurarCursos");
if (btnRestaurar) {
  btnRestaurar.addEventListener("click", async () => {
    if (!confirm("Se agregarán los cursos base de la web a la lista de cursos editables. Los cursos ya existentes NO se borrarán. ¿Continuar?")) return;
    btnRestaurar.disabled = true;
    const original = btnRestaurar.innerHTML;
    btnRestaurar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cargando cursos base...';
    try {
      for (const c of CURSOS_SEMILLA) {
        await addDoc(collection(db, "cursos"), {
          ...c, createdAt: serverTimestamp(), createdBy: currentAdmin?.uid || null, semilla: true,
        });
      }
      showBanner("Cursos base cargados. Ya puedes editarlos o eliminarlos.");
      await loadCursos();
    } catch (err) {
      console.error("[admin] Restaurar cursos:", err);
      showBanner("No se pudieron cargar los cursos base. Verifica las reglas de Firestore.", "error");
    } finally {
      btnRestaurar.disabled = false;
      btnRestaurar.innerHTML = original;
    }
  });
}

$("cursoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("cursoSubmitBtn");
  const id = $("cursoEditId").value;
  const data = {
    titulo: $("cursoTitulo").value.trim(),
    categoria: $("cursoCategoria").value,
    autor: $("cursoAutor").value.trim() || "Aulizeth",
    imagen: $("cursoImagen").value.trim(),
    descripcion: $("cursoDescripcion").value.trim(),
    lecciones: parseLecciones($("cursoLecciones").value),
  };
  if (!data.titulo || !data.descripcion) { showBanner("Título y descripción son obligatorios.", "error"); return; }
  btn.disabled = true;
  try {
    if (id) {
      await updateDoc(doc(db, "cursos", id), { ...data, updatedAt: serverTimestamp() });
      showBanner("Curso actualizado.");
    } else {
      await addDoc(collection(db, "cursos"), {
        ...data,
        createdAt: serverTimestamp(),
        createdBy: currentAdmin?.uid || null,
      });
      showBanner("Curso agregado. Ya está visible en la web.");
    }
    resetCursoForm();
    loadCursos();
  } catch (err) {
    console.error("[admin] Error curso:", err);
    showBanner("No se pudo guardar el curso.", "error");
  } finally { btn.disabled = false; }
});

// ============ MENSAJES DE CONTACTO ============
async function loadMensajes() {
  const wrap = $("mensajesWrap");
  try {
    const q = query(collection(db, "mensajes_contacto"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    if ($("statMensajes")) $("statMensajes").textContent = items.length;

    const noLeidos = items.filter((m) => !m.leido).length;
    const dot = $("mensajesDot");
    if (dot) { dot.style.display = noLeidos ? "inline-block" : "none"; dot.textContent = noLeidos; }

    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state">Todavía no hay mensajes de los alumnos.</div>`;
      return;
    }
    wrap.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Estado</th><th>Nombre</th><th>Correo</th><th>Mensaje</th><th>Recibido</th><th>Acciones</th></tr></thead>
        <tbody>
          ${items.map((m) => `
            <tr data-id="${escapeHtml(m.id)}" style="${m.leido ? "" : "background:#fef9c3;"}">
              <td>${m.leido ? '<span style="color:#059669;">✓ Leído</span>' : '<strong style="color:#b45309;">Nuevo</strong>'}</td>
              <td><strong>${escapeHtml(m.nombre || "—")}</strong></td>
              <td>${m.correo ? `<a href="mailto:${escapeHtml(m.correo)}">${escapeHtml(m.correo)}</a>` : "—"}</td>
              <td style="max-width:340px;white-space:pre-wrap;">${escapeHtml(m.mensaje || "")}</td>
              <td>${fmtDate(m.createdAt)}</td>
              <td>
                ${m.leido ? "" : '<button class="btn-mini" data-action="mark-read">Marcar leído</button>'}
                <button class="btn-danger" data-action="delete-msg"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    wrap.querySelectorAll("button[data-action]").forEach((btn) => {
      const id = btn.closest("tr").dataset.id;
      if (btn.dataset.action === "delete-msg") {
        btn.addEventListener("click", async () => {
          if (!confirm("¿Eliminar este mensaje?")) return;
          try { await deleteDoc(doc(db, "mensajes_contacto", id)); showBanner("Mensaje eliminado."); loadMensajes(); }
          catch (err) { console.error(err); showBanner("No se pudo eliminar.", "error"); }
        });
      } else if (btn.dataset.action === "mark-read") {
        btn.addEventListener("click", async () => {
          try { await updateDoc(doc(db, "mensajes_contacto", id), { leido: true, leidoAt: serverTimestamp() }); loadMensajes(); }
          catch (err) { console.error(err); showBanner("No se pudo actualizar.", "error"); }
        });
      }
    });
  } catch (err) {
    console.error("[admin] Error mensajes:", err);
    wrap.innerHTML = `<div class="empty-state" style="color:#991b1b;">No se pudieron cargar los mensajes.</div>`;
  }
}

// ============ TALLERES DEL AULA (colección `talleres_aula` — visibles en Ver Aula) ============
// Formato del textarea de módulos:
//   Módulo · Título del módulo
//   - Título lección | tipo | duración | contenido
// Tipos: video, texto, quiz. Para video, el contenido es la URL del video.
function parseModulos(txt) {
  const modules = [];
  let current = null;
  String(txt || "").split("\n").forEach((raw) => {
    const line = raw.replace(/\r$/, "");
    if (!line.trim()) return;
    const modMatch = line.match(/^\s*(?:Módulo|Modulo|Module)\s*[·:\-]\s*(.+)$/i);
    if (modMatch) {
      current = { title: modMatch[1].trim(), lessons: [] };
      modules.push(current);
      return;
    }
    const lecMatch = line.match(/^\s*-\s*(.+)$/);
    if (lecMatch && current) {
      const parts = lecMatch[1].split("|").map((p) => p.trim());
      const [title, type = "texto", duration = "", ...rest] = parts;
      const content = rest.join(" | ").trim();
      const lesson = { title: title || "Lección", type: (type || "texto").toLowerCase(), duration };
      if (lesson.type === "video") lesson.videoUrl = content;
      else lesson.content = content;
      current.lessons.push(lesson);
    }
  });
  return modules.filter((m) => m.lessons.length);
}
function modulosToText(mods) {
  return (mods || []).map((m) => {
    const head = `Módulo · ${m.title}`;
    const lines = (m.lessons || []).map((l) => {
      const content = l.type === "video" ? (l.videoUrl || "") : (l.content || "");
      return `- ${l.title} | ${l.type || "texto"} | ${l.duration || ""} | ${content}`;
    });
    return [head, ...lines].join("\n");
  }).join("\n");
}

const TALLERES_AULA_SEMILLA = [
  {
    tag: "DISEÑO WEB",
    title: "Fundamentos de HTML y CSS",
    lesson: "Próxima clase: Flexbox y Grid",
    image: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?w=600&q=80&auto=format&fit=crop",
    modules: [
      { title: "Bases de HTML", lessons: [
        { title: "Estructura de un documento HTML", type: "video", duration: "8 min", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        { title: "Etiquetas semánticas", type: "texto", duration: "6 min", content: "Las etiquetas semánticas describen el significado del contenido (header, nav, main, footer). Mejoran accesibilidad y SEO." },
      ]},
      { title: "Flexbox y Grid", lessons: [
        { title: "Introducción a Flexbox", type: "video", duration: "10 min", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        { title: "CSS Grid paso a paso", type: "video", duration: "12 min", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        { title: "Cuestionario rápido", type: "quiz", duration: "4 min", content: "Repasa lo aprendido: ¿qué propiedad activa Flexbox? ¿diferencia entre fr y %? ¿cuándo usar Grid vs Flexbox?" },
      ]},
    ],
  },
  {
    tag: "PROGRAMACIÓN",
    title: "JavaScript desde Cero",
    lesson: "Próxima clase: Eventos del DOM",
    image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80&auto=format&fit=crop",
    modules: [
      { title: "Bases del lenguaje", lessons: [
        { title: "Variables y tipos de datos", type: "video", duration: "9 min", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        { title: "Funciones y arrow functions", type: "texto", duration: "7 min", content: "Una función agrupa lógica reutilizable. Las arrow functions ofrecen sintaxis más corta y no crean su propio this." },
      ]},
      { title: "El DOM", lessons: [
        { title: "Seleccionar y modificar elementos", type: "video", duration: "11 min", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        { title: "Eventos del DOM", type: "video", duration: "10 min", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
      ]},
    ],
  },
  {
    tag: "DISEÑO UX/UI",
    title: "Principios de Experiencia de Usuario",
    lesson: "Próxima clase: Wireframing",
    image: "https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=600&q=80&auto=format&fit=crop",
    modules: [
      { title: "Fundamentos de UX", lessons: [
        { title: "¿Qué es la experiencia de usuario?", type: "video", duration: "7 min", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        { title: "Investigación de usuarios", type: "texto", duration: "8 min", content: "Entrevistas, encuestas y pruebas de usabilidad ayudan a entender a quién diseñamos." },
      ]},
      { title: "Del boceto al prototipo", lessons: [
        { title: "Wireframing", type: "video", duration: "9 min", videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
        { title: "De wireframe a prototipo interactivo", type: "texto", duration: "6 min", content: "Un prototipo permite validar el flujo antes de programar. Herramientas: Figma, Adobe XD." },
      ]},
    ],
  },
];

async function seedTalleresAulaSiVacio() {
  try {
    const flagRef = doc(db, "_meta", "talleres_aula_semilla");
    const flag = await getDoc(flagRef);
    if (flag.exists()) return;
    const snap = await getDocs(collection(db, "talleres_aula"));
    if (!snap.empty) { await setDoc(flagRef, { seeded: true, at: serverTimestamp() }); return; }
    for (const t of TALLERES_AULA_SEMILLA) {
      await addDoc(collection(db, "talleres_aula"), {
        ...t, createdAt: serverTimestamp(), createdBy: currentAdmin?.uid || null, semilla: true,
      });
    }
    await setDoc(flagRef, { seeded: true, at: serverTimestamp() });
    showBanner("Se cargaron los talleres del aula base. Ahora puedes editarlos o eliminarlos.");
  } catch (err) { console.warn("[admin] No se pudo sembrar talleres aula:", err); }
}

async function loadTalleresAula() {
  await seedTalleresAulaSiVacio();
  const wrap = $("talleresAulaWrap");
  try {
    const q = query(collection(db, "talleres_aula"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    if (!items.length) {
      wrap.innerHTML = `<div class="empty-state">Todavía no hay talleres del aula. Agrega uno arriba.</div>`;
      return;
    }
    wrap.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Título</th><th>Etiqueta</th><th>Módulos</th><th>Lecciones</th><th>Acciones</th></tr></thead>
        <tbody>
          ${items.map((t) => {
            const nMods = (t.modules || []).length;
            const nLecs = (t.modules || []).reduce((a, m) => a + (m.lessons || []).length, 0);
            return `
              <tr data-id="${escapeHtml(t.id)}">
                <td><strong>${escapeHtml(t.title || "—")}</strong><br><small style="color:#6b7280">${escapeHtml(t.lesson || "")}</small></td>
                <td>${escapeHtml(t.tag || "—")}</td>
                <td>${nMods}</td>
                <td>${nLecs}</td>
                <td>
                  <button class="btn-mini" data-action="edit-taller-aula">Editar</button>
                  <button class="btn-danger" data-action="delete-taller-aula"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>`;
          }).join("")}
        </tbody>
      </table>`;
    wrap.querySelectorAll("button[data-action]").forEach((btn) => {
      const id = btn.closest("tr").dataset.id;
      const item = items.find((x) => x.id === id);
      if (btn.dataset.action === "delete-taller-aula") {
        btn.addEventListener("click", async () => {
          if (!confirm(`¿Eliminar el taller "${item.title}"? Ya no aparecerá en el aula.`)) return;
          try { await deleteDoc(doc(db, "talleres_aula", id)); showBanner("Taller eliminado."); loadTalleresAula(); }
          catch (err) { console.error(err); showBanner("No se pudo eliminar.", "error"); }
        });
      } else if (btn.dataset.action === "edit-taller-aula") {
        btn.addEventListener("click", () => startEditTallerAula(item));
      }
    });
  } catch (err) {
    console.error("[admin] Error talleres aula:", err);
    wrap.innerHTML = `<div class="empty-state" style="color:#991b1b;">No se pudieron cargar los talleres del aula.</div>`;
  }
}

function resetTallerAulaForm() {
  $("tallerAulaForm").reset();
  $("tallerAulaEditId").value = "";
  $("tallerAulaFormTitulo").textContent = "Agregar taller al Aula";
  $("tallerAulaSubmitBtn").innerHTML = '<i class="fa-solid fa-plus"></i> Agregar taller';
  $("tallerAulaCancelBtn").style.display = "none";
}
function startEditTallerAula(t) {
  $("tallerAulaEditId").value = t.id;
  $("tallerAulaTitulo").value = t.title || "";
  $("tallerAulaTag").value = t.tag || "";
  $("tallerAulaLesson").value = t.lesson || "";
  $("tallerAulaImagen").value = t.image || "";
  $("tallerAulaModulos").value = modulosToText(t.modules);
  $("tallerAulaFormTitulo").textContent = `Editando: ${t.title}`;
  $("tallerAulaSubmitBtn").innerHTML = '<i class="fa-solid fa-save"></i> Guardar cambios';
  $("tallerAulaCancelBtn").style.display = "inline-flex";
  document.querySelector('.admin-tab[data-tab="talleresaula"]').click();
  $("tallerAulaForm").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("tallerAulaCancelBtn").addEventListener("click", resetTallerAulaForm);

$("tallerAulaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = $("tallerAulaSubmitBtn");
  const id = $("tallerAulaEditId").value;
  const data = {
    title: $("tallerAulaTitulo").value.trim(),
    tag: $("tallerAulaTag").value.trim() || "TALLER",
    lesson: $("tallerAulaLesson").value.trim(),
    image: $("tallerAulaImagen").value.trim(),
    modules: parseModulos($("tallerAulaModulos").value),
  };
  if (!data.title) { showBanner("El título es obligatorio.", "error"); return; }
  if (!data.modules.length) { showBanner("Agrega al menos un módulo con lecciones.", "error"); return; }
  btn.disabled = true;
  try {
    if (id) {
      await updateDoc(doc(db, "talleres_aula", id), { ...data, updatedAt: serverTimestamp() });
      showBanner("Taller del aula actualizado.");
    } else {
      await addDoc(collection(db, "talleres_aula"), {
        ...data, createdAt: serverTimestamp(), createdBy: currentAdmin?.uid || null,
      });
      showBanner("Taller agregado. Ya es visible en el Aula.");
    }
    resetTallerAulaForm();
    loadTalleresAula();
  } catch (err) {
    console.error("[admin] Error taller aula:", err);
    showBanner("No se pudo guardar el taller.", "error");
  } finally { btn.disabled = false; }
});
