// ══════════════════════════════════════════
// GAME STATE — G
// ══════════════════════════════════════════
let G = {}; // global game state
let mode = 'local'; // 'local' | 'online'
let myOnlineIndex = 0; // index in players[] for online mode

function initGameState(playerDefs) {
  const dk = shuffle(buildDeck());
  const hands = {};
  playerDefs.forEach((p) => (hands[p.id || p.name] = []));
  const playerObjs = playerDefs.map((p, i) => ({
    name: p.name,
    cpu: !!p.cpu,
    id: p.id || p.name,
    hand: [],
  }));
  for (let i = 0; i < 7; i++)
    playerObjs.forEach((p) => p.hand.push(dk.pop()));
  let first;
  do {
    first = dk.pop();
  } while (first.type === 'wild' || first.type === 'wild4');
  // build hands map for firebase
  const handsMap = {};
  playerObjs.forEach((p) => (handsMap[p.id] = p.hand));
  return {
    players: playerObjs,
    deck: dk,
    discardPile: [first],
    currentColor: first.color,
    direction: 1,
    curIdx: 0,
    hands: handsMap,
  };
}

function applyRoomToG(room, orderedPlayers) {
  const hands = room.hands || {};
  G.players = orderedPlayers.map((p, i) => ({
    name: p.name,
    cpu: !!p.cpu,
    id: p.id,
    hand: hands[p.id] || [],
  }));
  G.deck = room.deck || [];
  G.discardPile = room.discardPile || [];
  G.currentColor = room.currentColor || 'red';
  G.direction = room.direction || 1;
  G.curIdx = room.curIdx || 0;
  G.stackPending = room.stackPending || 0;
  G.stackType = room.stackType || null;
  G.mustStack = !!room.mustStack;
  G.drawnThisTurn = !!room.drawnThisTurn;
  G.pendingWild = G.pendingWild || null;
  G.unoFlags =
    Array.isArray(room.unoFlags) &&
    room.unoFlags.length === orderedPlayers.length
      ? room.unoFlags
      : orderedPlayers.map(() => false);
  G.unoTimers = G.unoTimers || {};

  // Detect game-over from status
  const wasActive = G.active;
  G.active = room.status === 'playing';

  // If the game just ended (status changed to 'ended'), trigger the win overlay
  if (wasActive && !G.active && room.status === 'ended') {
    const winner = G.players.find((p) => p.hand.length === 0);
    if (winner) {
      setTimeout(() => triggerWin(winner), 400);
    }
  }
}

async function pushStateToFirebase() {
  if (!db || !myRoomCode) return;
  const handsMap = {};
  G.players.forEach((p) => (handsMap[p.id] = p.hand));
  await db.ref(`rooms/${myRoomCode}`).update({
    deck: G.deck,
    discardPile: G.discardPile,
    hands: handsMap,
    direction: G.direction,
    curIdx: G.curIdx,
    currentColor: G.currentColor,
    stackPending: G.stackPending || 0,
    stackType: G.stackType || null,
    mustStack: !!G.mustStack,
    drawnThisTurn: !!G.drawnThisTurn,
    unoFlags: G.unoFlags || [],
    status: G.active ? 'playing' : 'ended',
  });
}
