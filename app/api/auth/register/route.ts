import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json()
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 })
    }
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    })
    if (exists) {
      return NextResponse.json({ error: 'Username o email già in uso' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, email, password: hashed }
    })
    const token = signToken(user.id)
    const res = NextResponse.json({ success: true, user: { id: user.id, username: user.username, fitPoints: user.fitPoints } })
    res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}
