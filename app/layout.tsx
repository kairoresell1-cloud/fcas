import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FitCasino — Allenati. Guadagna. Gioca.",
  description: "Trasforma ogni allenamento in FitPoints. Usali su Aviator, Blackjack, Slot e Crate.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
