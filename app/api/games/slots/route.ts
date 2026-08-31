import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SYMBOLS = ['🏋️', '🏃', '⚽', '🎯', '💪', '🔥', '⭐', '👑']

function spin() {
  return [0,1,2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
}

function calculateWin(reels: string[], bet: number): number {
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    if (reels[0] === '👑') return bet * 50
    if (reels[0] === '⭐') return bet * 20
    if (reels[0] === '🔥') return bet * 10
    return bet * 5
  }
  if (reels[0] === reels[1] || reels[1] === reels[2]) return bet * 1.5
  return 0
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const { bet } = await req.json()
  if (!bet || bet < 1) return NextResponse.json({ error: 'Bet non valida' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.fitPoints < bet) return NextResponse.json({ error: 'Punti insufficienti' }, { status: 400 })
  const reels = spin()
  const win = Math.floor(calculateWin(reels, bet))
  const net = win - bet
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { fitPoints: { increment: net } } }),
    prisma.transaction.create({ data: { userId, type: net >= 0 ? 'earn' : 'spend', amount: Math.abs(net), reason: `Slot: ${reels.join(' ')}` } })
  ])
  return NextResponse.json({ reels, win, net, newBalance: user.fitPoints + net })
}
