'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '@/app/utils/audio'
import { ArrowLeft, Play, History, Info } from 'lucide-react'

const SYMBOLS = ['🏋️', '🏃', '⚽', '🎯', '💪', '🔥', '⭐', '👑']

export default function SlotsPage() {
  const [bet, setBet] = useState(10)
  const [reels, setReels] = useState(['👑', '⭐', '🔥'])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ win: number; net: number } | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Local state for animation to create the blur effect
  const [blurReels, setBlurReels] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
  }, [])

  async function spin() {
    if (spinning || balance === null || balance < bet) return
    setSpinning(true); setResult(null); setBlurReels(true);
    
    let ticks = 0
    const tickInterval = setInterval(() => {
      if (ticks < 15) { playSound('tick'); ticks++; }
    }, 100)

    try {
      const res = await fetch('/api/games/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet })
      })
      const data = await res.json()
      
      setTimeout(() => {
        clearInterval(tickInterval)
        setBlurReels(false)
        setReels(data.reels)
        setResult({ win: data.win, net: data.net })
        setBalance(data.newBalance)
        setHistory(h => [`${data.reels.join(' | ')}  ➔  ${data.net >= 0 ? '+' : ''}${data.net} FP`, ...h.slice(0, 4)])
        setSpinning(false)

        if (data.net > 0) {
          setTimeout(() => playSound('win'), 200)
        } else {
          setTimeout(() => playSound('crash'), 200)
        }
      }, 1500) // 1.5s di suspense
    } catch (e) {
      console.error(e)
      setSpinning(false)
      setBlurReels(false)
    }
  }

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-8 flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/games" className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-yellow-500">🎰</span> SLOTS
            </h1>
          </div>
          <div className="bg-gray-900 border border-gray-800 px-6 py-2 rounded-full font-mono text-lg shadow-xl flex items-center gap-2">
            <span className="text-gray-500">BALANCE:</span>
            <span className="text-green-400 font-bold">{balance?.toLocaleString() ?? '---'} FP</span>
          </div>
        </div>

        {/* 
          VEGAS STYLE SLOT MACHINE CONTAINER 
        */}
        <div className="relative p-6 md:p-10 rounded-[3rem] bg-gradient-to-b from-gray-700 via-gray-900 to-black border-4 border-gray-600 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_5px_15px_rgba(255,255,255,0.2)] w-full max-w-3xl">
          
          {/* Neon Top Banner */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-yellow-500 px-8 py-2 rounded-full shadow-[0_0_20px_#eab308]">
            <h2 className="text-2xl font-black text-yellow-500 tracking-[0.3em] uppercase drop-shadow-[0_0_5px_#eab308]">Jackpot</h2>
          </div>

          {/* INNER MACHINE AREA */}
          <div className="bg-black p-4 md:p-8 rounded-2xl border-4 border-gray-800 shadow-[inset_0_0_30px_rgba(0,0,0,1)] relative mt-4">
            
            {/* Payline indicator */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-20 pointer-events-none transform -translate-y-1/2"></div>
            
            {/* The Reels */}
            <div className="flex justify-center gap-2 md:gap-6 relative z-10">
              {reels.map((symbol, i) => (
                <div key={i} className="w-24 h-32 md:w-32 md:h-40 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center shadow-[inset_0_10px_20px_rgba(0,0,0,0.4)] overflow-hidden relative">
                  
                  {/* Glass reflection */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/30 pointer-events-none z-10"></div>
                  
                  <motion.div 
                    animate={
                      blurReels 
                      ? { y: [0, 200, -200, 0], filter: ['blur(0px)', 'blur(8px)', 'blur(8px)', 'blur(0px)'] } 
                      : { y: 0, filter: 'blur(0px)' }
                    }
                    transition={
                      blurReels 
                      ? { repeat: Infinity, duration: 0.15, ease: "linear", delay: i * 0.05 } 
                      : { type: "spring", stiffness: 100, damping: 10 }
                    }
                    className="text-6xl md:text-7xl absolute"
                  >
                    {blurReels ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : symbol}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* WIN/LOSE DISPLAY (LED SCREEN) */}
          <div className="mt-8 mx-auto w-3/4 h-16 bg-black border-4 border-gray-800 rounded-lg flex items-center justify-center overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
            <AnimatePresence mode="popLayout">
              {result && !spinning ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className={`text-xl md:text-2xl font-black font-mono tracking-widest ${result.net >= 0 ? 'text-green-500 drop-shadow-[0_0_10px_#22c55e]' : 'text-red-500 drop-shadow-[0_0_10px_#ef4444]'}`}
                >
                  {result.net >= 0 ? `WIN: ${result.win} FP` : `LOSS: ${bet} FP`}
                </motion.div>
              ) : spinning ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-yellow-500 font-black font-mono tracking-widest text-xl drop-shadow-[0_0_10px_#eab308] animate-pulse">
                  SPINNING...
                </motion.div>
              ) : (
                <div className="text-gray-600 font-black font-mono tracking-widest text-xl">
                  INSERT BET
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* CONTROLS BELOW MACHINE */}
        <div className="w-full max-w-3xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bet Panel */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl md:col-span-2">
            <div className="flex justify-between items-center text-sm font-semibold mb-4">
              <span className="text-gray-400 uppercase tracking-widest">Bet Amount</span>
              <span className="text-yellow-400 font-mono font-bold text-xl">{bet} FP</span>
            </div>
            
            <input 
              type="range" min={5} max={Math.min(500, balance || 500)} step={5}
              value={bet} onChange={e => setBet(parseInt(e.target.value))}
              disabled={spinning}
              className="w-full accent-yellow-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer mb-6 disabled:opacity-50" 
            />
            
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map(v => (
                <button 
                  key={v} onClick={() => setBet(v)} disabled={spinning}
                  className={`py-3 rounded-lg font-black transition-colors disabled:opacity-50 ${bet === v ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Spin Button */}
          <button 
            className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 border-4 border-red-800 text-white font-black text-3xl uppercase tracking-widest rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.5),inset_0_5px_15px_rgba(255,255,255,0.3)] hover:-translate-y-2 active:translate-y-2 active:shadow-none transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-full min-h-[120px]"
            onClick={spin} disabled={spinning || (balance !== null && balance < bet)}
          >
            <Play size={40} fill="currentColor" />
            SPIN
          </button>
        </div>

        {/* INFO & HISTORY */}
        <div className="w-full max-w-3xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4 border-b border-gray-800 pb-2"><Info size={16}/> Paytable</h3>
            <ul className="space-y-2 text-sm font-mono">
              <li className="flex justify-between"><span className="text-yellow-500">👑👑👑</span> <span>x50</span></li>
              <li className="flex justify-between"><span className="text-yellow-500">⭐⭐⭐</span> <span>x20</span></li>
              <li className="flex justify-between"><span className="text-red-500">🔥🔥🔥</span> <span>x10</span></li>
              <li className="flex justify-between"><span className="text-white">Any 3 matches</span> <span>x5</span></li>
              <li className="flex justify-between text-gray-400"><span className="text-white">Any 2 matches</span> <span>x1.5</span></li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-4 border-b border-gray-800 pb-2"><History size={16}/> Recent Spins</h3>
            {history.length === 0 ? (
              <div className="text-gray-600 text-sm italic text-center py-4">No spins yet</div>
            ) : (
              <ul className="space-y-3 font-mono text-sm">
                {history.map((h, i) => {
                  const isWin = h.includes('+');
                  return (
                    <li key={i} className={`flex justify-between ${isWin ? 'text-green-400' : 'text-red-500'}`}>
                      <span>{h.split('➔')[0]}</span>
                      <span className="font-bold">{isWin ? '+' : ''}{h.split('➔')[1]}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
