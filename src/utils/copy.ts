export type Face = 'heads' | 'tails'
export type TossPhase = 'idle' | 'tossing' | 'landing' | 'reveal'

export interface TossState {
  phase: TossPhase
  result: Face | null
  tossId: number
}

export const COPY = {
  brand: 'COSMIC FLIP',
  tagline: '₹1 · deep space edition',
  idleHints: [
    'destiny’s buffering…',
    'vibes only. no mid energy.',
    'the cosmos is watching bestie',
    'one flip. zero excuses.',
  ],
  tossCta: 'yeet the coin',
  tossingCta: 'spinning the lore…',
  againCta: 'run it back',
  headsTitle: 'HEADS',
  tailsTitle: 'TAILS',
  headsSub: 'main character energy unlocked',
  tailsSub: 'plot twist? still iconic',
  loading: 'warming up the galaxy…',
  muteOn: 'unmute the chaos',
  muteOff: 'mute the chaos',
  a11yToss: 'Toss the Indian one rupee coin',
  a11yResult: (face: Face) => `Result: ${face}`,
} as const

export function randomFace(): Face {
  return Math.random() < 0.5 ? 'heads' : 'tails'
}

export function pickIdleHint(seed: number): string {
  return COPY.idleHints[seed % COPY.idleHints.length]
}
