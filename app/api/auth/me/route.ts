import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ user: null })
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, fitPoints: true, totalEarned: true, createdAt: true }
  })
  return NextResponse.json({ user })
}
