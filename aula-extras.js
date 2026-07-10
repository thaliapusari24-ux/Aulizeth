// Aula extras — carga anuncios y talleres extra publicados por el admin
// desde Firestore y los muestra al alumno en tiempo real.
import { db } from "./firebase-config.js";
import {
  collection, getDocs, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const TIPO_ICONS = {
  info: "fa-circle-info",
  importante: "fa-triangle-exclamation",
  exito: "fa-circle-check",
};
const TIPO_COLORS = {
  info: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  importante: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
  exito: { bg: "#dcfce7", border: "#22c55e", text: "#166534" },
};

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ============ ANUNCIOS ============
async function renderAnuncios() {
  try {
    const q = query(collection(db, "anuncios"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    if (!items.length) return;

    const main = document.querySelector("main.dashboard");
    if (!main) return;

    const box = document.createElement("section");
    box.className = "anuncios-box";
    box.innerHTML = `
      <h2 style="margin: 4px 0 14px; font-size: 20px; color:#1e293b;">
        <i class="fa-solid fa-bullhorn" style="color:#4f46e5;"></i> Anuncios de la profesora
      </h2>
      <div class="anuncios-list" style="display:flex; flex-direction:column; gap:12px;">
        ${items.map((a) => {
          const tipo = a.tipo || "info";
          const c = TIPO_COLORS[tipo] || TIPO_COLORS.info;
          return `
            <article style="background:${c.bg}; border-left:4px solid ${c.border}; padding:14px 18px; border-radius:10px; color:${c.text};">
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
                <i class="fa-solid ${TIPO_ICONS[tipo] || "fa-circle-info"}"></i>
                <strong style="font-size:15px;">${escapeHtml(a.titulo)}</strong>
              </div>
              <p style="margin:0; font-size:14px; line-height:1.5;">${escapeHtml(a.mensaje)}</p>
            </article>
          `;
        }).join("")}
      </div>
    `;

    // Insertar justo después del banner de bienvenida
    const banner = main.querySelector(".welcome-banner");
    if (banner && banner.nextSibling) {
      main.insertBefore(box, banner.nextSibling);
    } else {
      main.appendChild(box);
    }
  } catch (err) {
    console.warn("[aula-extras] No se pudieron cargar los anuncios:", err);
  }
}

// ============ TALLERES EXTRA ============
async function renderTalleresExtra() {
  try {
    const q = query(collection(db, "talleres"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    if (!items.length) return;

    const grid = document.getElementById("coursesGrid");
    if (!grid) return;

    const fallbackImg = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80&auto=format&fit=crop";

    const extraHtml = items.map((t) => {
      const img = t.imagen || fallbackImg;
      const enlaceBtn = t.enlace
        ? `<a href="${escapeHtml(t.enlace)}" target="_blank" rel="noopener" class="btn-continue" style="text-decoration:none; text-align:center;">
             <i class="fa-solid fa-external-link-alt"></i> Ir al taller
           </a>`
        : `<button class="btn-continue" disabled style="opacity:.7; cursor:default;">
             <i class="fa-solid fa-hourglass-half"></i> Próximamente
           </button>`;

      return `
        <div class="course-card">
          <div class="course-card-image">
            <img src="${escapeHtml(img)}" alt="${escapeHtml(t.titulo)}" loading="lazy"
                 onerror="this.src='${fallbackImg}'">
            <span class="course-tag">${escapeHtml(t.tag || "TALLER")}</span>
          </div>
          <div class="course-card-body">
            <h3>${escapeHtml(t.titulo)}</h3>
            <p class="lesson">${escapeHtml(t.descripcion || "Nuevo taller disponible")}</p>
            <div class="progress-track"><div class="progress-fill" style="width:0%;"></div></div>
            <div class="progress-label">
              <span><i class="fa-solid fa-star" style="color:#f59e0b;"></i> Publicado por el admin</span>
              <span>Nuevo</span>
            </div>
            ${enlaceBtn}
          </div>
        </div>
      `;
    }).join("");

    // Agregar al final del grid existente
    grid.insertAdjacentHTML("beforeend", extraHtml);

    // Actualizar contador de talleres si existe
    const statCourses = document.getElementById("statCourses");
    if (statCourses) {
      const current = parseInt(statCourses.textContent, 10) || 0;
      statCourses.textContent = current + items.length;
    }
  } catch (err) {
    console.warn("[aula-extras] No se pudieron cargar los talleres extra:", err);
  }
}

// Esperar a que aula.js haya renderizado su contenido inicial
window.addEventListener("load", () => {
  renderAnuncios();
  renderTalleresExtra();
});
