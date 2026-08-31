export const ACTIVITY_POINTS: Record<string, number> = {
  corsa: 10,
  palestra: 8,
  nuoto: 12,
  ciclismo: 7,
  yoga: 5,
  calcio: 9,
  basket: 9,
  tennis: 8,
  crossfit: 11,
  camminata: 4,
}

export function calculatePoints(type: string, duration: number): number {
  const basePoints = ACTIVITY_POINTS[type] || 6
  // 1 punto base per minuto * moltiplicatore attività
  return Math.floor((duration / 10) * basePoints)
}

export const CRATE_COSTS = {
  basic: 50,
  rare: 150,
  epic: 400,
  legendary: 1000,
}

export const ITEMS_POOL = {
  basic: [
    { name: 'Guantoni da Box', rarity: 'common', category: 'badge' },
    { name: 'Scarpe da Corsa', rarity: 'common', category: 'badge' },
    { name: 'Bottiglia Sport', rarity: 'common', category: 'badge' },
    { name: 'Fascia Fitness', rarity: 'rare', category: 'skin' },
    { name: 'Cronometro Pro', rarity: 'rare', category: 'skin' },
  ],
  rare: [
    { name: 'Medaglia d\'Oro', rarity: 'rare', category: 'badge' },
    { name: 'Jersey Campione', rarity: 'rare', category: 'skin' },
    { name: 'Avatar Sprinter', rarity: 'epic', category: 'avatar' },
    { name: 'Trofeo Ferro', rarity: 'epic', category: 'badge' },
  ],
  epic: [
    { name: 'Armatura da Warrior', rarity: 'epic', category: 'skin' },
    { name: 'Aura Fuoco', rarity: 'epic', category: 'skin' },
    { name: 'Avatar Leggenda', rarity: 'legendary', category: 'avatar' },
    { name: 'Corona del Campione', rarity: 'legendary', category: 'badge' },
  ],
  legendary: [
    { name: 'Tuta Gold Edition', rarity: 'legendary', category: 'skin' },
    { name: 'Avatar Olimpico', rarity: 'legendary', category: 'avatar' },
    { name: 'Diamante Fit', rarity: 'legendary', category: 'badge' },
  ],
}

export function openCrate(tier: keyof typeof ITEMS_POOL) {
  const pool = ITEMS_POOL[tier]
  const item = pool[Math.floor(Math.random() * pool.length)]
  return item
}
