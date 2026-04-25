import Script from 'next/script';
import { legacyMarkup } from '../lib/legacyMarkup';

const runtimeFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'DEMO_API_KEY',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    'demo-project.firebaseapp.com',
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    'https://demo-project-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    'demo-project.appspot.com',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    '1:000000000000:web:0000000000000000000000',
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-0000000000',
};

const runtimeConfigScript = `window.__FIREBASE_CONFIG__ = ${JSON.stringify(
  runtimeFirebaseConfig,
).replace(/</g, '\\u003c')};`;

export default function HomePage() {
  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-slate-950">
        <div dangerouslySetInnerHTML={{ __html: legacyMarkup }} />
      </main>

      <Script id="firebase-runtime-config" strategy="beforeInteractive">
        {runtimeConfigScript}
      </Script>
      <Script
        src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"
        strategy="beforeInteractive"
      />

      <Script src="/js/firebase-config.js" strategy="afterInteractive" />
      <Script src="/js/constants.js" strategy="afterInteractive" />
      <Script src="/js/sfx.js" strategy="afterInteractive" />
      <Script src="/js/state.js" strategy="afterInteractive" />
      <Script src="/js/deck.js" strategy="afterInteractive" />
      <Script src="/js/ui-cards.js" strategy="afterInteractive" />
      <Script src="/js/animations.js" strategy="afterInteractive" />
      <Script src="/js/ui-screens.js" strategy="afterInteractive" />
      <Script src="/js/ui-render.js" strategy="afterInteractive" />
      <Script src="/js/game-logic.js" strategy="afterInteractive" />
      <Script src="/js/online.js" strategy="afterInteractive" />
      <Script src="/js/player-actions.js" strategy="afterInteractive" />
      <Script src="/js/ai.js" strategy="afterInteractive" />
      <Script src="/js/main.js" strategy="afterInteractive" />
    </>
  );
}
