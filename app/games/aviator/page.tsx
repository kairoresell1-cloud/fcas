'use client'
import { useState, useEffect, useRef } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '@/app/utils/audio'
import { Plane, ArrowLeft, Rocket, AlertTriangle, TrendingUp } from 'lucide-react'

export default function AviatorPage() {
  const [bet, setBet] = useState(20)
  const [cashoutAt, setCashoutAt] = useState(2.0)
  const [flying, setFlying] = useState(false)
  const [multiplier, setMultiplier] = useState(1.0)
  const [result, setResult] = useState<{ crashAt: number; won: boolean; winAmount: number; net: number } | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  async function launch() {
    if (flying || !balance || balance < bet) return
    setFlying(true); setResult(null); setMultiplier(1.0)
    playSound('fly')

    // Anima il moltiplicatore localmente in modo fluido
    let current = 1.0
    intervalRef.current = setInterval(() => {
      // Accelerazione esponenziale
      const increment = 0.01 + (current * 0.005);
      current = parseFloat((current + increment).toFixed(2))
      setMultiplier(current)
      
      // Suono periodico (motore)
      if (Math.random() > 0.8) playSound('tick')
    }, 50)

    const res = await fetch('/api/games/aviator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bet, cashoutAt })
    })
    const data = await res.json()

    // Calcolo delay fino al crash (es. a 1.0x è ~0s, a 2.0x è ~2s, etc.)
    // Adattato al nuovo incremento più lento e realistico
    const crashDelay = Math.max(500, (data.crashAt - 1) * 1500)
    
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setMultiplier(data.crashAt)
      setResult(data)
      setBalance(b => b !== null ? b + data.net : b)
      setFlying(false)
      
      playSound('crash')
      if (data.won) setTimeout(() => playSound('win'), 500)
    }, crashDelay)
  }

  const crashed = result && !flying
  
  // Calcolo per l'animazione della curva
  // Usiamo il moltiplicatore per determinare l'altezza e la larghezza della curva
  const progress = Math.min(100, (multiplier - 1) * 20); // Scala progressiva per la visuale
  const pathData = `M 0 300 Q ${progress * 1.5} ${300 - progress} ${progress * 3} ${300 - progress * 2.5}`;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-sans selection:bg-red-500/30">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-4">
            <Link href="/games" className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Plane className="text-red-500" size={32} /> AVIATOR
            </h1>
          </div>
          <div className="bg-gray-900 border border-gray-800 px-6 py-2 rounded-full font-mono text-lg shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <span className="text-gray-500 mr-2">BALANCE:</span>
            <span className="text-green-400 font-bold">{balance?.toLocaleString() ?? '---'} FP</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Game Canvas */}
          <div className="lg:col-span-2 relative">
            <div className={`relative w-full h-[450px] bg-gray-900 rounded-2xl border-2 overflow-hidden shadow-2xl transition-colors duration-500 ${
              flying ? 'border-red-500/50 shadow-red-500/20' : crashed ? (result.won ? 'border-green-500 shadow-green-500/30' : 'border-gray-700') : 'border-gray-800'
            }`}>
              
              {/* Background Grid & Stars */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

              {/* Multiplier Display */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
                <AnimatePresence mode="popLayout">
                  <motion.div 
                    key={multiplier}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2, position: 'absolute' }}
                    transition={{ duration: 0.1 }}
                    className={`text-7xl md:text-8xl font-black font-mono tracking-tighter ${
                      crashed ? 'text-red-500' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]'
                    }`}
                  >
                    {multiplier.toFixed(2)}x
                  </motion.div>
                </AnimatePresence>

                {crashed && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <div className="text-red-500 font-bold text-xl uppercase tracking-widest bg-red-500/10 inline-block px-4 py-1 rounded-full border border-red-500/30">
                      Flew Away
                    </div>
                  </motion.div>
                )}
                
                {!flying && !crashed && (
                  <div className="mt-4 text-gray-500 uppercase tracking-widest font-semibold animate-pulse">
                    Waiting for next round
                  </div>
                )}
              </div>

              {/* The Curve & Plane Animation */}
              <div className="absolute inset-0 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 500 400" preserveAspectRatio="none">
                  {flying && (
                    <motion.path
                      d={pathData}
                      fill="none"
                      stroke="url(#grad1)"
                      strokeWidth="4"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.5, ease: "linear" }}
                    />
                  )}
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Flying Plane Icon */}
                {flying && (
                  <motion.div
                    className="absolute text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                    animate={{
                      x: `${Math.min(90, progress * 0.6)}%`,
                      y: `${100 - Math.min(90, progress * 0.7)}%`,
                      rotate: Math.min(-10, -45 + (progress * 0.5)),
                    }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    style={{ left: 0, bottom: 0, marginLeft: '-15px', marginBottom: '-15px' }}
                  >
                    <Plane fill="currentColor" size={48} />
                  </motion.div>
                )}
              </div>

            </div>

            {/* Results Alert */}
            {crashed && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl border-2 flex items-center justify-between ${
                  result?.won 
                  ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                  : 'bg-red-500/10 border-red-500/50 text-red-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  {result?.won ? <TrendingUp size={24} /> : <AlertTriangle size={24} />}
                  <span className="font-bold text-lg">
                    {result?.won ? 'SUCCESSFUL CASHOUT' : 'CRASHED'}
                  </span>
                </div>
                <div className="text-xl font-black font-mono">
                  {result?.won ? `+${(result.winAmount - bet).toLocaleString()} FP` : `-${bet.toLocaleString()} FP`}
                </div>
              </motion.div>
            )}
          </div>

          {/* Controls Panel */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col shadow-xl">
            <h2 className="text-xl font-bold mb-6 text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-2">Bet Controls</h2>
            
            <div className="space-y-6 flex-1">
              {/* Bet Amount */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-400">AMOUNT</span>
                  <span className="text-white font-mono">{bet} FP</span>
                </div>
                <div className="bg-gray-950 p-1 rounded-lg border border-gray-800 flex items-center">
                  <button 
                    onClick={() => setBet(b => Math.max(10, b - 10))}
                    disabled={flying}
                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                  >-</button>
                  <input 
                    type="number"
                    value={bet}
                    onChange={e => setBet(Math.max(10, parseInt(e.target.value) || 10))}
                    disabled={flying}
                    className="flex-1 bg-transparent text-center text-white font-mono font-bold focus:outline-none"
                  />
                  <button 
                    onClick={() => setBet(b => Math.min(balance || 0, b + 10))}
                    disabled={flying}
                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
                  >+</button>
                </div>
                <div className="flex gap-2">
                  {[20, 50, 100, 'MAX'].map(val => (
                    <button 
                      key={val}
                      onClick={() => setBet(val === 'MAX' ? (balance || 0) : val as number)}
                      disabled={flying}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 text-xs py-2 rounded-md font-bold transition-colors disabled:opacity-50"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Cashout */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-400">AUTO CASHOUT</span>
                  <span className="text-green-400 font-mono">{cashoutAt.toFixed(2)}x</span>
                </div>
                <input 
                  type="range" 
                  min={1.1} max={10} step={0.1}
                  value={cashoutAt} 
                  onChange={e => setCashoutAt(parseFloat(e.target.value))}
                  disabled={flying}
                  className="w-full accent-green-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex gap-2">
                  {[1.5, 2.0, 3.0, 5.0].map(val => (
                    <button 
                      key={val}
                      onClick={() => setCashoutAt(val)}
                      disabled={flying}
                      className={`flex-1 text-xs py-2 rounded-md font-bold transition-colors disabled:opacity-50 border ${
                        cashoutAt === val 
                        ? 'bg-green-500/20 border-green-500 text-green-400' 
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {val.toFixed(2)}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex justify-between items-center mt-auto">
                <span className="text-gray-500 font-semibold text-sm">POTENTIAL PAYOUT</span>
                <span className="text-green-400 font-mono font-black text-xl">{Math.floor(bet * cashoutAt).toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={launch}
              disabled={flying || (balance !== null && balance < bet)}
              className={`w-full mt-6 py-5 rounded-xl font-black text-xl tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
                flying 
                ? 'bg-red-600 text-white cursor-not-allowed opacity-90' 
                : balance !== null && balance < bet
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-400 text-black hover:-translate-y-1 hover:shadow-green-500/30'
              }`}
            >
              {flying ? (
                <>
                  <Plane className="animate-pulse" /> FLYING...
                </>
              ) : (
                <>
                  <Rocket /> PLACE BET
                </>
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
