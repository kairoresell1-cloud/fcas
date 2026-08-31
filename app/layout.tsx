import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitCasino — Allenati. Guadagna. Gioca.',
  description: 'Trasforma i tuoi allenamenti in FitPoints e usali per giocare.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
