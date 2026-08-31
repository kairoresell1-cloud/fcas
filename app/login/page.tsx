'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false) }
    else window.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🏋️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon)' }} className="glow">FitCasino</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.3rem' }}>Bentornato, atleta</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="la@tua.email" required />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Non hai un account?{' '}
          <Link href="/register" style={{ color: 'var(--neon)', textDecoration: 'none', fontWeight: 600 }}>Registrati</Link>
        </p>
      </div>
    </div>
  )
}
