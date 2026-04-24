// ══════════════════════════════════════════
// UI — SCREEN NAVIGATION, TOAST, LOCAL SETUP, FLASH MSG
// ══════════════════════════════════════════

// ── Screen Navigation ──
const SCREENS = [
  'home-screen',
  'create-screen',
  'join-screen',
  'lobby-screen',
  'local-screen',
  'pass-screen',
];
function showScreen(id) {
  SCREENS.forEach((s) => {
    const el = document.getElementById(s);
    if (s === id) {
      el.classList.remove('out', 'gone');
    } else {
      el.classList.add('out');
    }
  });
  if (id === 'create-screen') initPreviewCode();
}

// ── Toast ──
let toastT;
function toast(msg, dur = 2800) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(toastT);
  toastT = setTimeout(() => (el.style.opacity = '0'), dur);
}

// ── Local Setup ──
let localSetup = [
  { name: 'Player 1', cpu: false },
  { name: 'Player 2', cpu: false },
];
function renderLocalSetup() {
  const el = document.getElementById('local-player-list');
  el.innerHTML = '';
  localSetup.forEach((p, i) => {
    const r = document.createElement('div');
    r.style.cssText =
      'display:flex;align-items:center;gap:8px;margin-bottom:9px';
    r.innerHTML = `
      <input type="text" value="${p.name}" maxlength="12"
        style="flex:1;background:rgba(255,255,255,.07);border:1px solid var(--border);border-radius:8px;
               padding:9px 12px;color:#fff;font-family:Nunito,sans-serif;font-size:14px;outline:none;min-width:0"
        oninput="localSetup[${i}].name=this.value">
      ${
    localSetup.length > 2
      ? `<button onclick="lsRemove(${i})"
        style="width:28px;height:28px;border-radius:50%;background:rgba(255,50,50,.12);
          border:1px solid rgba(255,50,50,.25);color:rgba(255,100,100,.6);cursor:pointer;
          font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">×</button>`
      : ''
    }`;
    el.appendChild(r);
  });
}
function lsRemove(i) {
  if (localSetup.length > 2) {
    localSetup.splice(i, 1);
    renderLocalSetup();
  }
}
renderLocalSetup();

// ── Flash Msg ──
function showMsg(txt, dur = 1200) {
  const m = document.getElementById('msg');
  m.textContent = txt;
  m.style.opacity = '1';
  clearTimeout(m._t);
  m._t = setTimeout(() => (m.style.opacity = '0'), dur);
}
