import type { Metadata } from "next";

// Polices servies depuis notre propre domaine via Fontsource, et non par un
// <link> vers Google Fonts. Une feuille externe bloque le premier rendu, et
// celle de Google impose deux allers-retours réseau avant le premier pixel :
// résolution DNS + TLS pour googleapis.com, téléchargement du CSS, puis
// découverte des fichiers sur gstatic.com et nouvelle connexion.
//
// next/font/google ferait la même chose à la compilation, mais Turbopack ne
// résout pas ses URLs en dev ("@vercel/turbopack-next/internal/font/google").
// Fontsource contourne le problème : ce sont de simples imports npm, donc les
// fichiers sont traités comme n'importe quel asset du projet.
//
// Les familles correspondantes sont déclarées dans globals.css
// (--font-heading / --font-body).
import "@fontsource-variable/dm-sans";
import "@fontsource/baloo-2/400.css";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Niwa Food",
  description: "Fast-food fait maison burger, pizza, tacos à Kouba et Chéraga",
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
