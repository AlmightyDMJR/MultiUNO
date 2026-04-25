// ══════════════════════════════════════════
// FIREBASE CONFIG
// Config is injected by Next.js at runtime via window.__FIREBASE_CONFIG__.
// If values are missing or demo placeholders are used, app falls back to local mode.
// ══════════════════════════════════════════
const FIREBASE_CONFIG = window.__FIREBASE_CONFIG__ || {};

// ── Try to init Firebase; if config is placeholder, fall back to local-only mode
let db = null,
  firebaseReady = false;
try {
  const hasConfig =
    FIREBASE_CONFIG &&
    typeof FIREBASE_CONFIG.apiKey === 'string' &&
    typeof FIREBASE_CONFIG.databaseURL === 'string';
  if (hasConfig && !FIREBASE_CONFIG.apiKey.includes('DEMO')) {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    firebaseReady = true;
  }
} catch (e) {
  console.warn('Firebase init failed:', e);
}
