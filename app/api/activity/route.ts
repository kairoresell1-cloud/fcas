import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculatePoints } from '@/lib/points'

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const { type, duration } = await req.json()
  if (!type || !duration || duration < 1) {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }
  const points = calculatePoints(type, duration)
  const [activity] = await prisma.$transaction([
    prisma.activity.create({ data: { userId, type, duration, points } }),
    prisma.user.update({
      where: { id: userId },
      data: { fitPoints: { increment: points }, totalEarned: { increment: points } }
    }),
    prisma.transaction.create({
      data: { userId, type: 'earn', amount: points, reason: `${type} - ${duration} min` }
    })
  ])
  return NextResponse.json({ success: true, points, activity })
}

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const activities = await prisma.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20
  })
  return NextResponse.json({ activities })
}
