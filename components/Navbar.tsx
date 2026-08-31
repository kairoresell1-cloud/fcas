'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface User { username: string; fitPoints: number }

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/games', label: 'Giochi' },
    { href: '/crates', label: 'Crate' },
    { href: '/inventory', label: 'Inventario' },
  ]

  return (
    <nav style={{
      background: scrolled ? 'rgba(6,8,16,0.95)' : 'rgba(6,8,16,0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid rgba(30,34,53,0.8)' : '1px solid transparent',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      transition: 'all 0.3s ease',
      animation: 'nav-slide 0.4s ease forwards',
    }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, var(--neon) 0%, #00aaff 100%)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', fontWeight: 900, color: '#000',
          boxShadow: '0 0 15px rgba(0,255,136,0.4)',
        }}>F</div>
        <span style={{
          fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)',
          letterSpacing: '-0.02em',
          fontFamily: "'Rajdhani', sans-serif",
        }}>
          Fit<span style={{ color: 'var(--neon)' }}>Casino</span>
        </span>
      </Link>

      {/* Nav links */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--neon)' : 'var(--text-dim)',
                  background: active ? 'rgba(0,255,136,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.color = 'var(--text)'
                      ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.color = 'var(--text-dim)'
                      ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                    }
                  }}
                >{label}</div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {user ? (
          <>
            <div style={{
              background: 'rgba(0,255,136,0.06)',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: '20px',
              padding: '0.35rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--neon)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span style={{ opacity: 0.7 }}>💪</span>
              {user.fitPoints.toLocaleString()} <span style={{ opacity: 0.6, fontWeight: 500 }}>FP</span>
            </div>
            <div style={{
              width: '32px', height: '32px',
              background: 'var(--surface2)',
              border: '1px solid var(--border-bright)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              title={user.username}
            >{user.username[0].toUpperCase()}</div>
            <button onClick={logout} style={{
              background: 'none', border: '1px solid rgba(255,68,85,0.2)',
              color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.8rem',
              padding: '0.35rem 0.7rem', borderRadius: '8px', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--red)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,68,85,0.2)'
              }}
            >Esci</button>
          </>
        ) : (
          <>
            <Link href="/login"><button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Accedi</button></Link>
            <Link href="/register"><button className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Registrati</button></Link>
          </>
        )}
      </div>
    </nav>
  )
}
