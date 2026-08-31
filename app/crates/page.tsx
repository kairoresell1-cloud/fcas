'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { CRATE_COSTS } from '@/lib/points'

const CRATE_INFO = {
  basic: { label: 'Cassa Base', icon: '📦', color: '#aaa', desc: 'Oggetti comuni e rari' },
  rare: { label: 'Cassa Rara', icon: '💎', color: 'var(--blue)', desc: 'Più chance di epici' },
  epic: { label: 'Cassa Epica', icon: '🔮', color: 'var(--purple)', desc: 'Epici e leggendari' },
  legendary: { label: 'Cassa Leggendaria', icon: '👑', color: 'var(--gold)', desc: 'Solo il meglio' },
}

const RARITY_COLORS: Record<string, string> = {
  common: '#aaa', rare: 'var(--blue)', epic: 'var(--purple)', legendary: 'var(--gold)'
}

export default function CratesPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const [item, setItem] = useState<{ name: string; rarity: string; category: string } | null>(null)
  const [error, setError] = useState('')
  const [animation, setAnimation] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
  }, [])

  async function openCrate(tier: string) {
    setOpening(tier); setItem(null); setError(''); setAnimation(false)
    const res = await fetch('/api/crate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setOpening(null); return }
    setBalance(b => b !== null ? b - CRATE_COSTS[tier as keyof typeof CRATE_COSTS] : b)
    setTimeout(() => { setItem(data.item); setAnimation(true); setOpening(null) }, 1500)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>📦 Apertura Casse</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
          Saldo: <strong style={{ color: 'var(--neon)' }}>{balance?.toLocaleString()} FP</strong>
        </p>

        {error && (
          <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid var(--red)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem', color: 'var(--red)' }}>
            {error}
          </div>
        )}

        {/* Item revealed */}
        {item && animation && (
          <div className="fly-up" style={{
            textAlign: 'center', padding: '2rem', borderRadius: '12px', marginBottom: '2rem',
            background: 'var(--surface2)', border: `2px solid ${RARITY_COLORS[item.rarity]}`,
            boxShadow: `0 0 30px ${RARITY_COLORS[item.rarity]}40`,
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
              {item.category === 'badge' ? '🏅' : item.category === 'skin' ? '✨' : '👤'}
            </div>
            <div className={`rarity-${item.rarity}`} style={{ fontWeight: 900, fontSize: '1.4rem', marginBottom: '0.3rem' }}>
              {item.name}
            </div>
            <div style={{ color: RARITY_COLORS[item.rarity], fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
              {item.rarity} · {item.category}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.2rem' }}>
          {Object.entries(CRATE_INFO).map(([tier, info]) => {
            const cost = CRATE_COSTS[tier as keyof typeof CRATE_COSTS]
            const canAfford = balance !== null && balance >= cost
            const isOpening = opening === tier
            return (
              <div key={tier} className="card" style={{ textAlign: 'center', border: `1px solid ${canAfford ? info.color + '44' : 'var(--border)'}`, transition: 'all 0.2s' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.8rem', filter: isOpening ? 'blur(2px)' : 'none', transition: 'filter 0.3s' }}>
                  {isOpening ? '🎲' : info.icon}
                </div>
                <div style={{ fontWeight: 700, color: info.color, marginBottom: '0.3rem' }}>{info.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>{info.desc}</div>
                <div style={{ fontWeight: 800, color: info.color, fontSize: '1.1rem', marginBottom: '0.8rem' }}>{cost} FP</div>
                <button
                  onClick={() => openCrate(tier)}
                  disabled={!canAfford || !!opening}
                  style={{
                    width: '100%', padding: '0.6rem', borderRadius: '8px', border: 'none',
                    background: canAfford ? info.color : 'var(--surface2)',
                    color: canAfford ? (tier === 'basic' ? '#333' : '#fff') : 'var(--text-dim)',
                    fontWeight: 700, cursor: canAfford && !opening ? 'pointer' : 'not-allowed',
                    opacity: !canAfford ? 0.5 : 1, transition: 'all 0.2s'
                  }}>
                  {isOpening ? 'Apertura...' : !canAfford ? 'FP insufficienti' : 'Apri'}
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
