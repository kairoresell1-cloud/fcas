import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CRATE_COSTS, openCrate } from '@/lib/points'

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const { tier } = await req.json() as { tier: keyof typeof CRATE_COSTS }
  const cost = CRATE_COSTS[tier]
  if (!cost) return NextResponse.json({ error: 'Tipo crate non valido' }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.fitPoints < cost) {
    return NextResponse.json({ error: 'FitPoints insufficienti' }, { status: 400 })
  }
  const item = openCrate(tier)
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { fitPoints: { decrement: cost } } }),
    prisma.item.create({ data: { userId, ...item } }),
    prisma.transaction.create({ data: { userId, type: 'spend', amount: cost, reason: `Crate ${tier}` } })
  ])
  return NextResponse.json({ success: true, item })
}
