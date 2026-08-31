'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function AviatorPage() {
  const [bet, setBet] = useState(20)
  const [cashoutAt, setCashoutAt] = useState(2.0)
  const [flying, setFlying] = useState(false)
  const [multiplier, setMultiplier] = useState(1.0)
  const [result, setResult] = useState<{ crashAt: number; won: boolean; winAmount: number; net: number } | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  async function launch() {
    if (flying || !balance || balance < bet) return
    setFlying(true); setResult(null); setMultiplier(1.0)

    // Anima il moltiplicatore localmente
    let current = 1.0
    intervalRef.current = setInterval(() => {
      current = parseFloat((current + 0.05).toFixed(2))
      setMultiplier(current)
    }, 80)

    const res = await fetch('/api/games/aviator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet, cashoutAt })
    })
    const data = await res.json()

    // Simula il volo fino al crash
    const crashDelay = Math.max(500, (data.crashAt - 1) * 600)
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setMultiplier(data.crashAt)
      setResult(data)
      setBalance(b => b !== null ? b + data.net : b)
      setFlying(false)
    }, Math.min(crashDelay, 4000))
  }

  const crashed = result && !flying
  const color = flying ? 'var(--blue)' : crashed ? (result!.won ? 'var(--neon)' : 'var(--red)') : 'var(--text)'

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/games" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>← Giochi</Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>✈️ Aviator</h1>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Saldo: <strong style={{ color: 'var(--neon)' }}>{balance?.toLocaleString()} FP</strong>
          </div>

          {/* Display principale */}
          <div style={{
            background: 'var(--surface2)', borderRadius: '12px', padding: '3rem 2rem',
            marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
            border: `2px solid ${color}`, transition: 'border-color 0.3s',
          }}>
            {flying && (
              <div style={{
                position: 'absolute', fontSize: '3rem',
                animation: 'fly-up 0.5s ease infinite alternate',
                top: '1rem', right: '2rem'
              }}>✈️</div>
            )}
            <div style={{ fontSize: '4rem', fontWeight: 900, color, transition: 'color 0.3s' }}>
              {multiplier.toFixed(2)}x
            </div>
            {flying && (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Incasso automatico a <strong style={{ color: 'var(--gold)' }}>{cashoutAt.toFixed(2)}x</strong>
              </div>
            )}
            {crashed && (
              <div style={{ color, fontWeight: 700, marginTop: '0.5rem' }}>
                {result!.won
                  ? `✅ Incassato a ${cashoutAt}x → +${result!.winAmount - bet} FP!`
                  : `💥 Crash a ${result!.crashAt}x — Perso ${bet} FP`}
              </div>
            )}
            {!flying && !crashed && (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                In attesa del decollo...
              </div>
            )}
          </div>

          {/* Impostazioni */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>
                Puntata: <strong style={{ color: 'var(--gold)' }}>{bet} FP</strong>
              </label>
              <input type="range" min={10} max={Math.min(500, balance || 500)} step={10}
                value={bet} onChange={e => setBet(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold)' }} disabled={flying} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>
                Incassa a: <strong style={{ color: 'var(--blue)' }}>{cashoutAt.toFixed(2)}x</strong>
              </label>
              <input type="range" min={1.1} max={10} step={0.1}
                value={cashoutAt} onChange={e => setCashoutAt(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--blue)' }} disabled={flying} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[1.5, 2, 3, 5, 10].map(v => (
              <button key={v} onClick={() => setCashoutAt(v)} disabled={flying} style={{
                background: cashoutAt === v ? 'var(--blue)' : 'var(--surface2)',
                color: cashoutAt === v ? '#fff' : 'var(--text-dim)',
                border: '1px solid var(--border)', borderRadius: '6px',
                padding: '0.3rem 0.7rem', cursor: flying ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
              }}>{v}x</button>
            ))}
          </div>

          <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '0.7rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            Potenziale vincita: <strong style={{ color: 'var(--neon)' }}>{Math.floor(bet * cashoutAt)} FP</strong>
            <span style={{ color: 'var(--text-dim)', marginLeft: '0.5rem' }}>(+{Math.floor(bet * cashoutAt - bet)} FP)</span>
          </div>

          <button className="btn-primary" onClick={launch}
            disabled={flying || (balance !== null && balance < bet)}
            style={{ fontSize: '1.1rem', padding: '0.8rem 3rem', width: '100%', background: flying ? 'var(--red)' : 'var(--blue)', color: '#fff' }}>
            {flying ? '✈️ In volo...' : '🚀 DECOLLA'}
          </button>

          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            L'aereo parte e il moltiplicatore sale. Crash in qualsiasi momento — incassi automaticamente alla soglia scelta.
          </p>
        </div>
      </main>
    </div>
  )
}
