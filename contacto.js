/* ===== Noche estrellada (canvas) ===== */
(function initStars(){
  const canvas = document.getElementById('starsCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w = 0, h = 0;

  function resize(){
    w = canvas.width  = window.innerWidth  * window.devicePixelRatio;
    h = canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    const count = Math.min(260, Math.floor((window.innerWidth * window.innerHeight) / 6000));
    stars = [];
    for(let i=0;i<count;i++){
      stars.push({
        x: Math.random()*w,
        y: Math.random()*h,
        r: Math.random()*1.6 + 0.3,
        a: Math.random()*0.8 + 0.2,
        s: Math.random()*0.015 + 0.005,
        d: Math.random() < 0.5 ? 1 : -1
      });
    }
  }

  function tick(){
    ctx.clearRect(0,0,w,h);
    for(const st of stars){
      st.a += st.s * st.d;
      if(st.a >= 1){ st.a = 1; st.d = -1; }
      if(st.a <= 0.15){ st.a = 0.15; st.d = 1; }
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r * window.devicePixelRatio, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,' + st.a + ')';
      ctx.shadowColor = 'rgba(180,200,255,.9)';
      ctx.shadowBlur = 6;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  resize();
  tick();
})();

/* ===== Menú móvil ===== */
const burgerBtn = document.getElementById('burgerBtn');
const navInner  = document.getElementById('navInner');
if(burgerBtn && navInner){
  burgerBtn.addEventListener('click', () => navInner.classList.toggle('open'));
  navInner.querySelectorAll('nav.links a, .nav-auth a, .nav-auth button').forEach(el=>{
    el.addEventListener('click', () => navInner.classList.remove('open'));
  });
}

/* ===== Formulario de contacto (100% funcional en frontend) ===== */
const form       = document.getElementById('contactForm');
const nombre     = document.getElementById('nombre');
const correo     = document.getElementById('correo');
const mensaje    = document.getElementById('mensaje');
const submitBtn  = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');

const ICON_CHECK = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
const ICON_WARN  = '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/>';

let hideTimer = null;

function showStatus(type, message){
  clearTimeout(hideTimer);
  formStatus.classList.remove('ok', 'error', 'show');
  statusIcon.innerHTML = type === 'ok' ? ICON_CHECK : ICON_WARN;
  statusText.textContent = message;
  formStatus.classList.add(type);
  void formStatus.offsetWidth;
  formStatus.classList.add('show');

  if(type === 'ok'){
    hideTimer = setTimeout(() => formStatus.classList.remove('show'), 8000);
  }
}

function setError(id, msg){
  document.getElementById('err-' + id).textContent = msg;
  const field = document.getElementById(id).closest('.field');
  if(msg){
    field.classList.add('field-invalid');
    field.classList.remove('field-valid');
  } else {
    field.classList.remove('field-invalid');
  }
}

function markValid(id){
  const field = document.getElementById(id).closest('.field');
  field.classList.remove('field-invalid');
  field.classList.add('field-valid');
}

function validEmail(v){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validateField(id){
  const value = document.getElementById(id).value.trim();
  if(id === 'nombre'  && value.length < 2){  setError('nombre',  'Ingresa tu nombre completo.'); return false; }
  if(id === 'correo'  && !validEmail(value)){ setError('correo',  'Ingresa un correo válido.');    return false; }
  if(id === 'mensaje' && value.length < 10){ setError('mensaje', 'Cuéntanos un poco más (mínimo 10 caracteres).'); return false; }
  setError(id, '');
  markValid(id);
  return true;
}

if(form){
  [nombre, correo, mensaje].forEach(field => {
    field.addEventListener('input', () => {
      if(field.closest('.field').classList.contains('field-invalid')){
        validateField(field.id);
      }
    });
    field.addEventListener('blur', () => validateField(field.id));
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();

    const ok = validateField('nombre') & validateField('correo') & validateField('mensaje');
    if(!ok){
      showStatus('error', 'Revisa los campos marcados antes de enviar tu mensaje.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    formStatus.classList.remove('show');

    // Simulación de envío (aquí se conectaría un backend real / EmailJS / Formspree)
    setTimeout(() => {
      const primerNombre  = nombre.value.trim().split(' ')[0];
      const correoEnviado = correo.value.trim();

      showStatus('ok', '¡Gracias, ' + primerNombre + '! Se envió su mensaje exitosamente. Te responderemos a ' + correoEnviado + ' muy pronto.');

      form.reset();
      [nombre, correo, mensaje].forEach(f => f.closest('.field').classList.remove('field-valid', 'field-invalid'));
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar mensaje';
    }, 900);
  });
}
