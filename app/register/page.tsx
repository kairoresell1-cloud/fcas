'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false) }
    else window.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>💪</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon)' }} className="glow">Unisciti</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '0.3rem' }}>Crea il tuo account FitCasino</p>
        </div>
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'username', label: 'Username', type: 'text', placeholder: 'atleta_pro' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'la@tua.email' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>{f.label}</label>
              <input
                className="input" type={f.type} placeholder={f.placeholder} required
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          {error && <p style={{ color: 'var(--red)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Creazione...' : 'Crea account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Hai già un account?{' '}
          <Link href="/login" style={{ color: 'var(--neon)', textDecoration: 'none', fontWeight: 600 }}>Accedi</Link>
        </p>
      </div>
    </div>
  )
}
