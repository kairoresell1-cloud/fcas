'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const SYMBOLS = ['🏋️', '🏃', '⚽', '🎯', '💪', '🔥', '⭐', '👑']

export default function SlotsPage() {
  const [bet, setBet] = useState(10)
  const [reels, setReels] = useState(['🏋️', '💪', '🔥'])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ win: number; net: number } | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
  }, [])

  async function spin() {
    if (spinning || balance === null || balance < bet) return
    setSpinning(true); setResult(null)

    // Animazione locale
    let ticks = 0
    const interval = setInterval(() => {
      setReels([0,1,2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]))
      ticks++
      if (ticks > 15) clearInterval(interval)
    }, 80)

    const res = await fetch('/api/games/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet })
    })
    const data = await res.json()
    setTimeout(() => {
      clearInterval(interval)
      setReels(data.reels)
      setResult({ win: data.win, net: data.net })
      setBalance(data.newBalance)
      setHistory(h => [`${data.reels.join(' ')} → ${data.net >= 0 ? '+' : ''}${data.net} FP`, ...h.slice(0, 9)])
      setSpinning(false)
    }, 1300)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/games" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>← Giochi</Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>🎰 Slot Machine</h1>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          {/* Balance */}
          <div style={{ marginBottom: '1.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Saldo: <strong style={{ color: 'var(--neon)' }}>{balance?.toLocaleString()} FP</strong>
          </div>

          {/* Rulli */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem',
            background: 'var(--surface2)', borderRadius: '12px', padding: '1.5rem',
            border: '2px solid var(--border)'
          }}>
            {reels.map((s, i) => (
              <div key={i} style={{
                width: '90px', height: '90px', fontSize: '3rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg)', borderRadius: '8px',
                border: `2px solid ${spinning ? 'var(--neon)' : 'var(--border)'}`,
                transition: 'border-color 0.3s',
                filter: spinning ? 'blur(1px)' : 'none',
              }}>
                {s}
              </div>
            ))}
          </div>

          {/* Result */}
          {result && !spinning && (
            <div className="fly-up" style={{
              padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem',
              background: result.net >= 0 ? 'rgba(0,255,136,0.1)' : 'rgba(231,76,60,0.1)',
              border: `1px solid ${result.net >= 0 ? 'var(--neon)' : 'var(--red)'}`,
              color: result.net >= 0 ? 'var(--neon)' : 'var(--red)',
              fontWeight: 700, fontSize: '1.1rem'
            }}>
              {result.net >= 0 ? `🎉 Vinto ${result.win} FP!` : `😢 Perso ${bet} FP`}
            </div>
          )}

          {/* Bet */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>
              Puntata: <strong style={{ color: 'var(--gold)' }}>{bet} FP</strong>
            </label>
            <input type="range" min={5} max={Math.min(500, balance || 500)} step={5}
              value={bet} onChange={e => setBet(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold)' }} />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {[10, 25, 50, 100].map(v => (
                <button key={v} onClick={() => setBet(v)} style={{
                  background: bet === v ? 'var(--gold)' : 'var(--surface2)',
                  color: bet === v ? '#000' : 'var(--text)',
                  border: '1px solid var(--border)', borderRadius: '6px',
                  padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                }}>{v}</button>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={spin}
            disabled={spinning || (balance !== null && balance < bet)}
            style={{ fontSize: '1.1rem', padding: '0.8rem 3rem', width: '100%' }}>
            {spinning ? '🎰 Girando...' : '🎰 SPIN'}
          </button>

          {/* Paytable */}
          <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Premi:</div>
            <div>👑👑👑 → x50 | ⭐⭐⭐ → x20 | 🔥🔥🔥 → x10 | Tre uguali → x5</div>
            <div style={{ marginTop: '0.3rem' }}>Due uguali → x1.5</div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="card" style={{ marginTop: '1rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.8rem', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Ultime spin</div>
            {history.map((h, i) => (
              <div key={i} style={{ fontSize: '0.85rem', padding: '0.3rem 0', borderBottom: '1px solid var(--border)', color: h.includes('+') ? 'var(--neon)' : 'var(--red)' }}>
                {h}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
