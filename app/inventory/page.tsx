'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

interface Item { id: string; name: string; rarity: string; category: string; obtainedAt: string }
const RARITY_COLORS: Record<string, string> = { common: '#aaa', rare: 'var(--blue)', epic: 'var(--purple)', legendary: 'var(--gold)' }
const CAT_ICONS: Record<string, string> = { badge: '🏅', skin: '✨', avatar: '👤' }

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (!d.user) window.location.href = '/login' })
    fetch('/api/inventory').then(r => r.json()).then(d => setItems(d.items || []))
  }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.rarity === filter || i.category === filter)

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>🎒 Inventario</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem' }}>{items.length} oggetti collezionati</p>

        {/* Filtri */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'common', 'rare', 'epic', 'legendary', 'badge', 'skin', 'avatar'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.3rem 0.9rem', borderRadius: '20px', border: '1px solid var(--border)',
              background: filter === f ? 'var(--neon)' : 'var(--surface2)',
              color: filter === f ? '#000' : 'var(--text-dim)',
              cursor: 'pointer', fontWeight: filter === f ? 700 : 400, fontSize: '0.85rem',
              textTransform: 'capitalize'
            }}>{f}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
            <p>Nessun oggetto. Apri qualche cassa!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {filtered.map(item => (
              <div key={item.id} style={{
                background: 'var(--surface)', border: `1px solid ${RARITY_COLORS[item.rarity]}44`,
                borderRadius: '10px', padding: '1rem', textAlign: 'center',
                boxShadow: item.rarity === 'legendary' ? `0 0 15px ${RARITY_COLORS[item.rarity]}33` : 'none'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{CAT_ICONS[item.category] || '✨'}</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: RARITY_COLORS[item.rarity], marginBottom: '0.3rem' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                  {item.rarity} · {item.category}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                  {new Date(item.obtainedAt).toLocaleDateString('it-IT')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
