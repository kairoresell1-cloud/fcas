import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.3,
        }} />
        {/* Glow blob */}
        <div style={{
          position: 'absolute',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏋️</div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem' }}>
            Allenati.<br />
            <span style={{ color: 'var(--neon)' }} className="glow">Guadagna.</span><br />
            Gioca.
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Ogni corsa, ogni sessione in palestra ti porta <strong style={{ color: 'var(--neon)' }}>FitPoints</strong>.
            Usali per aprire crate, giocare a blackjack, aviator e molto altro.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register">
              <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>
                Inizia gratis →
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-outline" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>
                Ho già un account
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '3rem' }}>
          Come funziona
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🏃', title: 'Logga l\'attività', desc: 'Inserisci il tipo di allenamento e la durata. Corsa, palestra, nuoto — tutto conta.' },
            { icon: '💰', title: 'Guadagna FitPoints', desc: 'Ogni minuto di attività ti porta punti. Più ti alleni, più punti accumuli.' },
            { icon: '🎰', title: 'Gioca e vinci', desc: 'Usa i punti per slot machine, blackjack, aviator, coinflip e aprire crate.' },
            { icon: '📦', title: 'Colleziona item', desc: 'Apri crate per ottenere skin, badge e avatar rari. Costruisci la tua collezione.' },
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Games preview */}
      <section style={{ padding: '4rem 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>I giochi disponibili</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '2.5rem' }}>Cinque modi per usare i tuoi FitPoints</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {['🎰 Slot Machine', '✈️ Aviator', '🃏 Blackjack', '🪙 Coinflip', '📦 Crate'].map(g => (
              <div key={g} style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '0.8rem 1.5rem',
                fontWeight: 600,
                fontSize: '1rem',
              }}>{g}</div>
            ))}
          </div>
          <div style={{ marginTop: '2rem' }}>
            <Link href="/register">
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.7rem 2rem' }}>
                Registrati e inizia →
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
        FitCasino — Motiva il tuo allenamento 💪
      </footer>
    </main>
  )
}
