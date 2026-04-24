// ══════════════════════════════════════════
// FIREBASE CONFIG
// Replace these values with your own Firebase project credentials.
// Free plan (Spark) is enough. Steps:
// 1. Go to https://console.firebase.google.com
// 2. Create project → Realtime Database → Start in test mode
// 3. Copy your config below
// ══════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAtrWD-xMwAV8zC1GkPVEE3-2pj5BXtXdg',
  authDomain: 'multiuno-4c346.firebaseapp.com',
  databaseURL: 'https://multiuno-4c346-default-rtdb.firebaseio.com',
  projectId: 'multiuno-4c346',
  storageBucket: 'multiuno-4c346.firebasestorage.app',
  messagingSenderId: '1059748989565',
  appId: '1:1059748989565:web:18e71cab287139f7a0bf14',
  measurementId: 'G-M4K61GBJ3G',
};

// ── Try to init Firebase; if config is placeholder, fall back to local-only mode
let db = null,
  firebaseReady = false;
try {
  if (!FIREBASE_CONFIG.apiKey.includes('DEMO')) {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    firebaseReady = true;
  }
} catch (e) {
  console.warn('Firebase init failed:', e);
}
