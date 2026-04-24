// ══════════════════════════════════════════
// HUMAN ACTIONS
// ══════════════════════════════════════════
function humanPlay(idx) {
  if (!G.active) return;
  const pi = mode === 'online' ? myOnlineIndex : G.curIdx;
  const p = G.players[pi];
  if (!p || p.cpu) return;
  const card = p.hand[idx];
  if (!canPlayCard(card)) return;
  G.drawnThisTurn = false;

  p.hand.splice(idx, 1);
  onHandCountChanged(pi);
  playSfx('play');
  burst(card.color);
  flyCard(card, 'bottom', 'discard', () => {
    if (card.type === 'wild' || card.type === 'wild4') {
      G.pendingWild = {
        card,
        whoIdx: pi,
      };
      document.getElementById('color-picker').style.display = 'flex';
    } else applyCard(card, pi);
  });
}

function humanDraw() {
  if (!G.active) return;
  const pi = mode === 'online' ? myOnlineIndex : G.curIdx;
  const p = G.players[pi];
  if (!p || p.cpu) return;

  if (G.stackPending > 0) {
    playSfx('penalty');
    const total = G.stackPending;
    G.stackPending = 0;
    G.stackType = null;
    G.mustStack = false;
    showMsg(`+${total} CARDS!`, 1400);
    giveForceDraw(pi, total);
    setTimeout(
      () => {
        advance();
        afterTurn();
        renderAll();
      },
      total * 220 + 420,
    );
    return;
  }

  if (G.drawnThisTurn) return; // already drew, wait for play or skip
  if (G.deck.length === 0) reshuffleDiscard();
  const c = G.deck.pop();
  if (!c) return;
  playSfx('draw');
  G.drawnThisTurn = true;
  flyCard(c, 'deck', 'bottom', () => {
    p.hand.push(c);
    onHandCountChanged(pi);
    if (canPlayCard(c)) {
      showMsg('PLAY OR PASS', 1100);
      renderAll(); // show play option — skip button will appear for passing
    } else {
      showMsg('NO MATCH — PASS', 1100);
      renderAll();
    }
  });
}

function humanSkip() {
  if (!G.active) return;
  const pi = mode === 'online' ? myOnlineIndex : G.curIdx;
  const p = G.players[pi];
  if (!p || p.cpu) return;
  if (!G.drawnThisTurn) {
    toast('Draw a card first!');
    return;
  }
  G.drawnThisTurn = false;
  playSfx('skip');
  showMsg('PASS', 800);
  advance();
  afterTurn();
}

function callUno() {
  const targetId =
    mode === 'online' ? G.players[myOnlineIndex]?.id : bottomPlayerId();
  const pi = G.players.findIndex((pl) => pl.id === targetId);
  if (!G.active || !G.players[pi] || G.players[pi].hand.length !== 1) {
    toast('You can press UNO only when you have 1 card');
    return;
  }
  G.unoFlags[pi] = true;
  clearUnoTimer(pi);
  document.getElementById('uno-btn').style.display = 'none';
  playSfx('uno');
  showMsg('UNO!', 1200);
  burst('wild');
  if (mode === 'online') pushStateToFirebase();
}

function pickColor(c) {
  G.currentColor = c;
  document.getElementById('color-picker').style.display = 'none';
  if (G.pendingWild) {
    const { card, whoIdx } = G.pendingWild;
    G.pendingWild = null;
    applyCard(card, whoIdx);
  }
}
