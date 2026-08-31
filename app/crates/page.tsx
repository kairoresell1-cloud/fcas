'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CRATE_COSTS } from '@/lib/points'
import { playSound } from '@/app/utils/audio'
import { ArrowLeft, Box, Gem, Sparkles, Crown } from 'lucide-react'

const CRATE_INFO = {
  basic: { label: 'Basic Crate', icon: Box, color: '#9ca3af', desc: 'Common & Rare items', border: 'border-gray-500', bg: 'bg-gray-500/10' },
  rare: { label: 'Rare Crate', icon: Gem, color: '#3b82f6', desc: 'Higher chance for Epic', border: 'border-blue-500', bg: 'bg-blue-500/10' },
  epic: { label: 'Epic Crate', icon: Sparkles, color: '#a855f7', desc: 'Epic & Legendary only', border: 'border-purple-500', bg: 'bg-purple-500/10' },
  legendary: { label: 'Legendary Crate', icon: Crown, color: '#eab308', desc: 'Only the best', border: 'border-yellow-500', bg: 'bg-yellow-500/10' },
}

const RARITY_STYLES: Record<string, { color: string, border: string, bg: string }> = {
  common: { color: 'text-gray-400', border: 'border-gray-500', bg: 'bg-gray-800' },
  rare: { color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-900/40' },
  epic: { color: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-900/40' },
  legendary: { color: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-900/40' }
}

type ItemType = { name: string; rarity: string; category: string }

export default function CratesPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [opening, setOpening] = useState<string | null>(null)
  const [item, setItem] = useState<ItemType | null>(null)
  const [error, setError] = useState('')
  
  // Roulette state
  const [rouletteItems, setRouletteItems] = useState<ItemType[]>([])
  const [isSpinning, setIsSpinning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
  }, [])

  // Generates dummy items for the roulette wheel
  const generateDummyItems = (finalItem: ItemType) => {
    const items: ItemType[] = []
    const rarities = ['common', 'rare', 'epic', 'legendary']
    const categories = ['badge', 'skin', 'avatar']
    
    for (let i = 0; i < 60; i++) {
      if (i === 50) {
        items.push(finalItem) // The winning item is at index 50
      } else {
        const randRarity = rarities[Math.floor(Math.random() * rarities.length)]
        items.push({
          name: `Mystery ${i}`,
          rarity: randRarity,
          category: categories[Math.floor(Math.random() * categories.length)]
        })
      }
    }
    return items
  }

  async function openCrate(tier: string) {
    if (isSpinning) return;
    
    setOpening(tier); setItem(null); setError(''); 
    
    try {
      const res = await fetch('/api/crate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })
      const data = await res.json()
      
      if (data.error) { 
        setError(data.error); 
        setOpening(null); 
        return 
      }
      
      setBalance(b => b !== null ? b - CRATE_COSTS[tier as keyof typeof CRATE_COSTS] : b)
      
      // Start Roulette Animation
      const items = generateDummyItems(data.item)
      setRouletteItems(items)
      setIsSpinning(true)
      
      // Sound effect loop for ticking
      let ticks = 0;
      const tickInterval = setInterval(() => {
        if (ticks < 30) {
          playSound('tick')
          ticks++;
        } else {
          clearInterval(tickInterval)
        }
      }, 150)
      
      // Wait for animation to finish
      setTimeout(() => {
        setIsSpinning(false)
        setItem(data.item)
        playSound('win')
        setOpening(null)
      }, 5500) // 5s animation + 0.5s buffer
      
    } catch (e) {
      console.error(e)
      setError('Something went wrong')
      setOpening(null)
    }
  }

  // Calculate the translate X amount to land exactly on item 50
  // Each item is 160px wide (w-40) + 16px gap (gap-4) = 176px total width
  // Center of screen needs to align with center of item 50.
  // We'll let Framer motion handle a fixed pixel translation.
  // 50 * 176 = 8800px offset. Minus half container width to center it.
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-sans selection:bg-purple-500/30">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Box className="text-purple-500" size={32} /> CRATES
            </h1>
          </div>
          <div className="bg-gray-900 border border-gray-800 px-6 py-2 rounded-full font-mono text-lg shadow-xl">
            <span className="text-gray-500 mr-2">BALANCE:</span>
            <span className="text-green-400 font-bold">{balance?.toLocaleString() ?? '---'} FP</span>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500 text-red-500 px-6 py-4 rounded-xl mb-8 font-bold flex items-center gap-3">
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">!</div>
            {error}
          </motion.div>
        )}

        {/* CS:GO Style Roulette Container */}
        <AnimatePresence>
          {(isSpinning || item) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12"
            >
              <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                
                {/* Center target line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500 z-20 shadow-[0_0_15px_#eab308] transform -translate-x-1/2"></div>
                
                {/* Gradient Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-900 to-transparent z-10"></div>

                <div className="overflow-hidden py-4" ref={containerRef}>
                  <motion.div 
                    className="flex gap-4 items-center"
                    initial={{ x: 0 }}
                    animate={{ 
                      // 50 items * (160px width + 16px gap) = 8800px.
                      // Adjust to center on item 50. Approx -8800px + center offset.
                      // We'll use a fixed value that looks good.
                      x: isSpinning ? -8620 : (item ? -8620 : 0) 
                    }}
                    transition={{ 
                      duration: 5, 
                      ease: [0.15, 0.8, 0.1, 1], // Custom easing resembling roulette spin
                    }}
                  >
                    {rouletteItems.map((ri, idx) => {
                      const style = RARITY_STYLES[ri.rarity] || RARITY_STYLES.common;
                      return (
                        <div 
                          key={idx} 
                          className={`flex-shrink-0 w-40 h-40 rounded-xl border-2 flex flex-col items-center justify-center ${style.bg} ${style.border} relative overflow-hidden`}
                        >
                          <div className="text-4xl mb-2 z-10">
                            {ri.category === 'badge' ? '🏅' : ri.category === 'skin' ? '✨' : '👤'}
                          </div>
                          <div className={`font-black text-sm z-10 ${style.color}`}>{ri.name || '???'}</div>
                          
                          {/* Inner glow */}
                          <div className={`absolute bottom-0 w-full h-1/2 bg-gradient-to-t ${style.color.replace('text-', 'from-').replace('-400', '-500')}/20 to-transparent`}></div>
                        </div>
                      )
                    })}
                  </motion.div>
                </div>
              </div>

              {/* Reveal Result Box */}
              {item && !isSpinning && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className={`mt-6 p-8 rounded-2xl border-2 text-center shadow-2xl relative overflow-hidden ${RARITY_STYLES[item.rarity].bg} ${RARITY_STYLES[item.rarity].border}`}
                >
                  <div className={`absolute inset-0 bg-${RARITY_STYLES[item.rarity].color.split('-')[1]}-500/10 animate-pulse`}></div>
                  <div className="relative z-10">
                    <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">You Unboxed</h3>
                    <div className="text-6xl mb-4">
                      {item.category === 'badge' ? '🏅' : item.category === 'skin' ? '✨' : '👤'}
                    </div>
                    <h2 className={`text-3xl font-black mb-1 drop-shadow-md ${RARITY_STYLES[item.rarity].color}`}>
                      {item.name}
                    </h2>
                    <div className="text-white/60 uppercase tracking-widest font-semibold text-sm">
                      {item.rarity} {item.category}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crate Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(CRATE_INFO).map(([tier, info]) => {
            const cost = CRATE_COSTS[tier as keyof typeof CRATE_COSTS]
            const canAfford = balance !== null && balance >= cost
            const isCurrentlyOpening = opening === tier
            const Icon = info.icon

            return (
              <div 
                key={tier} 
                className={`bg-gray-900 border-2 rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 ${
                  isCurrentlyOpening ? info.border + ' shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-105' : 'border-gray-800 hover:border-gray-700 hover:shadow-xl'
                }`}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${info.bg} ${info.border} border`}>
                  <Icon size={40} color={info.color} className={isCurrentlyOpening ? 'animate-bounce' : ''} />
                </div>
                
                <h3 className="text-xl font-black text-white mb-2" style={{ color: info.color }}>{info.label}</h3>
                <p className="text-gray-500 text-sm font-semibold mb-6 flex-1">{info.desc}</p>
                
                <div className="w-full bg-gray-950 rounded-xl p-3 mb-6 border border-gray-800">
                  <span className="text-gray-500 text-xs font-bold block mb-1">PRICE</span>
                  <span className="font-mono font-black text-xl text-white">{cost.toLocaleString()} FP</span>
                </div>

                <button
                  onClick={() => openCrate(tier)}
                  disabled={!canAfford || isSpinning || opening !== null}
                  className={`w-full py-4 rounded-xl font-black tracking-widest uppercase transition-all duration-200 ${
                    !canAfford 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : isCurrentlyOpening
                    ? 'bg-white text-black animate-pulse'
                    : 'hover:-translate-y-1 hover:shadow-lg'
                  }`}
                  style={{ 
                    backgroundColor: canAfford && !isCurrentlyOpening ? info.color : undefined,
                    color: canAfford && !isCurrentlyOpening ? '#000' : undefined
                  }}
                >
                  {isCurrentlyOpening ? 'Opening...' : !canAfford ? 'Need FP' : 'Open Crate'}
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
