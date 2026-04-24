// ══════════════════════════════════════════
// UI — RENDER
// ══════════════════════════════════════════

// ── Opponent Zone Positions ──
const OPP_POS = [
  { top: '4%', left: '50%', txStr: 'translateX(-50%)' },
  { top: '18%', left: '4%', txStr: 'translate(0,0)' },
  { top: '18%', right: '4%', txStr: 'translate(0,0)' },
  { top: '50%', left: '3%', txStr: 'translateY(-50%)' },
  { top: '50%', right: '3%', txStr: 'translateY(-50%)' },
  { top: '76%', left: '6%', txStr: 'translate(0,-50%)' },
];
function bottomPlayerId() {
  if (mode === 'online') return G.players[myOnlineIndex]?.id;
  if (!G.players[G.curIdx].cpu) return G.players[G.curIdx].id;
  for (let i = 1; i < G.players.length; i++) {
    const ni =
      (G.curIdx + i * G.direction + G.players.length * 100) %
      G.players.length;
    if (!G.players[ni].cpu) return G.players[ni].id;
  }
  return G.players[0].id;
}
function buildOppZones() {
  const c = document.getElementById('opp-zones');
  c.innerHTML = '';
  const bid = bottomPlayerId();
  const opps = G.players.filter((p) => p.id !== bid);
  opps.forEach((p, oi) => {
    const pos = OPP_POS[oi] || OPP_POS[0];
    const z = document.createElement('div');
    z.className = 'opp-zone';
    z.id = `oz-${p.id}`;
    let st = `top:${pos.top};`;
    if (pos.left) st += `left:${pos.left};`;
    if (pos.right) st += `right:${pos.right};`;
    st += `transform:${pos.txStr};`;
    z.style.cssText = st;
    z.innerHTML = `<div class="opp-name-lbl">${escH(p.name)}</div>
      <div class="opp-hand-row" id="oh-${p.id}"></div>
      <div class="opp-count" id="oc-${p.id}">7 cards</div>`;
    c.appendChild(z);
  });
}
function buildScoresPanel() {
  const el = document.getElementById('scores-panel');
  el.innerHTML = '';
  G.players.forEach((p) => {
    const b = document.createElement('div');
    b.className = 's-box';
    b.innerHTML = `<div class="s-lbl">${escH(p.name.substring(0, 10))}</div><div class="s-val" id="sv-${p.id}">7</div>`;
    el.appendChild(b);
  });
}

// ── Render Functions ──
let _lastBottomId = null;
function renderAll() {
  if (!G.players) return;
  // Rebuild opponent zones when the bottom player changes (turn swap in local multi-human)
  const curBid = bottomPlayerId();
  if (curBid !== _lastBottomId) {
    _lastBottomId = curBid;
    buildOppZones();
    buildScoresPanel();
  }
  renderBottom();
  renderOpps();
  renderDiscard();
  renderColorRing();
  renderScores();
  renderTurnMsg();
}
function renderBottom() {
  const bid = bottomPlayerId();
  const p = G.players.find((pl) => pl.id === bid);
  if (!p) return;
  document.getElementById('bottom-name-lbl').textContent = p.name;
  const h = document.getElementById('bottom-hand');
  h.innerHTML = '';
  const myTurn = G.curIdx === G.players.indexOf(p) && !p.cpu && G.active;
  const onlineTurn =
    mode === 'online' && G.curIdx === myOnlineIndex && G.active;
  const isTurn = mode === 'local' ? myTurn : onlineTurn;
  p.hand.forEach((c, i) => {
    const el = makeCard(c, i, isTurn);
    el.style.animationDelay = `${i * 0.055}s`;
    h.appendChild(el);
  });
  document
    .getElementById('bottom-zone')
    .classList.toggle(
      'cur',
      mode === 'local'
        ? G.curIdx === G.players.indexOf(p)
        : G.curIdx === myOnlineIndex,
    );
  // Buttons
  const pIdx = G.players.indexOf(p);
  const canCallUno =
    p.hand.length === 1 &&
    G.active &&
    !G.unoFlags[pIdx] &&
    (mode === 'local' || pIdx === myOnlineIndex);
  const showUnoBtn =
    G.active && (mode === 'local' || pIdx === myOnlineIndex);
  const unoBtn = document.getElementById('uno-btn');
  unoBtn.style.display = showUnoBtn ? 'inline-block' : 'none';
  unoBtn.disabled = !canCallUno;
  // Skip/Pass button only shows after drawing a card
  const showSkip = isTurn && G.active && G.drawnThisTurn;
  const skipBtn = document.getElementById('skip-btn');
  skipBtn.style.display = showSkip ? 'inline-block' : 'none';
  skipBtn.textContent = 'PASS';
  // Show stack warning in turn msg if mustStack
  if (isTurn && G.mustStack) {
    document.getElementById('turn-msg').textContent =
      `STACK +${G.stackPending} OR DRAW!`;
  }
}
function renderOpps() {
  const bid = bottomPlayerId();
  G.players
    .filter((p) => p.id !== bid)
    .forEach((p) => {
      const hand = document.getElementById(`oh-${p.id}`);
      const cnt = document.getElementById(`oc-${p.id}`);
      const oz = document.getElementById(`oz-${p.id}`);
      if (!hand) return;
      const show = Math.min(p.hand.length, 12);
      hand.innerHTML = '';
      for (let i = 0; i < show; i++) {
        const c = document.createElement('div');
        c.className = 'opp-mini';
        c.style.cssText = `width:28px;height:42px;margin-left:${i > 0 ? '-11px' : '0'};z-index:${i}`;
        hand.appendChild(c);
      }
      if (cnt)
        cnt.textContent = `${p.hand.length} card${p.hand.length !== 1 ? 's' : ''}`;
      if (oz)
        oz.classList.toggle('cur', G.curIdx === G.players.indexOf(p));
    });
}
function renderDiscard() {
  const top = G.discardPile[G.discardPile.length - 1];
  if (!top) return;
  const el = document.getElementById('discard-live');
  el.innerHTML = '';
  const face = buildCardFace(top, true);
  face.style.cssText = 'position:absolute;inset:0;border-radius:11px;';
  const glow = GLOW[G.currentColor] || 'rgba(255,255,255,.4)';
  face.style.boxShadow = `0 0 28px ${glow}, 0 0 56px ${glow.replace('.85', '.4')}, 0 8px 24px rgba(0,0,0,.6)`;
  face.classList.add('slam');
  el.appendChild(face);
  // Also glow the discard zone border
  const dz = document.getElementById('discard-zone');
  const borderColor = BG[G.currentColor] || 'rgba(255,255,255,.28)';
  dz.style.boxShadow = `0 0 22px ${glow.replace('.85', '.5')}, inset 0 0 12px ${glow.replace('.85', '.15')}`;
  dz.style.borderColor = borderColor;
  dz.style.borderStyle = 'solid';
}
function renderColorRing() {
  const r = document.getElementById('color-ring');
  r.style.background = BG[G.currentColor] || '#888';
  r.style.boxShadow = `0 0 20px ${GLOW[G.currentColor] || 'rgba(255,255,255,.3)'}`;
}
function renderScores() {
  G.players.forEach((p) => {
    const e = document.getElementById(`sv-${p.id}`);
    if (e) e.textContent = p.hand.length;
  });
}
function renderTurnMsg() {
  const p = G.players[G.curIdx];
  const myId = bottomPlayerId();
  const isMe =
    mode === 'online' ? G.curIdx === myOnlineIndex : p.id === myId;
  document.getElementById('turn-msg').textContent = !G.active
    ? 'GAME OVER'
    : isMe
      ? 'YOUR TURN'
      : p.cpu
        ? `${p.name} THINKING…`
        : `${p.name.toUpperCase()}'S TURN`;
}
