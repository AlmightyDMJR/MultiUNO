// ══════════════════════════════════════════
// ONLINE — Room Management
// ══════════════════════════════════════════
let myPlayerId = null,
  myRoomCode = null,
  isHost = false,
  roomRef = null,
  unsubscribes = [];
let _previewCode = '';

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length: 6 },
    () => chars[(Math.random() * chars.length) | 0],
  ).join('');
}

// Called when user navigates to create-screen — generate and display a fresh code
function initPreviewCode() {
  _previewCode = genCode();
  const el = document.getElementById('preview-code');
  if (el) {
    el.textContent = _previewCode;
    el.style.letterSpacing = '14px';
  }
}

// Called when user clicks the code to regenerate
function refreshPreviewCode() {
  _previewCode = genCode();
  const el = document.getElementById('preview-code');
  if (!el) return;
  // Quick flash animation
  el.style.opacity = '0.3';
  el.style.transform = 'scale(0.95)';
  setTimeout(() => {
    el.textContent = _previewCode;
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
  }, 120);
}

async function createRoom() {
  const name = document.getElementById('create-name').value.trim();
  if (!name) {
    document.getElementById('create-err').textContent =
      'Please enter your name';
    return;
  }
  if (!firebaseReady) {
    toast('⚠ Firebase not configured — using local mode instead');
    showScreen('local-screen');
    return;
  }
  document.getElementById('create-err').textContent = '';
  const code = _previewCode || genCode(); // use the displayed code
  myPlayerId = 'p_' + Date.now();
  myRoomCode = code;
  isHost = true;
  const roomData = {
    host: myPlayerId,
    status: 'lobby',
    direction: 1,
    curIdx: 0,
    currentColor: '',
    players: {
      [myPlayerId]: { name, id: myPlayerId, order: 0, ready: true },
    },
    deck: [],
    discardPile: [],
    hands: {},
    chat: {},
  };
  await db.ref(`rooms/${code}`).set(roomData);
  document.getElementById('lobby-code').textContent = code;
  showScreen('lobby-screen');
  listenLobby(code);
}

async function joinRoom() {
  const name = document.getElementById('join-name').value.trim();
  const code = document
    .getElementById('join-code')
    .value.trim()
    .toUpperCase();
  if (!name) {
    document.getElementById('join-err').textContent =
      'Please enter your name';
    return;
  }
  if (code.length < 4) {
    document.getElementById('join-err').textContent =
      'Enter a valid room code';
    return;
  }
  if (!firebaseReady) {
    toast('⚠ Firebase not configured — using local mode instead');
    showScreen('local-screen');
    return;
  }
  document.getElementById('join-err').textContent = '';
  const snap = await db.ref(`rooms/${code}`).get();
  if (!snap.exists()) {
    document.getElementById('join-err').textContent = 'Room not found';
    return;
  }
  const room = snap.val();
  if (room.status !== 'lobby') {
    document.getElementById('join-err').textContent =
      'Game already started';
    return;
  }
  const players = room.players || {};
  if (Object.keys(players).length >= 7) {
    document.getElementById('join-err').textContent =
      'Room is full (7 players max)';
    return;
  }
  myPlayerId = 'p_' + Date.now();
  myRoomCode = code;
  isHost = false;
  const order = Object.keys(players).length;
  await db
    .ref(`rooms/${code}/players/${myPlayerId}`)
    .set({ name, id: myPlayerId, order, ready: true });
  document.getElementById('lobby-code').textContent = code;
  showScreen('lobby-screen');
  listenLobby(code);
}

function copyCode() {
  const code = document.getElementById('lobby-code').textContent;
  navigator.clipboard
    .writeText(code)
    .then(() => toast('Room code copied: ' + code));
}

function listenLobby(code) {
  const ref = db.ref(`rooms/${code}`);
  const off = ref.on('value', (snap) => {
    if (!snap.exists()) return;
    const room = snap.val();
    const players = Object.values(room.players || {}).sort(
      (a, b) => a.order - b.order,
    );
    // Render lobby list
    const list = document.getElementById('lobby-list');
    list.innerHTML = '';
    players.forEach((p) => {
      const div = document.createElement('div');
      div.className = 'lobby-player';
      div.innerHTML = `<div class="lp-dot ${p.id === room.host ? 'host' : ''}"></div>
        <div class="lp-name">${escH(p.name)}</div>
        <div class="lp-badge">${p.id === room.host ? 'Host' : 'Player'}</div>`;
      list.appendChild(div);
    });
    const n = players.length;
    document.getElementById('lobby-status').textContent =
      n < 2
        ? 'Need at least 2 players…'
        : `${n} player${n > 1 ? 's' : ''} joined${n >= 2 ? ' — ready to start!' : ''}`;
    document.getElementById('start-online-btn').style.display =
      isHost && n >= 2 ? 'block' : 'none';
    // Game started by host
    if (room.status === 'playing') {
      ref.off('value', off);
      enterOnlineGame(room);
    }
  });
  unsubscribes.push(() => ref.off('value', off));
}

async function startOnlineGame() {
  const snap = await db.ref(`rooms/${myRoomCode}/players`).get();
  const players = Object.values(snap.val()).sort(
    (a, b) => a.order - b.order,
  );
  const gameState = initGameState(
    players.map((p) => ({ name: p.name, cpu: false, id: p.id })),
  );
  gameState.status = 'playing';
  // Push full state including shuffled hands
  await db.ref(`rooms/${myRoomCode}`).update({
    status: 'playing',
    deck: gameState.deck,
    discardPile: gameState.discardPile,
    hands: gameState.hands,
    direction: gameState.direction,
    curIdx: gameState.curIdx,
    currentColor: gameState.currentColor,
    stackPending: 0,
    stackType: null,
    mustStack: false,
    drawnThisTurn: false,
    unoFlags: players.map(() => false),
  });
}

function enterOnlineGame(room) {
  // Set up game from room state, listen for changes
  const orderedPlayers = Object.values(room.players || {}).sort(
    (a, b) => a.order - b.order,
  );
  const myIndex = orderedPlayers.findIndex((p) => p.id === myPlayerId);
  initOnlineListeners(room, orderedPlayers, myIndex);
}

function initOnlineListeners(room, orderedPlayers, myIndex) {
  myOnlineIndex = myIndex;
  mode = 'online';
  // Build local G from room snapshot
  applyRoomToG(room, orderedPlayers);
  showGameScreen();
  renderAll();
  // Listen for game state changes
  const ref = db.ref(`rooms/${myRoomCode}`);
  const off = ref.on('value', (snap) => {
    if (!snap.exists()) return;
    const r = snap.val();
    applyRoomToG(r, orderedPlayers);
    renderAll();
    const isMyTurn = G.curIdx === myIndex && !G.players[myIndex].cpu;
    document.getElementById('wait-overlay').style.display = 'none';
    if (G.active && !isMyTurn && G.players[G.curIdx].cpu && isHost) {
      setTimeout(aiTurn, 900);
    }
  });
  unsubscribes.push(() => ref.off('value', off));
}

function leaveRoom() {
  if (myRoomCode && myPlayerId && db) {
    db.ref(`rooms/${myRoomCode}/players/${myPlayerId}`).remove();
    if (isHost) db.ref(`rooms/${myRoomCode}`).remove();
  }
  unsubscribes.forEach((fn) => fn());
  unsubscribes = [];
  myRoomCode = null;
  myPlayerId = null;
  isHost = false;
  showScreen('home-screen');
}
