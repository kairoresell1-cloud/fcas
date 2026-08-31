'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function CoinflipPage() {
  const [bet, setBet] = useState(20)
  const [choice, setChoice] = useState<'testa' | 'croce'>('testa')
  const [flipping, setFlipping] = useState(false)
  const [result, setResult] = useState<{ result: string; won: boolean; net: number } | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [coinFace, setCoinFace] = useState('🪙')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
  }, [])

  async function flip() {
    if (flipping || !balance || balance < bet) return
    setFlipping(true); setResult(null)
    // Animazione moneta
    const faces = ['🪙', '⭕', '🪙', '⭕']
    let i = 0
    const iv = setInterval(() => { setCoinFace(faces[i++ % faces.length]) }, 150)
    const res = await fetch('/api/games/coinflip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet, choice })
    })
    const data = await res.json()
    setTimeout(() => {
      clearInterval(iv)
      setCoinFace(data.result === 'testa' ? '🟡' : '⚪')
      setResult(data)
      setBalance(b => b !== null ? b + data.net : b)
      setFlipping(false)
    }, 1500)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/games" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>← Giochi</Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>🪙 Coinflip</h1>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Saldo: <strong style={{ color: 'var(--neon)' }}>{balance?.toLocaleString()} FP</strong>
          </div>

          {/* Moneta */}
          <div style={{
            fontSize: '8rem', margin: '1rem auto 2rem',
            transition: 'transform 0.1s',
            transform: flipping ? 'rotateY(180deg)' : 'none',
            display: 'inline-block',
          }}>
            {coinFace}
          </div>

          {/* Scelta */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
            {(['testa', 'croce'] as const).map(c => (
              <button key={c} onClick={() => setChoice(c)} style={{
                padding: '0.7rem 2rem', borderRadius: '8px', fontWeight: 700,
                fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                background: choice === c ? 'var(--purple)' : 'var(--surface2)',
                color: choice === c ? '#fff' : 'var(--text-dim)',
                border: `2px solid ${choice === c ? 'var(--purple)' : 'var(--border)'}`,
              }}>
                {c === 'testa' ? '🟡 Testa' : '⚪ Croce'}
              </button>
            ))}
          </div>

          {/* Result */}
          {result && !flipping && (
            <div className="fly-up" style={{
              padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem',
              background: result.won ? 'rgba(0,255,136,0.1)' : 'rgba(231,76,60,0.1)',
              border: `1px solid ${result.won ? 'var(--neon)' : 'var(--red)'}`,
              color: result.won ? 'var(--neon)' : 'var(--red)',
              fontWeight: 700, fontSize: '1.1rem'
            }}>
              {result.result === 'testa' ? '🟡 Testa!' : '⚪ Croce!'}
              {' — '}{result.won ? `+${result.net} FP 🎉` : `−${bet} FP 😢`}
            </div>
          )}

          {/* Bet */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>
              Puntata: <strong style={{ color: 'var(--gold)' }}>{bet} FP</strong>
              <span style={{ color: 'var(--neon)', marginLeft: '0.5rem' }}>→ vinci {bet * 2} FP</span>
            </label>
            <input type="range" min={10} max={Math.min(1000, balance || 1000)} step={10}
              value={bet} onChange={e => setBet(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--purple)' }} />
          </div>

          <button className="btn-primary" onClick={flip}
            disabled={flipping || (balance !== null && balance < bet)}
            style={{ fontSize: '1.1rem', padding: '0.8rem 3rem', width: '100%', background: 'var(--purple)', color: '#fff' }}>
            {flipping ? '🪙 Lancio...' : '🪙 LANCIA'}
          </button>
        </div>
      </main>
    </div>
  )
}
