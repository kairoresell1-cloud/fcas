import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ error: 'Credenziali errate' }, { status: 401 })
    }
    const token = signToken(user.id)
    const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, fitPoints: user.fitPoints } })
    res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
    return res
  } catch {
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
