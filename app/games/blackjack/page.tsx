'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '@/app/utils/audio'
import { ArrowLeft, Play, Hand, Search, Undo2 } from 'lucide-react'

interface Card { suit: string; value: string; num: number }

const isRed = (suit: string) => ['♥', '♦'].includes(suit)

function CardUI({ card, hidden = false, index = 0 }: { card?: Card; hidden?: boolean; index?: number }) {
  // Animazione carta distribuita che scivola da fuori schermo (es. alto a destra)
  const initialAnim = { opacity: 0, x: 200, y: -100, rotate: 180 }
  const animateAnim = { opacity: 1, x: 0, y: 0, rotate: 0 }

  if (hidden) {
    return (
      <motion.div
        initial={initialAnim} animate={animateAnim} transition={{ duration: 0.4, delay: index * 0.1 }}
        className="w-24 h-36 rounded-xl border-4 border-white shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden"
        style={{
          background: 'repeating-linear-gradient(45deg, #1e3a8a 0, #1e3a8a 5px, #1e40af 5px, #1e40af 10px)',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="w-16 h-28 border-2 border-white/50 rounded-lg"></div>
      </motion.div>
    )
  }

  if (!card) return null;

  const colorClass = isRed(card.suit) ? 'text-red-600' : 'text-gray-900'
  
  return (
    <motion.div
      initial={initialAnim} animate={animateAnim} transition={{ type: "spring", stiffness: 100, damping: 15, delay: index * 0.1 }}
      className="w-24 h-36 bg-white rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex flex-col relative border border-gray-200"
    >
      {/* Angolo superiore sinistro */}
      <div className={`absolute top-2 left-2 flex flex-col items-center ${colorClass} leading-none`}>
        <span className="font-bold text-lg font-serif">{card.value}</span>
        <span className="text-xl">{card.suit}</span>
      </div>
      
      {/* Centro */}
      <div className={`flex-1 flex items-center justify-center ${colorClass}`}>
        <span className="text-5xl drop-shadow-sm">{card.suit}</span>
      </div>

      {/* Angolo inferiore destro (capovolto) */}
      <div className={`absolute bottom-2 right-2 flex flex-col items-center ${colorClass} leading-none rotate-180`}>
        <span className="font-bold text-lg font-serif">{card.value}</span>
        <span className="text-xl">{card.suit}</span>
      </div>
    </motion.div>
  )
}

export default function BlackjackPage() {
  const [bet, setBet] = useState(20)
  const [balance, setBalance] = useState<number | null>(null)
  const [gameState, setGameState] = useState<any>(null)
  const [playerValue, setPlayerValue] = useState(0)
  const [dealerVisible, setDealerVisible] = useState<Card | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ result: string; dealerHand: Card[]; dealerValue: number; playerValue: number } | null>(null)
  const [status, setStatus] = useState<string>('idle')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) window.location.href = '/login'
      else setBalance(d.user.fitPoints)
    })
  }, [])

  async function deal() {
    setLoading(true); setResult(null); setStatus('playing'); playSound('tick')
    try {
      const res = await fetch('/api/games/blackjack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet, action: 'deal' })
      })
      const data = await res.json()
      setGameState(data.gameState)
      setPlayerValue(data.playerValue)
      setDealerVisible(data.dealerVisible)
      setBalance(b => b !== null ? b - bet : b)
      
      if (data.gameState.status === 'blackjack') {
        setStatus('blackjack')
        setBalance(b => b !== null ? b + Math.floor(bet * 2.5) : b)
        setTimeout(() => playSound('win'), 1000)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function action(act: 'hit' | 'stand') {
    setLoading(true); playSound('tick')
    try {
      const res = await fetch('/api/games/blackjack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: act, gameState })
      })
      const data = await res.json()
      
      if (act === 'hit') {
        setGameState(data.gameState)
        setPlayerValue(data.playerValue)
        if (data.gameState.status === 'bust') {
          setStatus('bust')
          setTimeout(() => playSound('crash'), 500)
        }
      } else {
        setResult(data)
        setStatus(data.result)
        if (data.result === 'win') {
          setBalance(b => b !== null ? b + bet * 2 : b)
          setTimeout(() => playSound('win'), 1000)
        } else if (data.result === 'push') {
          setBalance(b => b !== null ? b + bet : b)
        } else {
          setTimeout(() => playSound('crash'), 1000)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function reset() { setGameState(null); setResult(null); setStatus('idle'); setDealerVisible(null); setPlayerValue(0) }

  if (!isMounted) return null;

  const playing = status === 'playing'
  const playerHand: Card[] = gameState?.playerHand || []
  const dealerFinalHand: Card[] = result?.dealerHand || (dealerVisible ? [dealerVisible] : [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/games" className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-red-500 text-4xl">♥</span> BLACKJACK
            </h1>
          </div>
          <div className="bg-gray-900 border border-gray-800 px-6 py-2 rounded-full font-mono text-lg shadow-xl">
            <span className="text-gray-500 mr-2">BALANCE:</span>
            <span className="text-green-400 font-bold">{balance?.toLocaleString() ?? '---'} FP</span>
          </div>
        </div>

        {/* 
          TAVOLO REALISTICO (FELTRO)
          Usiamo radial-gradient per simulare l'illuminazione sul panno verde
        */}
        <div className="relative w-full rounded-[2.5rem] border-[12px] border-[#3e2723] shadow-[inset_0_0_50px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden" 
             style={{ background: 'radial-gradient(circle at 50% -20%, #1b5e20 0%, #003300 80%)', minHeight: '600px' }}>
          
          {/* Faint Table Markings */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-20">
            <div className="w-2/3 h-2/3 border-4 border-yellow-500/50 rounded-[4rem] flex flex-col items-center justify-center">
              <h2 className="text-4xl font-serif text-yellow-500 tracking-[0.5em] mb-4">BLACKJACK</h2>
              <p className="text-xl font-serif text-yellow-500 tracking-widest">PAYS 3 TO 2</p>
              <p className="text-md font-serif text-yellow-500 mt-2">Dealer must draw to 16 and stand on all 17s</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between p-8">
            
            {/* DEALER SECTION */}
            <div className="flex flex-col items-center">
              <div className="bg-black/40 px-6 py-1 rounded-full text-gray-300 font-bold tracking-widest text-sm mb-4 border border-white/10 shadow-lg">
                DEALER {result ? `< ${result.dealerValue} >` : ''}
              </div>
              
              <div className="flex justify-center -space-x-12 relative h-36">
                {dealerFinalHand.map((c, i) => (
                  <div key={`d-${i}`} className="relative transition-transform hover:-translate-y-4">
                    <CardUI card={c} index={i} />
                  </div>
                ))}
                {!result && gameState && (
                  <div className="relative">
                    <CardUI hidden={true} index={1} />
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGE OVERLAY */}
            <AnimatePresence>
              {status !== 'idle' && status !== 'playing' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                >
                  <div className={`px-10 py-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 backdrop-blur-sm text-center ${
                    ['win','blackjack'].includes(status) ? 'bg-green-900/80 border-green-400 text-green-300' : 
                    status === 'push' ? 'bg-yellow-900/80 border-yellow-400 text-yellow-300' : 
                    'bg-red-900/80 border-red-500 text-red-200'
                  }`}>
                    <h2 className="text-5xl font-black uppercase tracking-widest mb-2 drop-shadow-lg">
                      {status === 'win' && 'YOU WIN'}
                      {status === 'blackjack' && 'BLACKJACK!'}
                      {status === 'push' && 'PUSH'}
                      {status === 'lose' && 'DEALER WINS'}
                      {status === 'bust' && 'BUST'}
                    </h2>
                    {['win','blackjack'].includes(status) && (
                      <p className="text-2xl font-mono text-white">+{Math.floor(bet * (status === 'blackjack' ? 2.5 : 2)).toLocaleString()} FP</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PLAYER SECTION */}
            <div className="flex flex-col items-center mt-auto">
              <div className="flex justify-center -space-x-12 relative h-36 mt-20">
                {playerHand.map((c, i) => (
                  <div key={`p-${i}`} className="relative transition-transform hover:-translate-y-4">
                    <CardUI card={c} index={i} />
                  </div>
                ))}
              </div>
              
              <div className="bg-black/40 px-8 py-2 rounded-full text-white font-black tracking-widest text-xl mt-4 border border-white/20 shadow-lg flex items-center gap-3">
                PLAYER {playerValue > 0 && <span className={playerValue > 21 ? 'text-red-500' : 'text-green-400'}>{playerValue}</span>}
              </div>
            </div>

          </div>
        </div>

        {/* CONTROLS (Below the table) */}
        <div className="mt-8 bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl max-w-2xl mx-auto">
          {status === 'idle' ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span className="text-gray-400">YOUR BET</span>
                  <span className="text-yellow-400 font-mono font-bold text-lg">{bet} FP</span>
                </div>
                <input 
                  type="range" min={10} max={Math.min(500, balance || 500)} step={10}
                  value={bet} onChange={e => setBet(parseInt(e.target.value))}
                  className="w-full accent-yellow-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer mb-4" 
                />
                <div className="flex gap-2">
                  {[10, 50, 100, 200, 500].map(v => (
                    <button key={v} onClick={() => setBet(v)} className={`flex-1 py-2 rounded font-bold transition-colors ${bet === v ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-black text-xl rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={deal} disabled={loading || (balance !== null && balance < bet)}
              >
                <Play fill="currentColor" /> DEAL
              </button>
            </div>
          ) : playing ? (
            <div className="flex gap-4">
              <button 
                className="flex-1 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={() => action('hit')} disabled={loading}
              >
                <Hand /> HIT
              </button>
              <button 
                className="flex-1 py-5 bg-red-600 hover:bg-red-500 text-white font-black text-xl rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={() => action('stand')} disabled={loading}
              >
                <Hand className="rotate-90" /> STAND
              </button>
            </div>
          ) : (
            <button 
              className="w-full py-5 bg-gray-800 hover:bg-gray-700 text-white font-black text-xl rounded-xl border border-gray-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              onClick={reset}
            >
              <Undo2 /> NEW GAME
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
