'use client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const games = [
  { href: '/games/slots', icon: '🎰', name: 'Slot Machine', desc: 'Fai girare i rulli. Tre simboli uguali = jackpot.', color: 'var(--gold)' },
  { href: '/games/aviator', icon: '✈️', name: 'Aviator', desc: 'L\'aereo decolla. Incassa prima che crolli.', color: 'var(--blue)' },
  { href: '/games/blackjack', icon: '🃏', name: 'Blackjack', desc: 'Arriva a 21 senza sforarlo. Batti il banco.', color: 'var(--neon)' },
  { href: '/games/coinflip', icon: '🪙', name: 'Coinflip', desc: 'Testa o croce. 50% di vincere il doppio.', color: 'var(--purple)' },
  { href: '/crates', icon: '📦', name: 'Crate Opening', desc: 'Apri casse per ottenere skin e oggetti rari.', color: '#ff6b6b' },
]

export default function GamesPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>🎮 Giochi</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>Scegli un gioco e usa i tuoi FitPoints</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {games.map(g => (
            <Link key={g.href} href={g.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', borderColor: 'var(--border)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = g.color; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>{g.icon}</div>
                <h2 style={{ fontWeight: 700, color: g.color, marginBottom: '0.5rem' }}>{g.name}</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>{g.desc}</p>
                <div style={{ marginTop: '1.2rem', color: g.color, fontSize: '0.85rem', fontWeight: 600 }}>
                  Gioca ora →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
