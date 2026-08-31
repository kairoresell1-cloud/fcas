import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Card = { suit: string; value: string; num: number }
const SUITS = ['♠','♥','♦','♣']
const VALUES = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const value of VALUES) {
      const num = value === 'A' ? 11 : ['J','Q','K'].includes(value) ? 10 : parseInt(value)
      deck.push({ suit, value, num })
    }
  }
  return deck.sort(() => Math.random() - 0.5)
}

function handValue(hand: Card[]): number {
  let total = hand.reduce((s, c) => s + c.num, 0)
  let aces = hand.filter(c => c.value === 'A').length
  while (total > 21 && aces > 0) { total -= 10; aces-- }
  return total
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  const { bet, action, gameState } = await req.json()

  if (action === 'deal') {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.fitPoints < bet) return NextResponse.json({ error: 'Punti insufficienti' }, { status: 400 })
    await prisma.user.update({ where: { id: userId }, data: { fitPoints: { decrement: bet } } })
    const deck = createDeck()
    const playerHand = [deck.pop()!, deck.pop()!]
    const dealerHand = [deck.pop()!, deck.pop()!]
    const playerVal = handValue(playerHand)
    const state = { deck, playerHand, dealerHand, bet, status: playerVal === 21 ? 'blackjack' : 'playing' }
    if (state.status === 'blackjack') {
      const win = Math.floor(bet * 2.5)
      await prisma.$transaction([
        prisma.user.update({ where: { id: userId }, data: { fitPoints: { increment: win } } }),
        prisma.transaction.create({ data: { userId, type: 'earn', amount: win - bet, reason: 'Blackjack!' } })
      ])
    }
    return NextResponse.json({ gameState: state, playerValue: playerVal, dealerVisible: dealerHand[0] })
  }

  if (action === 'hit') {
    const { deck, playerHand, dealerHand, bet: savedBet } = gameState
    const newCard = deck.pop()!
    const newHand = [...playerHand, newCard]
    const val = handValue(newHand)
    const busted = val > 21
    if (busted) {
      await prisma.transaction.create({ data: { userId, type: 'spend', amount: savedBet, reason: 'Blackjack: bust' } })
    }
    return NextResponse.json({ gameState: { ...gameState, playerHand: newHand, deck, status: busted ? 'bust' : 'playing' }, playerValue: val })
  }

  if (action === 'stand') {
    let { deck, playerHand, dealerHand, bet: savedBet } = gameState
    while (handValue(dealerHand) < 17) dealerHand.push(deck.pop()!)
    const pVal = handValue(playerHand)
    const dVal = handValue(dealerHand)
    let result: string, net: number
    if (dVal > 21 || pVal > dVal) { result = 'win'; net = savedBet }
    else if (pVal === dVal) { result = 'push'; net = 0; await prisma.user.update({ where: { id: userId }, data: { fitPoints: { increment: savedBet } } }) }
    else { result = 'lose'; net = -savedBet }
    if (net > 0) await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { fitPoints: { increment: savedBet * 2 } } }),
      prisma.transaction.create({ data: { userId, type: 'earn', amount: net, reason: 'Blackjack: vinto' } })
    ])
    else if (net < 0) await prisma.transaction.create({ data: { userId, type: 'spend', amount: savedBet, reason: 'Blackjack: perso' } })
    return NextResponse.json({ result, dealerHand, dealerValue: dVal, playerValue: pVal })
  }

  return NextResponse.json({ error: 'Azione non valida' }, { status: 400 })
}
