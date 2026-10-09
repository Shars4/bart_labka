'use client';

import './globals.css';

/** Last resort when the root layout itself fails; renders its own <html>. */
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="sk">
      <body className="flex min-h-dvh items-center bg-background text-foreground">
        <main className="page-container py-20">
          <h1 className="text-4xl">Aplikácia sa nepodarila načítať</h1>
          <p className="mt-4 text-lg">
            Na serveri nastala neočakávaná chyba. Skúste to znova o chvíľu.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-8 h-11 rounded-full bg-tennis px-5 font-semibold"
          >
            Skúsiť znova
          </button>
        </main>
      </body>
    </html>
  );
}
