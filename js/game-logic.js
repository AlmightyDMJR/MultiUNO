// ══════════════════════════════════════════
// GAME LOGIC — Apply Card, Advance, UNO Timers, Stacking
// ══════════════════════════════════════════

function clearUnoTimer(idx) {
  if (!G.unoTimers) G.unoTimers = {};
  if (G.unoTimers[idx]) {
    clearTimeout(G.unoTimers[idx]);
    G.unoTimers[idx] = null;
  }
}

function clearAllUnoTimers() {
  if (!G.unoTimers) return;
  Object.keys(G.unoTimers).forEach((k) => {
    if (G.unoTimers[k]) clearTimeout(G.unoTimers[k]);
  });
  G.unoTimers = {};
}

function onHandCountChanged(idx) {
  const p = G.players[idx];
  if (!p) return;
  if (p.hand.length !== 1) {
    G.unoFlags[idx] = false;
    clearUnoTimer(idx);
    return;
  }
  if (p.cpu) {
    G.unoFlags[idx] = true;
    clearUnoTimer(idx);
    return;
  }
  G.unoFlags[idx] = false;
  clearUnoTimer(idx);
  const allowTimer = mode === 'local' || idx === myOnlineIndex;
  if (!allowTimer) return;
  G.unoTimers[idx] = setTimeout(() => {
    const live = G.players[idx];
    if (!G.active || !live || live.hand.length !== 1 || G.unoFlags[idx]) {
      return;
    }
    playSfx('penalty');
    showMsg(`${live.name.toUpperCase()} +2 UNO PENALTY`, 1600);
    giveForceDraw(idx, 2);
    if (mode === 'online') pushStateToFirebase();
    renderAll();
  }, 3000);
}

function autoResolveStackForCurrent() {
  if (!G.mustStack || G.stackPending <= 0 || !G.stackType) return false;
  const p = G.players[G.curIdx];
  if (!p) return false;
  const canStack = p.hand.some((c) => c.type === G.stackType);
  if (canStack) return false;

  const total = G.stackPending;
  G.stackPending = 0;
  G.stackType = null;
  G.mustStack = false;
  playSfx('penalty');
  showMsg(`+${total} CARDS!`, 1400);
  giveForceDraw(G.curIdx, total);
  if (mode === 'online') pushStateToFirebase();
  setTimeout(
    () => {
      advance();
      afterTurn();
      renderAll();
    },
    total * 220 + 420,
  );
  return true;
}

function applyCard(card, whoIdx) {
  G.discardPile.push(card);
  if (card.color !== 'wild') G.currentColor = card.color;
  onHandCountChanged(whoIdx);

  if (card.type === 'skip') {
    playSfx('skip');
    showMsg('SKIP!', 900);
    advance();
    advance();
  } else if (card.type === 'reverse') {
    playSfx('skip');
    G.direction *= -1;
    document.getElementById('dir-ring').style.transform =
      `translateY(-50%) scaleX(${G.direction})`;
    showMsg('REVERSE!', 900);
    if (G.players.length === 2) {
      advance();
      advance();
    } else {
      advance();
    }
  } else if (card.type === 'draw2') {
    playSfx('stack');
    showMsg('+2 STACK!');
    G.stackPending = (G.stackPending || 0) + 2;
    G.stackType = 'draw2';
    G.mustStack = true;
    advance();
    if (checkWin(whoIdx)) return;
    if (autoResolveStackForCurrent()) return;
    afterTurn();
    return;
  } else if (card.type === 'wild4') {
    playSfx('stack');
    showMsg('+4 STACK!');
    G.stackPending = (G.stackPending || 0) + 4;
    G.stackType = 'wild4';
    G.mustStack = true;
    advance();
    if (checkWin(whoIdx)) return;
    if (autoResolveStackForCurrent()) return;
    afterTurn();
    return;
  } else {
    advance();
  }

  if (checkWin(whoIdx)) return;
  afterTurn();
}
function giveForceDraw(toIdx, n) {
  const p = G.players[toIdx];
  onHandCountChanged(toIdx);
  const bid = bottomPlayerId();
  const tz = p.id === bid ? 'bottom' : `opp-${p.id}`;
  for (let i = 0; i < n; i++) {
    if (G.deck.length === 0) reshuffleDiscard();
    const c = G.deck.pop();
    if (!c) continue;
    flyCard(
      c,
      'deck',
      tz,
      () => {
        p.hand.push(c);
        onHandCountChanged(toIdx);
        renderAll();
      },
      i * 220,
    );
  }
}
function advance() {
  G.curIdx =
    (G.curIdx + G.direction + G.players.length) % G.players.length;
}
function afterTurn() {
  G.drawnThisTurn = false;
  if (autoResolveStackForCurrent()) {
    renderAll();
    return;
  }
  if (mode === 'online') pushStateToFirebase();
  renderAll();
  if (!G.active) return;
  const p = G.players[G.curIdx];
  if (p.cpu) {
    setTimeout(aiTurn, 900);
  } else if (mode === 'local' && multiHuman()) {
    showPassScreen();
  }
}
