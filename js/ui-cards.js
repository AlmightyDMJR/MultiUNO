// ══════════════════════════════════════════
// CARD DOM BUILDERS
// ══════════════════════════════════════════
function makeCard(card, idx, myTurn) {
  const el = document.createElement('div');
  el.className = `card c-${card.color}`;
  if (myTurn && canPlayCard(card)) {
    el.classList.add('playable');
    el.addEventListener('click', () => humanPlay(idx));
  } else el.classList.add('unplayable');
  el.appendChild(buildCardFace(card, false));
  return el;
}
function buildCardFace(card, large) {
  const el = document.createElement('div');
  el.className = 'cf';
  const s = sym(card),
    sz = large ? 46 : 36,
    osW = large ? 58 : 44,
    osH = large ? 82 : 62,
    csz = large ? 16 : 13;
  if (card.type === 'wild' || card.type === 'wild4') {
    el.style.background = '#1a0a2e';
    el.innerHTML = `<div class="wild-quad"><span></span><span></span><span></span><span></span></div>
      <div class="cf-oval" style="width:${osW}px;height:${osH}px;background:rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.5)"></div>
      <div class="cf-sym" style="font-size:${sz}px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.9),0 0 20px rgba(255,255,255,.4);z-index:2;font-weight:900">${s}</div>
      <div class="cf-tl" style="color:#fff;font-size:${csz}px;text-shadow:0 1px 4px rgba(0,0,0,.8)">${s}</div>
      <div class="cf-br" style="color:#fff;font-size:${csz}px;text-shadow:0 1px 4px rgba(0,0,0,.8)">${s}</div>`;
  } else {
    el.style.background = BG_GRAD[card.color] || BG[card.color];
    const ovalBg =
      card.color === 'yellow'
        ? 'rgba(0,0,0,.18)'
        : 'rgba(255,255,255,.18)';
    el.innerHTML = `<div class="cf-oval" style="width:${osW}px;height:${osH}px;background:${ovalBg};border:2px solid rgba(255,255,255,.45)"></div>
      <div class="cf-sym sc-${card.color}" style="font-size:${sz}px">${s}</div>
      <div class="cf-tl sc-${card.color}" style="font-size:${csz}px">${s}</div>
      <div class="cf-br sc-${card.color}" style="font-size:${csz}px">${s}</div>`;
  }
  return el;
}
