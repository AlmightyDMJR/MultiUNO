// ══════════════════════════════════════════
// SOUND EFFECTS — Simple synth SFX (no external files)
// ══════════════════════════════════════════
let sfxCtx = null;
function ensureSfx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!sfxCtx) sfxCtx = new AC();
  if (sfxCtx.state === 'suspended') sfxCtx.resume();
  return sfxCtx;
}
function tone(ctx, freq, start, dur, type = 'sine', gain = 0.04) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}
function playSfx(kind) {
  const ctx = ensureSfx();
  if (!ctx) return;
  const t = ctx.currentTime + 0.01;
  if (kind === 'draw') {
    tone(ctx, 320, t, 0.08, 'triangle', 0.03);
    return;
  }
  if (kind === 'play') {
    tone(ctx, 420, t, 0.07, 'square', 0.04);
    tone(ctx, 610, t + 0.07, 0.08, 'square', 0.032);
    return;
  }
  if (kind === 'skip') {
    tone(ctx, 260, t, 0.07, 'sawtooth', 0.035);
    tone(ctx, 220, t + 0.06, 0.07, 'sawtooth', 0.03);
    return;
  }
  if (kind === 'stack') {
    tone(ctx, 180, t, 0.08, 'triangle', 0.05);
    tone(ctx, 150, t + 0.08, 0.1, 'triangle', 0.04);
    return;
  }
  if (kind === 'uno') {
    tone(ctx, 520, t, 0.08, 'triangle', 0.05);
    tone(ctx, 650, t + 0.08, 0.08, 'triangle', 0.045);
    tone(ctx, 780, t + 0.16, 0.1, 'triangle', 0.04);
    return;
  }
  if (kind === 'penalty') {
    tone(ctx, 140, t, 0.12, 'sawtooth', 0.06);
    tone(ctx, 120, t + 0.1, 0.14, 'sawtooth', 0.05);
    return;
  }
  if (kind === 'win') {
    tone(ctx, 520, t, 0.1, 'triangle', 0.05);
    tone(ctx, 660, t + 0.1, 0.1, 'triangle', 0.05);
    tone(ctx, 820, t + 0.2, 0.16, 'triangle', 0.045);
  }
}
