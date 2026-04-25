// ══════════════════════════════════════════
// GAME LOGIC — Apply Card, Advance, UNO Timers, Stacking
// ══════════════════════════════════════════

// Guard flag to prevent multiple simultaneous turn resolutions
let _resolvingStack = false;

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

/**
 * Check if the current player must accept a stack penalty because they
 * have no matching draw card. Returns true if the penalty was auto-applied
 * (caller should stop processing the turn). Returns false if the player
 * CAN stack (let them play) or if there is no pending stack.
 */
function autoResolveStackForCurrent() {
  if (!G.mustStack || G.stackPending <= 0 || !G.stackType) return false;
  if (_resolvingStack) return false; // already resolving, don't double-fire
  const p = G.players[G.curIdx];
  if (!p) return false;
  const canStack = p.hand.some((c) => c.type === G.stackType);
  if (canStack) return false;

  // Player cannot stack — force draw the full penalty
  _resolvingStack = true;
  const total = G.stackPending;
  const penaltyIdx = G.curIdx; // snapshot before any advance
  G.stackPending = 0;
  G.stackType = null;
  G.mustStack = false;
  playSfx('penalty');
  showMsg(`+${total} CARDS!`, 1400);
  giveForceDraw(penaltyIdx, total);
  // Advance turn and push state IMMEDIATELY so Firebase has correct state
  advance();
  if (mode === 'online') pushStateToFirebase();
  renderAll();
  setTimeout(
    () => {
      _resolvingStack = false;
      afterTurn();
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
      `scaleX(${G.direction})`;
    showMsg('REVERSE!', 900);
    if (G.players.length === 2) {
      advance();
      advance();
    } else {
      advance();
    }
  } else if (card.type === 'draw2') {
    playSfx('stack');
    G.stackPending = (G.stackPending || 0) + 2;
    G.stackType = 'draw2';
    G.mustStack = true;
    showMsg(`+${G.stackPending} STACK!`);
    advance();
    if (checkWin(whoIdx)) return;
    // Check if next player can stack; if not, auto-resolve
    if (autoResolveStackForCurrent()) return;
    // Next player CAN stack — hand control to them
    afterTurn();
    return;
  } else if (card.type === 'wild4') {
    playSfx('stack');
    G.stackPending = (G.stackPending || 0) + 4;
    G.stackType = 'wild4';
    G.mustStack = true;
    showMsg(`+${G.stackPending} STACK!`);
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
  const bid = bottomPlayerId();
  const tz = p.id === bid ? 'bottom' : `opp-${p.id}`;
  // Add cards to hand IMMEDIATELY so state is correct for Firebase sync
  const drawnCards = [];
  for (let i = 0; i < n; i++) {
    if (G.deck.length === 0) reshuffleDiscard();
    const c = G.deck.pop();
    if (!c) continue;
    p.hand.push(c);
    drawnCards.push(c);
  }
  onHandCountChanged(toIdx);
  // Fly animations are purely visual
  drawnCards.forEach((c, i) => {
    flyCard(
      c,
      'deck',
      tz,
      () => {
        renderAll();
      },
      i * 220,
    );
  });
}
function advance() {
  G.curIdx =
    (G.curIdx + G.direction + G.players.length) % G.players.length;
}
function afterTurn() {
  G.drawnThisTurn = false;
  // If there's a pending stack the current player can't answer, auto-resolve
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
