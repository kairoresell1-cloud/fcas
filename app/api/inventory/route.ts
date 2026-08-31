import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { obtainedAt: 'desc' }
  })
  return NextResponse.json({ items })
}
