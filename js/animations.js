// ══════════════════════════════════════════
// ANIMATIONS — Flying Card, Particles, Stars
// ══════════════════════════════════════════

// ── Flying card (smooth arc) ──
function getRect(zone) {
  if (zone === 'deck')
    return document.getElementById('draw-pile').getBoundingClientRect();
  if (zone === 'discard')
    return document
      .getElementById('discard-zone')
      .getBoundingClientRect();
  if (zone === 'bottom') {
    return document.getElementById('bottom-hand').getBoundingClientRect();
  }
  if (zone.startsWith('opp-')) {
    const id = zone.split('-').slice(1).join('-');
    const oz = document.getElementById(`oz-${id}`);
    if (oz) return oz.getBoundingClientRect();
  }
  return {
    left: window.innerWidth / 2 - 35,
    top: window.innerHeight / 2 - 52,
    width: 70,
    height: 104,
  };
}
function flyCard(card, from, to, cb, delay = 0) {
  setTimeout(() => {
    const fr = getRect(from),
      tr = getRect(to);
    const fw = 62,
      fh = 93;
    const fx = fr.left + fr.width / 2 - fw / 2,
      fy = fr.top + fr.height / 2 - fh / 2;
    const tx = tr.left + tr.width / 2 - fw / 2,
      ty = tr.top + tr.height / 2 - fh / 2;
    const el = document.createElement('div');
    el.className = 'fly-card';
    el.style.cssText = `left:${fx}px;top:${fy}px;width:${fw}px;height:${fh}px;background:${BG[card.color]};`;
    const showFace = to === 'discard' || to === 'bottom';
    if (showFace) {
      const f = buildCardFace(card, false);
      f.style.cssText = 'position:absolute;inset:0;border-radius:8px';
      el.appendChild(f);
    } else {
      const b = document.createElement('div');
      b.className = 'card-back-face';
      b.style.cssText = 'position:absolute;inset:0;border-radius:8px';
      el.appendChild(b);
    }
    document.body.appendChild(el);
    const DUR = 700;
    const arcH = Math.min(80, Math.hypot(tx - fx, ty - fy) * 0.3);
    const startT = performance.now();
    function frame(now) {
      const raw = Math.min((now - startT) / DUR, 1);
      // ease-in-out-cubic
      const t =
        raw < 0.5
          ? 4 * raw * raw * raw
          : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      const cx = fx + (tx - fx) * t;
      const cy = fy + (ty - fy) * t - Math.sin(raw * Math.PI) * arcH;
      const rot = (1 - t) * 9 * (from === 'deck' ? -1 : 1);
      const sc = 0.6 + t * 0.4;
      el.style.transform = `translate(${cx - fx}px,${cy - fy}px) rotate(${rot}deg) scale(${sc})`;
      el.style.opacity = raw > 0.8 ? String(1 - (raw - 0.8) / 0.2) : '1';
      if (raw < 1) requestAnimationFrame(frame);
      else {
        el.remove();
        if (cb) cb();
      }
    }
    requestAnimationFrame(frame);
  }, delay);
}

// ── Particles ──
const pcv = document.getElementById('pcv');
const pctx = pcv.getContext('2d');
let parts = [];
function resizePcv() {
  pcv.width = window.innerWidth;
  pcv.height = window.innerHeight;
}
resizePcv();
window.addEventListener('resize', resizePcv);
function burst(color) {
  const cc = {
    red: '#ff4d5e',
    blue: '#5ba8ff',
    green: '#4cd44c',
    yellow: '#ffd700',
    wild: '#c9a6ff',
  };
  const c = cc[color] || '#fff',
    cx = pcv.width / 2,
    cy = pcv.height / 2;
  for (let i = 0; i < 30; i++) {
    const a = Math.random() * Math.PI * 2,
      sp = 1.5 + Math.random() * 4;
    parts.push({
      x: cx,
      y: cy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 1.8,
      c,
      life: 1,
      size: 3 + Math.random() * 5,
      sq: Math.random() > 0.5,
    });
  }
}
function animParts() {
  pctx.clearRect(0, 0, pcv.width, pcv.height);
  parts = parts.filter((p) => p.life > 0);
  parts.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= 0.018; // slower fade
    pctx.save();
    pctx.globalAlpha = p.life;
    pctx.fillStyle = p.c;
    if (p.sq) {
      pctx.translate(p.x, p.y);
      pctx.rotate(p.life * 4);
      pctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    } else {
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      pctx.fill();
    }
    pctx.restore();
  });
  requestAnimationFrame(animParts);
}
animParts();

// ── Stars ──
function createStars() {
  const el = document.getElementById('stars');
  el.innerHTML = '';
  for (let i = 0; i < 65; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${1 + Math.random() * 2}px;height:${1 + Math.random() * 2}px;--d:${2.5 + Math.random() * 4.5}s;--dl:${Math.random() * 5}s`;
    el.appendChild(s);
  }
}
