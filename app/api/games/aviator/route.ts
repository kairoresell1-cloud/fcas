import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generateCrashPoint(): number {
  const r = Math.random()
  if (r < 0.01) return 1.0
  return Math.max(1.0, parseFloat((1 / (1 - r * 0.95)).toFixed(2)))
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const { bet, cashoutAt } = await req.json()
  if (!bet || bet < 1 || !cashoutAt || cashoutAt < 1) {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.fitPoints < bet) return NextResponse.json({ error: 'Punti insufficienti' }, { status: 400 })
  const crashAt = generateCrashPoint()
  const won = cashoutAt <= crashAt
  const multiplier = won ? cashoutAt : 0
  const winAmount = Math.floor(bet * multiplier)
  const net = winAmount - bet
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { fitPoints: { increment: net } } }),
    prisma.transaction.create({ data: { userId, type: net >= 0 ? 'earn' : 'spend', amount: Math.abs(net), reason: `Aviator: crash@${crashAt}x` } })
  ])
  return NextResponse.json({ crashAt, won, multiplier, winAmount, net, newBalance: user.fitPoints + net })
}
