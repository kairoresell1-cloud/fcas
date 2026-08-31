'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User { username: string; fitPoints: number }

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/dashboard" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--neon)' }} className="glow">
          FitCasino
        </span>
      </Link>

      {user && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            background: 'var(--surface2)',
            border: '1px solid var(--neon)',
            borderRadius: '20px',
            padding: '0.3rem 1rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--neon)',
          }}>
            💪 {user.fitPoints.toLocaleString()} FP
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.85rem' }}>Dashboard</Link>
            <span style={{ color: 'var(--border)' }}>|</span>
            <Link href="/games" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.85rem' }}>Giochi</Link>
            <span style={{ color: 'var(--border)' }}>|</span>
            <Link href="/inventory" style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '0.85rem' }}>Inventario</Link>
            <span style={{ color: 'var(--border)' }}>|</span>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Esci
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login"><button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Accedi</button></Link>
          <Link href="/register"><button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Registrati</button></Link>
        </div>
      )}
    </nav>
  )
}
