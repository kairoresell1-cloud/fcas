import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── HERO ───────────────────────────────── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
      }}>
        {/* Animated grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(30,34,53,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30,34,53,0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'grid-move 8s linear infinite',
        }} />
        {/* Glow blobs */}
        <div style={{ position: 'absolute', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', borderRadius: '50%', top: '30%', right: '10%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', borderRadius: '50%', bottom: '20%', left: '5%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: '20px', padding: '0.4rem 1rem',
            fontSize: '0.8rem', fontWeight: 700, color: 'var(--neon)',
            marginBottom: '2rem', letterSpacing: '0.05em',
          }}>
            <span style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}>●</span>
            FITNESS × GAMING — GUADAGNA MENTRE TI ALLENI
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            marginBottom: '1.5rem',
            fontFamily: "'Rajdhani', 'Inter', sans-serif",
          }}>
            Allenati.<br />
            <span style={{ color: 'var(--neon)', textShadow: '0 0 40px rgba(0,255,136,0.5)' }}>Guadagna.</span><br />
            Gioca.
          </h1>

          <p style={{
            color: 'var(--text-dim)', fontSize: '1.15rem',
            maxWidth: '480px', margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}>
            Ogni sessione in palestra ti porta <strong style={{ color: 'var(--text)' }}>FitPoints</strong>.
            Usali per aprire crate, giocare ad aviator, blackjack e molto altro.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link href="/register">
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2.2rem' }}>
                Inizia gratis →
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-outline" style={{ fontSize: '1rem', padding: '0.85rem 2.2rem' }}>
                Ho già un account
              </button>
            </Link>
          </div>

          {/* Live ticker */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '0.7rem 0',
            overflow: 'hidden',
          }}>
            <div className="ticker-inner" style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              {['🏆 Marco ha vinto 2400 FP su Aviator a 4.8x', '💎 Sara ha aperto una Cassa Leggendaria', '🔥 Luca ha battuto il banco a Blackjack', '✈️ Anna ha incassato a 3.2x', '👑 Gianni ha trovato un item Leggendario', '💰 Marta ha guadagnato 1200 FP correndo', '🎰 Paolo ha vinto 5x alle Slot'].map((t, i) => (
                <span key={i} style={{ marginRight: '3rem' }}>{t}</span>
              ))}
              {['🏆 Marco ha vinto 2400 FP su Aviator a 4.8x', '💎 Sara ha aperto una Cassa Leggendaria', '🔥 Luca ha battuto il banco a Blackjack', '✈️ Anna ha incassato a 3.2x', '👑 Gianni ha trovato un item Leggendario', '💰 Marta ha guadagnato 1200 FP correndo', '🎰 Paolo ha vinto 5x alle Slot'].map((t, i) => (
                <span key={i + 100} style={{ marginRight: '3rem' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────── */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--neon)', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Come funziona</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
            Quattro passi, zero fatica
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🏃', num: '01', title: 'Logga l\'attività', desc: 'Inserisci tipo e durata. Corsa, palestra, nuoto — ogni minuto conta.' },
            { icon: '💰', num: '02', title: 'Guadagna FitPoints', desc: 'Ogni sessione ti porta punti proporzionali all\'intensità.' },
            { icon: '🎰', num: '03', title: 'Scegli il tuo gioco', desc: 'Aviator, Blackjack, Slot, Coinflip. Cinque modi per vincere.' },
            { icon: '📦', num: '04', title: 'Colleziona', desc: 'Apri casse per trovare skin e badge rari da mostrare.' },
          ].map(f => (
            <div key={f.num} className="card" style={{ position: 'relative', overflow: 'visible' }}>
              <div style={{
                position: 'absolute', top: '-1px', right: '1.2rem',
                fontSize: '0.7rem', fontWeight: 900, color: 'var(--neon)',
                opacity: 0.4, letterSpacing: '0.1em',
              }}>{f.num}</div>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 800, marginBottom: '0.5rem', fontSize: '1.05rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GAMES GRID ────────────────────────── */}
      <section style={{ padding: '4rem 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', color: 'var(--purple)', marginBottom: '0.8rem', textTransform: 'uppercase' }}>I giochi</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>Cinque modi per vincere</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '✈️', name: 'Aviator', color: '#3b82f6', desc: 'Incassa prima del crash' },
              { icon: '🎰', name: 'Slot Machine', color: '#f5c842', desc: 'Tre simboli, jackpot' },
              { icon: '🃏', name: 'Blackjack', color: '#00ff88', desc: 'Batti il banco a 21' },
              { icon: '🪙', name: 'Coinflip', color: '#8b5cf6', desc: '50/50, doppio o niente' },
              { icon: '📦', name: 'Crate', color: '#f97316', desc: 'Oggetti rari da collezione' },
            ].map(g => (
              <div key={g.name} style={{
                background: 'var(--surface2)',
                border: `1px solid ${g.color}22`,
                borderRadius: '14px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                cursor: 'default',
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-6px)'
                  el.style.borderColor = g.color + '55'
                  el.style.boxShadow = `0 12px 30px ${g.color}20`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'none'
                  el.style.borderColor = g.color + '22'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.7rem' }}>{g.icon}</div>
                <div style={{ fontWeight: 800, color: g.color, marginBottom: '0.3rem', fontSize: '0.95rem' }}>{g.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{g.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/register">
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2.5rem' }}>
                Registrati e inizia →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '2rem', color: 'var(--text-muted)',
        fontSize: '0.8rem',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
      }}>
        <span style={{ color: 'var(--neon)', fontWeight: 700 }}>FitCasino</span>
        <span>·</span>
        <span>Motiva il tuo allenamento 💪</span>
      </footer>
    </main>
  )
}
