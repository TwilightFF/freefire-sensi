/* ──────────────────────────────────────────────────
   FF SENSI PRO — scripts.js  v2
────────────────────────────────────────────────── */

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── FILTROS SENSI ──
const filterBtns = document.querySelectorAll('.filter-btn');
const sensiCards = document.querySelectorAll('.sensi-card');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    sensiCards.forEach(card => {
      const cats = card.dataset.cat || '';
      card.classList.toggle('hidden', filter !== 'all' && !cats.includes(filter));
    });
  });
});

// ── COPIAR SENSIBILIDADES ──
function copySensi(btn, values) {
  const arr = values.split(',');
  const text = `FF Sensibilidad:\nGeneral: ${arr[0]} | Mira roja: ${arr[1]} | 2x: ${arr[2]} | 4x: ${arr[3]} | Franco: ${arr[4]}`;
  copyToClipboard(text);
  showToast('toast');
}

function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

// ── TOAST ──
const toastTimers = {};
function showToast(id) {
  const t = document.getElementById(id);
  if (!t) return;
  t.classList.add('show');
  clearTimeout(toastTimers[id]);
  toastTimers[id] = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── DESCARGA DEMO ──
function showDownloadMsg(e) {
  e.preventDefault();
  alert('Archivo de demo. Reemplaza href="#" con tu enlace real (Google Drive, Mediafire, etc.)');
}

// ── BARRAS ──
const barObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting)
      entry.target.querySelectorAll('.val-fill').forEach(b => b.style.width = b.style.getPropertyValue('--pct'));
  });
}, { threshold: 0.1 });
document.querySelectorAll('.sensi-card').forEach(c => barObs.observe(c));

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const t = document.querySelector(this.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ════════════════════════════════════════════════
   GENERADOR DE RETOS CON IA
════════════════════════════════════════════════ */

let retoHistorial = JSON.parse(localStorage.getItem('ffRetoHistorial') || '[]');

function actualizarHistorial(texto, emoji) {
  retoHistorial.unshift({ texto, emoji, hora: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) });
  if (retoHistorial.length > 8) retoHistorial.pop();
  localStorage.setItem('ffRetoHistorial', JSON.stringify(retoHistorial));
  renderHistorial();
}

function renderHistorial() {
  const wrap = document.getElementById('retoHistorial');
  const list = document.getElementById('historialList');
  if (!wrap || !list) return;
  if (!retoHistorial.length) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  list.innerHTML = retoHistorial.map(r => `
    <div class="historial-item">
      <span class="h-emoji">${r.emoji}</span>
      <span>${r.texto.substring(0, 90)}${r.texto.length > 90 ? '...' : ''}</span>
      <span class="h-time">${r.hora}</span>
    </div>
  `).join('');
}
renderHistorial();

async function generarReto() {
  const btn     = document.getElementById('retoBtn');
  const btnText = document.getElementById('retoBtnText');
  const output  = document.getElementById('retoOutput');
  const cat     = document.getElementById('retoCategory');
  const tags    = document.getElementById('retoTags');
  const copyBtn = document.getElementById('copyRetoBtn');
  const ring    = document.getElementById('ruletaRing');
  const ruletaEmoji = document.getElementById('ruletaEmoji');
  const tipo        = document.getElementById('retoTipo').value;
  const dificultad  = document.getElementById('retoDificultad').value;

  btn.disabled = true;
  btnText.textContent = 'Generando reto...';
  ring.classList.add('spinning');
  ruletaEmoji.textContent = '...';
  copyBtn.style.display = 'none';
  tags.innerHTML = '';
  cat.textContent = 'Pensando...';
  output.innerHTML = '<p class="reto-placeholder">La IA esta creando tu reto... espera un momento.</p>';

  const tipoLabel = tipo === 'cualquiera' ? 'cualquier tipo creativo' : tipo;
  const difLabel  = dificultad === 'cualquiera' ? 'cualquier dificultad' : dificultad;

  const prompt = `Eres un experto creador de contenido de Free Fire con experiencia generando videos virales en TikTok e Instagram para la comunidad hispana.

Genera UN reto o idea para video de Free Fire que sea original, divertido y realizable en Free Fire movil.
Tipo solicitado: ${tipoLabel}
Dificultad: ${difLabel}

Responde UNICAMENTE con este JSON sin texto extra ni backticks:
{"categoria":"nombre categoria corta","titulo":"titulo llamativo maximo 55 chars","descripcion":"descripcion del reto en 2 oraciones claras","regla_especial":"un twist o regla extra divertida","emoji":"un emoji","tags":["tag1","tag2","tag3"],"duracion_sugerida":"ej: 3-5 min"}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await res.json();
    const raw  = (data.content && data.content[0] && data.content[0].text) || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const reto  = JSON.parse(clean);

    ring.classList.remove('spinning');
    ruletaEmoji.textContent = reto.emoji || '🎯';
    cat.textContent = reto.categoria || 'Reto Especial';

    output.innerHTML = `
      <p class="reto-text">
        <strong style="font-size:1.1rem;color:var(--text-0);display:block;margin-bottom:10px">${reto.titulo}</strong>
        ${reto.descripcion}
        <span class="reto-rule">Twist: ${reto.regla_especial}</span>
        <span class="reto-rule" style="border-color:var(--accent);color:var(--accent)">Duracion sugerida: ${reto.duracion_sugerida}</span>
      </p>`;

    tags.innerHTML = (reto.tags || []).map(t => `<span class="reto-tag">#${t}</span>`).join('');
    copyBtn.style.display = 'flex';
    window._ultimoReto = `${reto.titulo}\n\n${reto.descripcion}\n\nTwist: ${reto.regla_especial}\nDuracion: ${reto.duracion_sugerida}\n\nGenerado por FFSensiPro`;
    actualizarHistorial(reto.titulo, reto.emoji || '🎯');

  } catch (err) {
    ring.classList.remove('spinning');
    ruletaEmoji.textContent = '!';
    cat.textContent = 'Error';
    output.innerHTML = `<p class="reto-placeholder" style="color:#e63946">No se pudo conectar con la IA. Revisa tu internet e intenta de nuevo.<br><small>${err.message}</small></p>`;
  }

  btn.disabled = false;
  btnText.textContent = 'Generar otro reto';
}

function copiarReto() {
  if (window._ultimoReto) { copyToClipboard(window._ultimoReto); showToast('toast'); }
}

/* ════════════════════════════════════════════════
   FORO DE IDEAS
════════════════════════════════════════════════ */

let foroIdeas = JSON.parse(localStorage.getItem('ffForoIdeas') || '[]');
renderIdeas();

const foroIdeaEl = document.getElementById('foroIdea');
const foroCounterEl = document.getElementById('foroCounter');
if (foroIdeaEl && foroCounterEl) {
  foroIdeaEl.addEventListener('input', () => {
    foroCounterEl.textContent = foroIdeaEl.value.length + ' / 500';
  });
}

function enviarIdea(e) {
  e.preventDefault();
  const nombre = document.getElementById('foroNombre').value.trim();
  const tipo   = document.getElementById('foroTipo').value;
  const idea   = document.getElementById('foroIdea').value.trim();
  const redes  = document.getElementById('foroRedes').value.trim();
  if (!nombre || !idea || idea.length < 20) return;

  const tipoLabels = { reto:'Reto', feature:'Funcion', config:'Config', collab:'Collab', otro:'Otro' };
  foroIdeas.unshift({
    id: Date.now(), nombre, tipo: tipoLabels[tipo] || tipo,
    idea, redes, fecha: new Date().toLocaleDateString('es', { day:'2-digit', month:'short', year:'numeric' })
  });
  if (foroIdeas.length > 30) foroIdeas.pop();
  localStorage.setItem('ffForoIdeas', JSON.stringify(foroIdeas));
  document.getElementById('foroForm').reset();
  if (foroCounterEl) foroCounterEl.textContent = '0 / 500';
  renderIdeas();
  showToast('toastForo');
}

function renderIdeas() {
  const list  = document.getElementById('foroIdeasList');
  const empty = document.getElementById('foroEmpty');
  if (!list) return;
  if (!foroIdeas.length) { list.innerHTML = ''; if (empty) empty.style.display = 'block'; return; }
  if (empty) empty.style.display = 'none';
  list.innerHTML = foroIdeas.slice(0, 10).map(i => `
    <div class="foro-idea-card">
      <div class="foro-idea-header">
        <span class="foro-idea-user">@${escH(i.nombre)}</span>
        <span class="foro-idea-tipo">${i.tipo}</span>
      </div>
      <p class="foro-idea-text">${escH(i.idea)}</p>
      <p class="foro-idea-time">${i.redes ? escH(i.redes) + ' · ' : ''}${i.fecha}</p>
    </div>
  `).join('');
}

function escH(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ════════════════════════════════════════════════
   RANKING
════════════════════════════════════════════════ */
const defaultRanking = [
  { pos:1, nombre:'GamerXXL',      retos:12, plataforma:'TikTok',    estado:'activo' },
  { pos:2, nombre:'RetoKing_FF',   retos:9,  plataforma:'YouTube',   estado:'activo' },
  { pos:3, nombre:'NoobMaster_FF', retos:7,  plataforma:'TikTok',    estado:'activo' },
  { pos:4, nombre:'ProSniper99',   retos:5,  plataforma:'Instagram',  estado:'nuevo'  },
  { pos:5, nombre:'TuNombre',      retos:3,  plataforma:'TikTok',    estado:'nuevo'  },
];
const rankingData = JSON.parse(localStorage.getItem('ffRanking') || 'null') || defaultRanking;

function renderRanking() {
  const body = document.getElementById('rankingBody');
  if (!body) return;
  const posClase = ['gold','silver','bronze'];
  const posEmoji = ['1', '2', '3'];
  body.innerHTML = rankingData.map((r,i) => `
    <tr>
      <td><span class="rank-pos ${posClase[i]||''}">${posEmoji[i]||r.pos}</span></td>
      <td style="font-weight:600;color:var(--text-0)">${escH(r.nombre)}</td>
      <td style="font-family:var(--font-display);color:var(--accent)">${r.retos}</td>
      <td class="rank-plat">${r.plataforma}</td>
      <td><span class="rank-badge ${r.estado}">${r.estado==='activo'?'Activo':'Nuevo'}</span></td>
    </tr>
  `).join('');
}
renderRanking();
