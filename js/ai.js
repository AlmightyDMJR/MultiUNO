// ══════════════════════════════════════════
// AI
// ══════════════════════════════════════════
function aiTurn() {
  if (!G.active) return;
  const p = G.players[G.curIdx];
  if (!p.cpu) return;
  const oz = document.getElementById(`oz-${p.id}`);
  if (oz) oz.style.opacity = '.55';
  setTimeout(
    () => {
      if (oz) oz.style.opacity = '1';
      if (!G.active) return;

      // If forced to take stack penalty and can't stack, draw and pass
      if (G.mustStack) {
        const canStackCard = p.hand.find((c) => canPlayCard(c));
        if (!canStackCard) {
          const total = G.stackPending || 0;
          G.stackPending = 0;
          G.stackType = null;
          G.mustStack = false;
          playSfx('penalty');
          showMsg(`+${total} CARDS!`, 1400);
          giveForceDraw(G.curIdx, total);
          setTimeout(
            () => {
              advance();
              afterTurn();
            },
            total * 220 + 420,
          );
          return;
        }
      }

      const order = [
        'wild4',
        'draw2',
        'skip',
        'reverse',
        'wild',
        'number',
      ];
      let best = -1;
      for (const t of order) {
        const fi = p.hand.findIndex(
          (c) =>
            canPlayCard(c) &&
            (t === 'number' ? c.type === 'number' : c.type === t),
        );
        if (fi !== -1) {
          best = fi;
          break;
        }
      }
      if (best === -1) {
        // Draw one card and end turn
        if (G.deck.length === 0) reshuffleDiscard();
        const drawn = G.deck.pop();
        if (!drawn) return;
        playSfx('draw');
        const bid = bottomPlayerId();
        const tz = p.id === bid ? 'bottom' : `opp-${p.id}`;
        flyCard(drawn, 'deck', tz, () => {
          p.hand.push(drawn);
          onHandCountChanged(G.curIdx);
          if (canPlayCard(drawn)) {
            // AI plays the drawn card
            setTimeout(() => {
              const i2 = p.hand.lastIndexOf(drawn);
              if (i2 !== -1) {
                p.hand.splice(i2, 1);
                onHandCountChanged(G.curIdx);
                playSfx('play');
                burst(drawn.color);
                if (drawn.type === 'wild' || drawn.type === 'wild4')
                  G.currentColor = aiPickColor(p);
                flyCard(drawn, tz, 'discard', () =>
                  applyCard(drawn, G.curIdx),
                );
              }
              renderAll();
            }, 620);
          } else {
            // Can't play drawn card — end turn
            renderAll();
            setTimeout(() => {
              advance();
              afterTurn();
            }, 520);
          }
        });
        return;
      }
      const card = p.hand.splice(best, 1)[0];
      onHandCountChanged(G.curIdx);
      if (card.type === 'wild4') {
        G.mustStack = false; // will be re-evaluated in applyCard
      }
      playSfx('play');
      burst(card.color);
      if (card.type === 'wild' || card.type === 'wild4')
        G.currentColor = aiPickColor(p);
      const bid = bottomPlayerId();
      const fz = p.id === bid ? 'bottom' : `opp-${p.id}`;
      flyCard(card, fz, 'discard', () => applyCard(card, G.curIdx));
      renderAll();
    },
    700 + Math.random() * 480,
  );
}
function aiPickColor(p) {
  const cnt = { red: 0, blue: 0, green: 0, yellow: 0 };
  p.hand.forEach((c) => {
    if (c.color !== 'wild') cnt[c.color]++;
  });
  return (
    Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    COLORS[(Math.random() * 4) | 0]
  );
}
