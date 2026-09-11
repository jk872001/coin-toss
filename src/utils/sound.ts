/** Lightweight procedural coin-toss SFX via Web Audio (no asset download). */

let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new AudioContext()
  }
  return sharedCtx
}

function tone(
  ctx: AudioContext,
  {
    type = 'sine',
    freq,
    freqEnd,
    start,
    dur,
    gain = 0.15,
    gainEnd = 0.0001,
  }: {
    type?: OscillatorType
    freq: number
    freqEnd?: number
    start: number
    dur: number
    gain?: number
    gainEnd?: number
  },
) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), start + dur)
  }
  g.gain.setValueAtTime(gain, start)
  g.gain.exponentialRampToValueAtTime(Math.max(gainEnd, 0.0001), start + dur)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

function noiseBurst(ctx: AudioContext, start: number, dur: number, gain = 0.08) {
  const len = Math.floor(ctx.sampleRate * dur)
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2400
  filter.Q.value = 0.8
  const g = ctx.createGain()
  g.gain.setValueAtTime(gain, start)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(ctx.destination)
  src.start(start)
  src.stop(start + dur + 0.02)
}

export async function unlockAudio(): Promise<void> {
  const ctx = getCtx()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}

export function playTossWhoosh(): void {
  const ctx = getCtx()
  const t = ctx.currentTime
  noiseBurst(ctx, t, 0.28, 0.06)
  tone(ctx, { type: 'triangle', freq: 420, freqEnd: 180, start: t, dur: 0.22, gain: 0.05 })
}

export function playCoinSpin(): void {
  const ctx = getCtx()
  const t = ctx.currentTime
  for (let i = 0; i < 6; i++) {
    const s = t + i * 0.07
    tone(ctx, {
      type: 'square',
      freq: 900 - i * 40,
      freqEnd: 600,
      start: s,
      dur: 0.05,
      gain: 0.025 * (1 - i * 0.1),
    })
    noiseBurst(ctx, s, 0.04, 0.03)
  }
}

export function playCoinLand(): void {
  const ctx = getCtx()
  const t = ctx.currentTime
  noiseBurst(ctx, t, 0.08, 0.12)
  tone(ctx, { type: 'triangle', freq: 680, freqEnd: 220, start: t, dur: 0.18, gain: 0.14 })
  tone(ctx, { type: 'sine', freq: 1360, freqEnd: 400, start: t + 0.01, dur: 0.12, gain: 0.06 })
  // Soft bounce ring
  tone(ctx, { type: 'sine', freq: 520, freqEnd: 260, start: t + 0.12, dur: 0.15, gain: 0.05 })
  noiseBurst(ctx, t + 0.14, 0.05, 0.04)
}

export function playRevealChime(isHeads: boolean): void {
  const ctx = getCtx()
  const t = ctx.currentTime
  const base = isHeads ? 523.25 : 392 // C5 vs G4
  tone(ctx, { type: 'sine', freq: base, start: t, dur: 0.35, gain: 0.08 })
  tone(ctx, { type: 'sine', freq: base * 1.5, start: t + 0.06, dur: 0.4, gain: 0.05 })
  tone(ctx, { type: 'triangle', freq: base * 2, start: t + 0.12, dur: 0.45, gain: 0.03 })
}
