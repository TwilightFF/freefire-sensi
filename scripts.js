/* ──────────────────────────────────────────────────
   FF SENSI PRO — scripts.js
────────────────────────────────────────────────── */

// ── NAVBAR: clase scrolled al bajar ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ── HAMBURGER MENÚ (móvil) ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
// Cierra el menú al hacer clic en un link
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── FILTROS DE SENSIBILIDADES ──
const filterBtns = document.querySelectorAll('.filter-btn');
const sensiCards = document.querySelectorAll('.sensi-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    sensiCards.forEach(card => {
      const cats = card.dataset.cat || '';
      if (filter === 'all' || cats.includes(filter)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ── COPIAR VALORES AL PORTAPAPELES ──
function copySensi(btn, values) {
  const text = `General: ${values.split(',')[0]} | Mira roja: ${values.split(',')[1]} | 2x: ${values.split(',')[2]} | 4x: ${values.split(',')[3]} | Franco: ${values.split(',')[4]}`;
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => showToast());
  } else {
    // fallback para navegadores sin soporte
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast();
  }
}

// ── TOAST DE CONFIRMACIÓN ──
let toastTimer;
function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── MENSAJE DESCARGA (placeholder) ──
function showDownloadMsg(e) {
  e.preventDefault();
  alert('⚠️ Este es un archivo de demostración.\n\nPara activar la descarga, reemplaza el href="#" en el HTML con tu enlace real (Google Drive, Mediafire, etc.)');
}

// ── ANIMACIÓN DE BARRAS AL ENTRAR EN VISTA ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.val-fill').forEach(bar => {
        bar.style.width = bar.style.getPropertyValue('--pct') || bar.style.width;
      });
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.sensi-card').forEach(card => observer.observe(card));

// ── SMOOTH SCROLL para links de nav (refuerzo) ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
