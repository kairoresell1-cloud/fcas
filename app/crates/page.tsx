'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { CRATE_COSTS } from '@/lib/points'

const CRATE_INFO = {
  basic: {
    label: 'Base',
    subtitle: 'Starter Crate',
    icon: '📦',
    color: '#9ca3af',
    glow: 'rgba(156,163,175,0.3)',
    grad: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
    desc: 'Comuni e qualche raro',
    chances: ['Common 70%', 'Rare 25%', 'Epic 5%'],
  },
  rare: {
    label: 'Rara',
    subtitle: 'Rare Crate',
    icon: '💎',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.35)',
    grad: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
    desc: 'Più chance epici',
    chances: ['Common 40%', 'Rare 45%', 'Epic 15%'],
  },
  epic: {
    label: 'Epica',
    subtitle: 'Epic Crate',
    icon: '🔮',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.4)',
    grad: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)',
    desc: 'Epici e leggendari',
    chances: ['Rare 40%', 'Epic 45%', 'Legendary 15%'],
  },
  legendary: {
    label: 'Leggendaria',
    subtitle: 'Legendary Crate',
    icon: '👑',
    color: '#f5c842',
    glow: 'rgba(245,200,66,0.4)',
    grad: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
    desc: 'Solo il meglio assoluto',
    chances: ['Epic 50%', 'Legendary 50%'],
  },
}

const RARITY_CONFIG: Record<string, { color: string; glow: string; label: string }> = {
  common:    { color: '#9ca3af', glow: 'rgba(156,163,175,0.3)', label: 'COMUNE' },
  rare:      { color: '#3b82f6', glow: 'rgba(59,130,246,0.5)', label: 'RARO' },
  epic:      { color: '#8b5cf6', glow: 'rgba(139,92,246,0.6)', label: 'EPICO' },
  legendary: { color: '#f5c842', glow: 'rgba(245,200,66,0.7)', label: 'LEGGENDARIO' },
}

type AnimPhase = 'idle' | 'shaking' | 'exploding' | 'revealing'

export default function CratesPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle')
  const [item, setItem] = useState<{ name: string; rarity: string; category: string } | null>(null)
  const [pendingItem, setPendingItem] = useState<{ name: string; rarity: string; category: string } | null>(null)
  const [error, setError] = useState('')
  const [particles, setParticles] = useState<{ id: number; angle: number; dist: number; color: string; size: number }[]>([])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
  }, [])

  async function openCrate(tier: string) {
    if (opening || animPhase !== 'idle') return
    setOpening(tier)
    setItem(null)
    setError('')
    setAnimPhase('shaking')

    const res = await fetch('/api/crate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setOpening(null); setAnimPhase('idle'); return }
    setBalance(b => b !== null ? b - CRATE_COSTS[tier as keyof typeof CRATE_COSTS] : b)
    setPendingItem(data.item)

    // Shake → Explode → Reveal
    setTimeout(() => setAnimPhase('exploding'), 1200)
    setTimeout(() => {
      const info = CRATE_INFO[tier as keyof typeof CRATE_INFO]
      const rarityC = RARITY_CONFIG[data.item.rarity]
      const newParticles = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        angle: (i / 24) * 360,
        dist: 60 + Math.random() * 80,
        color: i % 3 === 0 ? rarityC.color : i % 3 === 1 ? info.color : '#fff',
        size: 4 + Math.random() * 8,
      }))
      setParticles(newParticles)
      setTimeout(() => setParticles([]), 1000)
    }, 1600)
    setTimeout(() => {
      setItem(data.item)
      setAnimPhase('revealing')
    }, 1800)
    setTimeout(() => { setAnimPhase('idle'); setOpening(null) }, 3200)
  }

  const catIcon = (cat: string) => cat === 'badge' ? '🏅' : cat === 'skin' ? '✨' : '👤'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.3rem' }}>
            Apertura <span style={{ color: 'var(--gold)' }}>Casse</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Apri casse per ottenere skin, badge e oggetti rari</p>
            <div style={{
              background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: '20px', padding: '0.25rem 0.8rem',
              fontSize: '0.8rem', fontWeight: 700, color: 'var(--neon)',
              marginLeft: 'auto',
            }}>
              💪 {balance?.toLocaleString()} FP
            </div>
          </div>
        </div>

        {error && (
          <div className="fly-down" style={{
            background: 'rgba(255,68,85,0.08)', border: '1px solid rgba(255,68,85,0.3)',
            borderRadius: '10px', padding: '0.8rem 1rem', marginBottom: '1.5rem',
            color: 'var(--red)', fontSize: '0.9rem',
          }}>{error}</div>
        )}

        {/* Revealed item — CS2 style */}
        {item && animPhase !== 'idle' && (
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <div style={{
              background: 'var(--surface)',
              border: `2px solid ${RARITY_CONFIG[item.rarity].color}`,
              borderRadius: '20px',
              padding: '3rem 2rem',
              textAlign: 'center',
              boxShadow: `0 0 60px ${RARITY_CONFIG[item.rarity].glow}, 0 0 120px ${RARITY_CONFIG[item.rarity].glow}50`,
              animation: 'item-reveal 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Background shimmer */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at center, ${RARITY_CONFIG[item.rarity].glow} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Particles */}
              {particles.map(p => (
                <div key={p.id} style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  width: `${p.size}px`, height: `${p.size}px`,
                  borderRadius: '50%',
                  background: p.color,
                  transform: `translate(-50%, -50%) rotate(${p.angle}deg) translateX(${p.dist}px)`,
                  animation: 'particle-burst 1s ease-out forwards',
                  '--tx': `${Math.cos(p.angle * Math.PI / 180) * p.dist}px`,
                  '--ty': `${Math.sin(p.angle * Math.PI / 180) * p.dist}px`,
                  boxShadow: `0 0 6px ${p.color}`,
                } as React.CSSProperties} />
              ))}

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '5rem', marginBottom: '0.5rem', filter: `drop-shadow(0 0 20px ${RARITY_CONFIG[item.rarity].color})` }}>
                  {catIcon(item.category)}
                </div>
                <div style={{
                  fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em',
                  color: RARITY_CONFIG[item.rarity].color,
                  marginBottom: '0.6rem',
                  textTransform: 'uppercase',
                }}>
                  ◆ {RARITY_CONFIG[item.rarity].label} ◆
                </div>
                <div className={`rarity-${item.rarity}`} style={{ fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
                  {item.name}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
                  {item.category}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Crate grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
          {Object.entries(CRATE_INFO).map(([tier, info]) => {
            const cost = CRATE_COSTS[tier as keyof typeof CRATE_COSTS]
            const canAfford = balance !== null && balance >= cost
            const isOpening = opening === tier && animPhase !== 'idle'
            const isShaking = opening === tier && animPhase === 'shaking'
            const isExploding = opening === tier && animPhase === 'exploding'

            return (
              <div key={tier} className="crate-card"
                onClick={() => canAfford && !opening && openCrate(tier)}
                style={{
                  background: isOpening ? `radial-gradient(ellipse at center, ${info.glow} 0%, var(--surface) 70%)` : 'var(--surface)',
                  border: `1px solid ${isOpening ? info.color : canAfford ? info.color + '33' : 'var(--border)'}`,
                  boxShadow: isOpening ? `0 0 30px ${info.glow}` : 'none',
                  textAlign: 'center',
                  borderRadius: '16px',
                  padding: '1.8rem 1.2rem',
                  cursor: canAfford && !opening ? 'pointer' : 'default',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  opacity: (!canAfford && !opening) ? 0.5 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Shine overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
                  borderRadius: 'inherit',
                  pointerEvents: 'none',
                }} />

                {/* Crate icon */}
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1rem',
                  display: 'inline-block',
                  animation: isShaking ? 'crate-shake 0.15s ease-in-out infinite' :
                             isExploding ? 'crate-explode 0.5s ease-out forwards' : 'none',
                  filter: isOpening ? `drop-shadow(0 0 15px ${info.color})` : 'none',
                  transition: 'filter 0.3s',
                }}>
                  {info.icon}
                </div>

                {/* Tier label */}
                <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.2em', color: info.color, marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                  {info.subtitle}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--text)' }}>
                  {info.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {info.desc}
                </div>

                {/* Chances */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1.2rem' }}>
                  {info.chances.map(c => (
                    <div key={c} style={{
                      fontSize: '0.72rem', color: 'var(--text-muted)',
                      background: 'var(--surface2)',
                      borderRadius: '4px', padding: '0.2rem 0.5rem',
                    }}>{c}</div>
                  ))}
                </div>

                {/* Cost & button */}
                <div style={{ fontWeight: 900, color: info.color, fontSize: '1.3rem', marginBottom: '0.8rem' }}>
                  {cost.toLocaleString()} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>FP</span>
                </div>

                <button
                  onClick={e => { e.stopPropagation(); if (canAfford && !opening) openCrate(tier) }}
                  disabled={!canAfford || !!opening}
                  style={{
                    width: '100%', padding: '0.65rem',
                    borderRadius: '10px', border: 'none',
                    background: isOpening ? info.grad :
                                canAfford ? info.grad : 'var(--surface2)',
                    color: canAfford ? '#fff' : 'var(--text-muted)',
                    fontWeight: 800,
                    cursor: canAfford && !opening ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    letterSpacing: '0.03em',
                    boxShadow: canAfford && !isOpening ? `0 4px 15px ${info.glow}` : 'none',
                  }}>
                  {isOpening ? '✨ Apertura...' : !canAfford ? 'FP insufficienti' : 'APRI CASSA'}
                </button>
              </div>
            )
          })}
        </div>

        {/* Info strip */}
        <div style={{
          marginTop: '2rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          display: 'flex', gap: '2rem', flexWrap: 'wrap',
        }}>
          {Object.entries(RARITY_CONFIG).map(([rarity, cfg]) => (
            <div key={rarity} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{rarity}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
