'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface Card { suit: string; value: string; num: number }

const suitColor = (suit: string) => ['♥', '♦'].includes(suit) ? 'var(--red)' : 'var(--text)'

function CardUI({ card }: { card: Card }) {
  return (
    <div style={{
      width: '64px', height: '90px', background: '#fff', borderRadius: '8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      border: '2px solid var(--border)', color: suitColor(card.suit),
      fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      flexShrink: 0,
    }}>
      <div>{card.value}</div>
      <div style={{ fontSize: '1.3rem' }}>{card.suit}</div>
    </div>
  )
}

export default function BlackjackPage() {
  const [bet, setBet] = useState(20)
  const [balance, setBalance] = useState<number | null>(null)
  const [gameState, setGameState] = useState<any>(null)
  const [playerValue, setPlayerValue] = useState(0)
  const [dealerVisible, setDealerVisible] = useState<Card | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ result: string; dealerHand: Card[]; dealerValue: number; playerValue: number } | null>(null)
  const [status, setStatus] = useState<string>('idle')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
  }, [])

  async function deal() {
    setLoading(true); setResult(null); setStatus('playing')
    const res = await fetch('/api/games/blackjack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet, action: 'deal' })
    })
    const data = await res.json()
    setGameState(data.gameState)
    setPlayerValue(data.playerValue)
    setDealerVisible(data.dealerVisible)
    setBalance(b => b !== null ? b - bet : b)
    if (data.gameState.status === 'blackjack') {
      setStatus('blackjack')
      setBalance(b => b !== null ? b + Math.floor(bet * 2.5) : b)
    }
    setLoading(false)
  }

  async function action(act: 'hit' | 'stand') {
    setLoading(true)
    const res = await fetch('/api/games/blackjack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: act, gameState })
    })
    const data = await res.json()
    if (act === 'hit') {
      setGameState(data.gameState)
      setPlayerValue(data.playerValue)
      if (data.gameState.status === 'bust') setStatus('bust')
    } else {
      setResult(data)
      setStatus(data.result)
      if (data.result === 'win') setBalance(b => b !== null ? b + bet * 2 : b)
      else if (data.result === 'push') setBalance(b => b !== null ? b + bet : b)
    }
    setLoading(false)
  }

  function reset() { setGameState(null); setResult(null); setStatus('idle'); setDealerVisible(null); setPlayerValue(0) }

  const playing = status === 'playing'
  const playerHand: Card[] = gameState?.playerHand || []
  const dealerFinalHand: Card[] = result?.dealerHand || (dealerVisible ? [dealerVisible] : [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/games" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}>← Giochi</Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>🃏 Blackjack</h1>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            Saldo: <strong style={{ color: 'var(--neon)' }}>{balance?.toLocaleString()} FP</strong>
            {gameState && <span style={{ marginLeft: '1rem' }}>Puntata: <strong style={{ color: 'var(--gold)' }}>{bet} FP</strong></span>}
          </div>

          {/* Result banner */}
          {status !== 'idle' && status !== 'playing' && (
            <div className="fly-up" style={{
              textAlign: 'center', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem',
              background: ['win','blackjack'].includes(status) ? 'rgba(0,255,136,0.1)' : status === 'push' ? 'rgba(255,215,0,0.1)' : 'rgba(231,76,60,0.1)',
              border: `1px solid ${['win','blackjack'].includes(status) ? 'var(--neon)' : status === 'push' ? 'var(--gold)' : 'var(--red)'}`,
              color: ['win','blackjack'].includes(status) ? 'var(--neon)' : status === 'push' ? 'var(--gold)' : 'var(--red)',
              fontWeight: 800, fontSize: '1.2rem'
            }}>
              {status === 'win' && '🎉 Hai vinto!'}
              {status === 'blackjack' && '🃏 BLACKJACK! x2.5'}
              {status === 'push' && '🤝 Pareggio'}
              {status === 'lose' && '😢 Il banco vince'}
              {status === 'bust' && '💥 Sforato! Perso'}
            </div>
          )}

          {/* Tavolo */}
          <div style={{ background: '#0a3d1f', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', minHeight: '220px' }}>
            {/* Mano dealer */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.6rem' }}>
                Banco {result ? `(${result.dealerValue})` : dealerVisible ? '' : ''}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {dealerFinalHand.map((c, i) => <CardUI key={i} card={c} />)}
                {!result && gameState && (
                  <div style={{
                    width: '64px', height: '90px', background: '#1a4a2e', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px dashed #2a6a3e', color: '#2a6a3e', fontSize: '1.5rem'
                  }}>?</div>
                )}
              </div>
            </div>

            {/* Separatore */}
            {gameState && <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }} />}

            {/* Mano player */}
            {playerHand.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.6rem' }}>
                  Tu ({playerValue}) {playerValue === 21 && '⭐'}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {playerHand.map((c, i) => <CardUI key={i} card={c} />)}
                </div>
              </div>
            )}

            {!gameState && (
              <div style={{ textAlign: 'center', color: '#2a6a3e', paddingTop: '2rem', fontSize: '1rem' }}>
                Imposta la puntata e dai le carte
              </div>
            )}
          </div>

          {/* Controlli */}
          {status === 'idle' && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>
                  Puntata: <strong style={{ color: 'var(--gold)' }}>{bet} FP</strong>
                </label>
                <input type="range" min={10} max={Math.min(500, balance || 500)} step={10}
                  value={bet} onChange={e => setBet(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--gold)' }} />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {[10, 25, 50, 100, 200].map(v => (
                    <button key={v} onClick={() => setBet(v)} style={{
                      background: bet === v ? 'var(--gold)' : 'var(--surface2)',
                      color: bet === v ? '#000' : 'var(--text-dim)',
                      border: '1px solid var(--border)', borderRadius: '6px',
                      padding: '0.3rem 0.7rem', cursor: 'pointer', fontSize: '0.8rem'
                    }}>{v}</button>
                  ))}
                </div>
              </div>
              <button className="btn-primary" onClick={deal}
                disabled={loading || (balance !== null && balance < bet)}
                style={{ width: '100%', fontSize: '1rem', padding: '0.8rem' }}>
                🃏 Dai le carte
              </button>
            </>
          )}

          {playing && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" onClick={() => action('hit')} disabled={loading} style={{ flex: 1, padding: '0.8rem' }}>
                👆 Carta
              </button>
              <button className="btn-outline" onClick={() => action('stand')} disabled={loading} style={{ flex: 1, padding: '0.8rem' }}>
                ✋ Stai
              </button>
            </div>
          )}

          {status !== 'idle' && status !== 'playing' && (
            <button className="btn-primary" onClick={reset} style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
              🔄 Nuova partita
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
