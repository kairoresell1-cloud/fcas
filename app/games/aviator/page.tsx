'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface Particle { id: number; x: number; y: number; vx: number; vy: number; life: number; color: string }

export default function AviatorPage() {
  const [bet, setBet] = useState(20)
  const [cashoutAt, setCashoutAt] = useState(2.0)
  const [flying, setFlying] = useState(false)
  const [multiplier, setMultiplier] = useState(1.0)
  const [result, setResult] = useState<{ crashAt: number; won: boolean; winAmount: number; net: number } | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [planePos, setPlanePos] = useState({ x: 8, y: 75 })
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([])
  const [phase, setPhase] = useState<'idle' | 'flying' | 'crashed' | 'won'>('idle')
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; y: number; color: string }[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const frameRef = useRef(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (animRef.current) clearInterval(animRef.current)
    }
  }, [])

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 12) => {
    const newP: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 2,
      life: 1,
      color,
    }))
    setParticles(p => [...p, ...newP])
    setTimeout(() => setParticles(p => p.filter(pp => !newP.find(n => n.id === pp.id))), 1200)
  }, [])

  const addFloatingText = useCallback((text: string, color: string) => {
    const id = Date.now()
    setFloatingTexts(f => [...f, { id, text, y: 50, color }])
    setTimeout(() => setFloatingTexts(f => f.filter(t => t.id !== id)), 1500)
  }, [])

  async function launch() {
    if (flying || !balance || balance < bet) return
    setFlying(true)
    setResult(null)
    setMultiplier(1.0)
    setPhase('flying')
    setTrail([])
    setPlanePos({ x: 8, y: 75 })

    let current = 1.0
    frameRef.current = 0

    // Plane animation
    animRef.current = setInterval(() => {
      frameRef.current++
      const t = frameRef.current
      const px = Math.min(8 + t * 0.4, 78)
      const py = Math.max(75 - t * 0.5 - Math.sin(t * 0.1) * 8, 8)
      setPlanePos({ x: px, y: py })
      setTrail(prev => [...prev.slice(-20), { x: px, y: py }])
      if (frameRef.current % 15 === 0) {
        spawnParticles(px, py, 'rgba(0,200,255,0.6)', 3)
      }
    }, 60)

    intervalRef.current = setInterval(() => {
      current = parseFloat((current + 0.05 + current * 0.002).toFixed(2))
      setMultiplier(current)
    }, 80)

    const res = await fetch('/api/games/aviator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet, cashoutAt })
    })
    const data = await res.json()

    const crashDelay = Math.min(Math.max(500, (data.crashAt - 1) * 600), 5000)
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (animRef.current) clearInterval(animRef.current)
      setMultiplier(data.crashAt)
      setResult(data)
      setBalance(b => b !== null ? b + data.net : b)
      setFlying(false)

      if (data.won) {
        setPhase('won')
        spawnParticles(50, 40, 'var(--neon)', 20)
        spawnParticles(30, 30, 'var(--gold)', 15)
        addFloatingText(`+${data.winAmount - bet} FP`, '#00ff88')
      } else {
        setPhase('crashed')
        spawnParticles(planePos.x, planePos.y, '#ff4455', 18)
        addFloatingText(`-${bet} FP`, '#ff4455')
      }

      setTimeout(() => setPhase('idle'), 3000)
    }, crashDelay)
  }

  const multiplierColor = phase === 'flying' ? 'var(--blue)' :
    phase === 'won' ? 'var(--neon)' :
    phase === 'crashed' ? 'var(--red)' : 'var(--text-dim)'

  const canvasGlow = phase === 'flying'
    ? 'inset 0 0 60px rgba(59,130,246,0.08)'
    : phase === 'won'
      ? 'inset 0 0 60px rgba(0,255,136,0.12)'
      : phase === 'crashed'
        ? 'inset 0 0 60px rgba(255,68,85,0.12)'
        : 'none'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link href="/games" style={{
            color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.35rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border)',
            transition: 'all 0.15s',
          }}>← Giochi</Link>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>✈️</span> Aviator
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.1rem' }}>L'aereo decolla. Incassa prima del crash.</p>
          </div>
        </div>

        {/* Balance pill */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-bright)',
            borderRadius: '20px', padding: '0.3rem 1rem',
            fontSize: '0.85rem', color: 'var(--text-dim)',
          }}>Saldo: <strong style={{ color: 'var(--neon)' }}>{balance?.toLocaleString()} FP</strong></div>
        </div>

        {/* Main canvas */}
        <div ref={canvasRef} className="aviator-canvas" style={{
          height: '300px', marginBottom: '1.2rem',
          boxShadow: canvasGlow,
          border: `1px solid ${phase === 'flying' ? 'rgba(59,130,246,0.3)' : phase === 'won' ? 'rgba(0,255,136,0.3)' : phase === 'crashed' ? 'rgba(255,68,85,0.3)' : 'var(--border)'}`,
          transition: 'box-shadow 0.5s ease, border-color 0.4s ease',
        }}>
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(30,34,53,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(30,34,53,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }} />

          {/* Trail */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
            {trail.length > 1 && (
              <polyline
                points={trail.map(p => `${p.x}%,${p.y}%`).join(' ')}
                fill="none"
                stroke="url(#trailGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.7"
              />
            )}
            <defs>
              <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="var(--blue)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Particles */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: p.color,
              animation: 'particle-burst 1.2s ease-out forwards',
              '--tx': `${p.vx * 20}px`, '--ty': `${p.vy * 20}px`,
              pointerEvents: 'none',
            } as React.CSSProperties} />
          ))}

          {/* Floating texts */}
          {floatingTexts.map(t => (
            <div key={t.id} style={{
              position: 'absolute',
              left: '50%', top: `${t.y}%`,
              transform: 'translateX(-50%)',
              color: t.color,
              fontWeight: 900,
              fontSize: '1.4rem',
              animation: 'float-up 1.5s ease-out forwards',
              pointerEvents: 'none',
              zIndex: 10,
              textShadow: `0 0 20px ${t.color}`,
            }}>{t.text}</div>
          ))}

          {/* Plane */}
          <div style={{
            position: 'absolute',
            left: `${planePos.x}%`, top: `${planePos.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: '2.4rem',
            transition: phase === 'idle' ? 'none' : 'none',
            animation: phase === 'flying' ? 'plane-fly 3s ease-in-out infinite' :
                       phase === 'crashed' ? 'plane-crash 0.8s ease-in forwards' :
                       phase === 'won' ? 'plane-fly 1s ease-in-out infinite' : 'none',
            filter: phase === 'flying' ? 'drop-shadow(0 0 8px rgba(59,130,246,0.8))' :
                    phase === 'won' ? 'drop-shadow(0 0 12px rgba(0,255,136,0.9))' : 'none',
            zIndex: 5,
          }}>✈️</div>

          {/* Multiplier display */}
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              fontSize: '5rem',
              fontWeight: 900,
              color: multiplierColor,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              fontFamily: "'Rajdhani', 'Inter', sans-serif",
              textShadow: phase === 'flying' ? '0 0 30px rgba(59,130,246,0.8)' :
                          phase === 'won' ? '0 0 30px rgba(0,255,136,0.8)' :
                          phase === 'crashed' ? '0 0 30px rgba(255,68,85,0.8)' : 'none',
              animation: phase === 'flying' ? 'multiplier-pulse 0.4s ease-in-out infinite' : 'none',
              transition: 'color 0.3s, text-shadow 0.3s',
            }}>
              {multiplier.toFixed(2)}x
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              {phase === 'flying' && `Auto-cash a `}
              {phase === 'flying' && <span style={{ color: 'var(--gold)' }}>{cashoutAt.toFixed(2)}x</span>}
              {phase === 'crashed' && <span style={{ color: 'var(--red)', fontWeight: 700 }}>💥 Crash!</span>}
              {phase === 'won' && <span style={{ color: 'var(--neon)', fontWeight: 700 }}>✅ Incassato!</span>}
              {phase === 'idle' && <span style={{ color: 'var(--text-muted)' }}>In attesa...</span>}
            </div>
          </div>

          {/* Result overlay */}
          {result && phase !== 'flying' && (
            <div className="fly-up" style={{
              position: 'absolute',
              bottom: '1rem', left: '50%',
              transform: 'translateX(-50%)',
              background: result.won ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,85,0.1)',
              border: `1px solid ${result.won ? 'rgba(0,255,136,0.4)' : 'rgba(255,68,85,0.4)'}`,
              borderRadius: '10px',
              padding: '0.5rem 1.2rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: result.won ? 'var(--neon)' : 'var(--red)',
              whiteSpace: 'nowrap',
            }}>
              {result.won
                ? `✅ +${result.winAmount - bet} FP a ${cashoutAt}x`
                : `💥 Crash a ${result.crashAt}x — ${bet} FP persi`}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="card" style={{ borderColor: 'var(--border-bright)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.6rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Puntata
              </label>
              <div style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border-bright)',
                borderRadius: '10px',
                padding: '0.6rem 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '0.6rem',
              }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--gold)' }}>{bet}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>FP</span>
              </div>
              <input type="range" min={10} max={Math.min(500, balance || 500)} step={10}
                value={bet} onChange={e => setBet(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }} disabled={flying} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.6rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Incassa a
              </label>
              <div style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border-bright)',
                borderRadius: '10px',
                padding: '0.6rem 1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '0.6rem',
              }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--blue)' }}>{cashoutAt.toFixed(2)}x</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>AUTO</span>
              </div>
              <input type="range" min={1.1} max={10} step={0.1}
                value={cashoutAt} onChange={e => setCashoutAt(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--blue)' }} disabled={flying} />
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
            {[1.5, 2, 3, 5, 10].map(v => (
              <button key={v} onClick={() => setCashoutAt(v)} disabled={flying} style={{
                background: cashoutAt === v ? 'rgba(59,130,246,0.2)' : 'var(--surface2)',
                color: cashoutAt === v ? 'var(--blue)' : 'var(--text-dim)',
                border: `1px solid ${cashoutAt === v ? 'rgba(59,130,246,0.5)' : 'var(--border)'}`,
                borderRadius: '8px',
                padding: '0.35rem 0.85rem',
                cursor: flying ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}>{v}x</button>
            ))}
          </div>

          {/* Win preview */}
          <div style={{
            background: 'var(--surface2)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.2rem',
          }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Vincita potenziale</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--neon)', fontWeight: 900, fontSize: '1.1rem' }}>{Math.floor(bet * cashoutAt).toLocaleString()} FP</span>
              <span style={{ color: 'var(--neon)', opacity: 0.5, fontSize: '0.8rem', marginLeft: '0.4rem' }}>
                (+{Math.floor(bet * cashoutAt - bet).toLocaleString()})
              </span>
            </div>
          </div>

          <button
            onClick={launch}
            disabled={flying || (balance !== null && balance < bet)}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              background: flying
                ? 'linear-gradient(135deg, var(--red) 0%, #aa0011 100%)'
                : 'linear-gradient(135deg, #1a8cff 0%, #0055cc 100%)',
              color: '#fff',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: flying || (balance !== null && balance < bet) ? 'not-allowed' : 'pointer',
              opacity: (balance !== null && balance < bet && !flying) ? 0.4 : 1,
              transition: 'all 0.2s',
              letterSpacing: '0.03em',
              fontFamily: 'inherit',
              boxShadow: flying ? '0 4px 25px rgba(255,68,85,0.3)' : '0 4px 25px rgba(26,140,255,0.3)',
            }}>
            {flying ? '✈️  In volo — preparati al crash...' : '🚀  DECOLLA'}
          </button>
        </div>
      </main>
    </div>
  )
}
