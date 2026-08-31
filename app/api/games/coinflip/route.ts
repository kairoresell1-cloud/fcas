import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const { bet, choice } = await req.json()
  if (!bet || bet < 1 || !['testa','croce'].includes(choice)) {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.fitPoints < bet) return NextResponse.json({ error: 'Punti insufficienti' }, { status: 400 })
  const result = Math.random() < 0.5 ? 'testa' : 'croce'
  const won = result === choice
  const net = won ? bet : -bet
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { fitPoints: { increment: net } } }),
    prisma.transaction.create({ data: { userId, type: won ? 'earn' : 'spend', amount: bet, reason: `Coinflip: ${result}` } })
  ])
  return NextResponse.json({ result, won, net, newBalance: user.fitPoints + net })
}
