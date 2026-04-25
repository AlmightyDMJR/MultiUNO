import './globals.css';

export const metadata = {
  title: 'Multi UNO Online',
  description: 'UNO cinematic edition built with Next.js + React',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800;900&display=swap"
        />

        <link rel="stylesheet" href="/css/base.css" />
        <link rel="stylesheet" href="/css/screens.css" />
        <link rel="stylesheet" href="/css/game-layout.css" />
        <link rel="stylesheet" href="/css/cards.css" />
        <link rel="stylesheet" href="/css/hud.css" />
        <link rel="stylesheet" href="/css/players.css" />
        <link rel="stylesheet" href="/css/components.css" />
        <link rel="stylesheet" href="/css/overlays.css" />
      </head>
      <body className="min-h-screen bg-slate-950 text-white">{children}</body>
    </html>
  );
}
