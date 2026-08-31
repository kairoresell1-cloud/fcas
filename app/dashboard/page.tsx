'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ACTIVITY_POINTS, calculatePoints } from '@/lib/points'

interface User { username: string; fitPoints: number; totalEarned: number; createdAt: string }
interface Activity { id: string; type: string; duration: number; points: number; createdAt: string }

const ACTIVITY_ICONS: Record<string, string> = {
  corsa: '🏃', palestra: '🏋️', nuoto: '🏊', ciclismo: '🚴',
  yoga: '🧘', calcio: '⚽', basket: '🏀', tennis: '🎾',
  crossfit: '💪', camminata: '🚶'
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [form, setForm] = useState({ type: 'corsa', duration: 30 })
  const [loading, setLoading] = useState(false)
  const [flash, setFlash] = useState<{ points: number } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setUser(d.user)
    })
    fetch('/api/activity').then(r => r.json()).then(d => setActivities(d.activities || []))
  }, [])

  async function logActivity(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.success) {
      setFlash({ points: data.points })
      setUser(u => u ? { ...u, fitPoints: u.fitPoints + data.points, totalEarned: u.totalEarned + data.points } : u)
      setActivities(a => [data.activity, ...a.slice(0, 19)])
      setTimeout(() => setFlash(null), 2500)
    }
    setLoading(false)
  }

  const preview = calculatePoints(form.type, form.duration)

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        {user && (
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              Ciao, <span style={{ color: 'var(--neon)' }}>{user.username}</span> 👋
            </h1>
            <p style={{ color: 'var(--text-dim)', marginTop: '0.3rem' }}>
              Totale guadagnato: <strong style={{ color: 'var(--gold)' }}>{user.totalEarned.toLocaleString()} FP</strong>
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Stats */}
          <div className="card" style={{ gridColumn: 'span 1' }}>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--neon)' }} className="glow">
                {user?.fitPoints.toLocaleString() || '—'}
              </div>
              <div style={{ color: 'var(--text-dim)', marginTop: '0.3rem' }}>FitPoints disponibili</div>
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link href="/games">
                  <button className="btn-primary">🎰 Gioca</button>
                </Link>
                <Link href="/crates">
                  <button className="btn-outline">📦 Crate</button>
                </Link>
              </div>
            </div>
          </div>

          {/* Log Activity */}
          <div className="card">
            <h2 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1.1rem' }}>📝 Logga allenamento</h2>
            <form onSubmit={logActivity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Tipo</label>
                <select
                  className="input"
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={{ background: 'var(--surface2)' }}
                >
                  {Object.entries(ACTIVITY_POINTS).map(([k, v]) => (
                    <option key={k} value={k}>{ACTIVITY_ICONS[k] || '🏃'} {k.charAt(0).toUpperCase() + k.slice(1)} ({v} pt/10min)</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>
                  Durata: <strong style={{ color: 'var(--neon)' }}>{form.duration} min</strong>
                </label>
                <input
                  type="range" min={5} max={180} step={5}
                  value={form.duration}
                  onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--neon)' }}
                />
              </div>
              <div style={{
                background: 'var(--surface2)', borderRadius: '8px', padding: '0.7rem 1rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Guadagnerai</span>
                <strong style={{ color: 'var(--neon)', fontSize: '1.1rem' }}>+{preview} FP</strong>
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Salvataggio...' : '✅ Registra allenamento'}
              </button>
              {flash && (
                <div className="fly-up" style={{
                  textAlign: 'center', color: 'var(--neon)', fontWeight: 800,
                  fontSize: '1.2rem', padding: '0.5rem'
                }}>
                  +{flash.points} FitPoints! 🔥
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Attività recenti */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1.1rem' }}>⏱️ Attività recenti</h2>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>
              Nessun allenamento ancora. Inizia ora! 💪
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {activities.map(a => (
                <div key={a.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--surface2)', borderRadius: '8px', padding: '0.7rem 1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>{ACTIVITY_ICONS[a.type] || '🏃'}</span>
                    <div>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{a.type}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {a.duration} min · {new Date(a.createdAt).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--neon)', fontWeight: 700 }}>+{a.points} FP</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links giochi */}
        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {[
            { href: '/games/slots', label: '🎰 Slot Machine', color: 'var(--gold)' },
            { href: '/games/aviator', label: '✈️ Aviator', color: 'var(--blue)' },
            { href: '/games/blackjack', label: '🃏 Blackjack', color: 'var(--neon)' },
            { href: '/games/coinflip', label: '🪙 Coinflip', color: 'var(--purple)' },
            { href: '/crates', label: '📦 Crate', color: '#ff6b6b' },
          ].map(g => (
            <Link key={g.href} href={g.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--surface)',
                border: `1px solid var(--border)`,
                borderRadius: '10px',
                padding: '1rem',
                textAlign: 'center',
                fontWeight: 700,
                color: g.color,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = g.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                {g.label}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
