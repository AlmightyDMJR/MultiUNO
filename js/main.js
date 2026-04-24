// ══════════════════════════════════════════
// MAIN — Entry Point, Game Flow, Win, Keyboard
// ══════════════════════════════════════════

// ── Helpers ──
function escH(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Show Game Screen ──
function showGameScreen() {
  SCREENS.forEach((s) => document.getElementById(s).classList.add('out'));
  document.getElementById('game-screen').style.display = 'block';
  document.getElementById('end-overlay').style.display = 'none';
  document.getElementById('wait-overlay').style.display = 'none';
  _lastBottomId = null; // force rebuild of opponent zones
  buildOppZones();
  buildScoresPanel();
  createStars();
  resizePcv();
}

// ── Kick Off (local) ──
const multiHuman = () => G.players.filter((p) => !p.cpu).length > 1;
let passCb = null;
function kickOff() {
  if (!G.active) return;
  const p = G.players[G.curIdx];
  if (p.cpu) {
    setTimeout(aiTurn, 1000);
  } else if (mode === 'local' && multiHuman()) {
    showPassScreen();
  }
}
function showPassScreen(cb) {
  passCb = cb || null;
  const p = G.players[G.curIdx];
  document.getElementById('pass-title').textContent =
    `PASS TO ${p.name.toUpperCase()}`;
  document.getElementById('pass-sub').textContent =
    `It's ${p.name}'s turn. Hand the device over and tap Ready.`;
  SCREENS.forEach((s) => document.getElementById(s).classList.add('out'));
  showScreen('pass-screen');
}
function passReady() {
  showScreen('home-screen'); // hide pass screen
  SCREENS.forEach((s) => document.getElementById(s).classList.add('out'));
  document.getElementById('game-screen').style.display = 'block';
  if (passCb) {
    passCb();
    passCb = null;
  } else {
    renderAll();
    if (G.players[G.curIdx].cpu) setTimeout(aiTurn, 600);
  }
}

// ── Start Local Game ──
function startLocalGame() {
  if (localSetup.filter((p) => !p.cpu).length < 1) {
    toast('Need at least one human player!');
    return;
  }
  clearAllUnoTimers();
  mode = 'local';
  const state = initGameState(localSetup);
  G = {
    players: state.players,
    deck: state.deck,
    discardPile: state.discardPile,
    currentColor: state.currentColor,
    direction: state.direction,
    curIdx: state.curIdx,
    active: true,
    pendingWild: null,
    unoFlags: state.players.map(() => false),
    stackPending: 0,
    stackType: null,
    mustStack: false,
    drawnThisTurn: false,
    unoTimers: {},
  };
  showGameScreen();
  renderAll();
  showMsg('GAME ON!', 1100);
  kickOff();
}

// ── Win ──
function checkWin(whoIdx) {
  const p = G.players[whoIdx];
  if (p && p.hand.length === 0) {
    G.active = false;
    renderAll();
    setTimeout(() => triggerWin(p), 500);
    return true;
  }
  return false;
}
function triggerWin(p) {
  clearAllUnoTimers();
  playSfx('win');
  document.getElementById('end-title').textContent =
    `${p.name.toUpperCase()} WINS!`;
  document.getElementById('end-sub').textContent = p.cpu
    ? 'The CPU robot reigns supreme…'
    : 'Incredible — UNO champion! 🏆';
  // Build scorecard: winner first, then rest sorted by cards remaining
  const sorted = [...G.players].sort((a, b) => {
    if (a.id === p.id) return -1;
    if (b.id === p.id) return 1;
    return a.hand.length - b.hand.length;
  });
  const sc = document.getElementById('scorecard');
  sc.innerHTML = '';
  sorted.forEach((pl, i) => {
    const isWinner = pl.id === p.id;
    const row = document.createElement('div');
    row.className = 'sc-row' + (isWinner ? ' winner' : '');
    row.innerHTML = `
          <div class="sc-rank">${i + 1}</div>
          <div class="sc-name">${escH(pl.name)}${pl.cpu ? ' 🤖' : ''}</div>
          <div class="sc-cards-left">${isWinner ? '0 cards' : `${pl.hand.length} card${pl.hand.length !== 1 ? 's' : ''} left`}</div>
          <div class="sc-trophy">${isWinner ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}</div>`;
    sc.appendChild(row);
  });
  document.getElementById('end-overlay').style.display = 'flex';
  if (mode === 'online') pushStateToFirebase();
}
function playAgain() {
  document.getElementById('end-overlay').style.display = 'none';
  clearAllUnoTimers();
  if (mode === 'local') {
    startLocalGame();
  } else {
    if (isHost) startOnlineGame();
    else toast('Waiting for host to restart…');
  }
}
function backToHome() {
  document.getElementById('end-overlay').style.display = 'none';
  document.getElementById('game-screen').style.display = 'none';
  clearAllUnoTimers();
  G = {};
  if (mode === 'online') leaveRoom();
  else showScreen('home-screen');
}

// ── Init ──
showScreen('home-screen');

// ── Keyboard ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'd' || e.key === 'D') humanDraw();
  if (e.key === 'u' || e.key === 'U') callUno();
  if (e.key === 's' || e.key === 'S') humanSkip();
});

document.addEventListener(
  'pointerdown',
  () => {
    ensureSfx();
  },
  { once: true },
);
