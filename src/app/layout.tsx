import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "./providers";

// Polices chargées par <link> plutôt que par next/font/google : Turbopack
// n'arrive pas à résoudre les URLs gstatic générées par next/font en dev
// (erreur "@vercel/turbopack-next/internal/font/google/font"). Le <link> est
// la méthode standard du web, sans dépendance ni résolution de module — le
// navigateur télécharge la feuille de style, et `display=swap` affiche
// immédiatement une police système en attendant.
// Les familles correspondantes sont déclarées dans globals.css
// (--font-heading / --font-body).
export const metadata: Metadata = {
  title: "Niwa Food",
  description: "Fast-food fait maison à Kouba et Chéraga",
};

const themeInitScript = `
(function() {
  try {
    const stored = localStorage.getItem("theme");
    const mode = stored || "system";
    const isDark = mode === "dark" ||
      (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  } catch {
    // localStorage indisponible (navigation privée stricte, cookies bloqués...)
    // → on ignore, la page reste simplement en mode clair par défaut
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      // overflow-x-clip (pas overflow-x-hidden) : "hidden" force silencieusement
      // overflow-y à "auto" quand overflow-y n'est pas précisé (règle CSS peu
      // connue) — html/body deviennent alors des conteneurs de scroll, ce qui
      // casse position:sticky pour la sidebar et la topbar.
      className="h-full antialiased overflow-x-clip"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col overflow-x-clip">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
