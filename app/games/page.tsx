'use client'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const games = [
  {
    href: '/games/aviator',
    icon: '✈️',
    name: 'Aviator',
    desc: 'L\'aereo decolla e il moltiplicatore sale. Incassa prima che crolli.',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.2)',
    tag: 'HIGH RISK',
    tagColor: '#ef4444',
  },
  {
    href: '/games/slots',
    icon: '🎰',
    name: 'Slot Machine',
    desc: 'Fai girare i rulli. Tre simboli uguali = jackpot istantaneo.',
    color: '#f5c842',
    glow: 'rgba(245,200,66,0.2)',
    tag: 'CLASSIC',
    tagColor: '#f5c842',
  },
  {
    href: '/games/blackjack',
    icon: '🃏',
    name: 'Blackjack',
    desc: 'Arriva a 21 senza sforarlo. Batti il banco con strategia.',
    color: '#00ff88',
    glow: 'rgba(0,255,136,0.15)',
    tag: 'STRATEGIA',
    tagColor: '#00ff88',
  },
  {
    href: '/games/coinflip',
    icon: '🪙',
    name: 'Coinflip',
    desc: 'Testa o croce. 50% di vincere il doppio della puntata.',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.2)',
    tag: '50/50',
    tagColor: '#8b5cf6',
  },
  {
    href: '/crates',
    icon: '📦',
    name: 'Crate Opening',
    desc: 'Apri casse per ottenere skin, badge e oggetti rari da collezione.',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.2)',
    tag: 'COLLEZIONE',
    tagColor: '#f97316',
  },
]

export default function GamesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
            Giochi
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Scegli il tuo gioco preferito e usa i FitPoints guadagnati in palestra
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {games.map(g => (
            <Link key={g.href} href={g.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--surface)',
                border: `1px solid var(--border)`,
                borderRadius: '16px',
                padding: '1.8rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-6px)'
                  el.style.borderColor = g.color + '55'
                  el.style.boxShadow = `0 16px 40px ${g.glow}`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'none'
                  el.style.borderColor = 'var(--border)'
                  el.style.boxShadow = 'none'
                }}
              >
                {/* Shine */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%)',
                  borderRadius: 'inherit', pointerEvents: 'none',
                }} />

                {/* Tag */}
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em',
                  color: g.tagColor, opacity: 0.8,
                  background: g.tagColor + '15',
                  borderRadius: '4px', padding: '0.2rem 0.5rem',
                }}>{g.tag}</div>

                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{g.icon}</div>
                <h2 style={{ fontWeight: 800, color: g.color, marginBottom: '0.5rem', fontSize: '1.15rem' }}>{g.name}</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.2rem' }}>{g.desc}</p>
                <div style={{
                  color: g.color, fontSize: '0.85rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                  Gioca ora <span style={{ fontSize: '0.9rem' }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
