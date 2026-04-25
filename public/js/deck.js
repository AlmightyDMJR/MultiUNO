// ══════════════════════════════════════════
// DECK HELPERS
// ══════════════════════════════════════════
function buildDeck() {
  let d = [];
  COLORS.forEach((c) => {
    for (let n = 0; n <= 9; n++) {
      d.push({ color: c, type: 'number', value: n });
      if (n > 0) d.push({ color: c, type: 'number', value: n });
    }
    ACTIONS.forEach((a) => {
      d.push({ color: c, type: a });
      d.push({ color: c, type: a });
    });
  });
  ['wild', 'wild4'].forEach((w) => {
    for (let i = 0; i < 4; i++) d.push({ color: 'wild', type: w });
  });
  return d;
}
function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = 0 | (Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
function sym(c) {
  return c.type === 'number'
    ? c.value
    : c.type === 'skip'
      ? '⊘'
      : c.type === 'reverse'
        ? '⇄'
        : c.type === 'draw2'
          ? '+2'
          : c.type === 'wild'
            ? '★'
            : c.type === 'wild4'
              ? '+4'
              : '?';
}
function canPlayCard(card) {
  const top = G.discardPile[G.discardPile.length - 1];
  // If a stack is pending, player MUST stack the same draw type or accept penalty
  if (G.stackPending > 0) {
    return card.type === G.stackType;
  }
  if (card.color === 'wild') return true;
  if (card.color === G.currentColor) return true;
  if (card.type !== 'number' && top.type === card.type) return true;
  if (
    card.type === 'number' &&
    top.type === 'number' &&
    card.value === top.value
  )
    return true;
  return false;
}
function reshuffleDiscard() {
  const top = G.discardPile.pop();
  G.deck = shuffle(G.discardPile);
  G.discardPile = [top];
}
