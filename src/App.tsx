import { useCallback, useEffect, useState, useTransition, lazy, Suspense, useRef } from 'react'
import { Hud, Loader, StarfieldCss } from './components/Hud'
import {
  unlockAudio,
  playTossWhoosh,
  playCoinSpin,
  playCoinLand,
  playRevealChime,
} from './utils/sound'
import { randomFace, type Face, type TossPhase } from './utils/copy'
import './App.css'

const CoinScene = lazy(() =>
  import('./components/CoinScene').then((m) => ({ default: m.CoinScene })),
)

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export default function App() {
  const [phase, setPhase] = useState<TossPhase>('idle')
  const [result, setResult] = useState<Face | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [tossId, setTossId] = useState(0)
  const [muted, setMuted] = useState(false)
  const [ready, setReady] = useState(false)
  const [tossCount, setTossCount] = useState(0)
  const [, startTransition] = useTransition()
  const reducedMotion = useReducedMotion()
  const resultRef = useRef<Face | null>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 600)
    return () => clearTimeout(id)
  }, [])

  const play = useCallback(
    (fn: () => void) => {
      if (!muted) fn()
    },
    [muted],
  )

  const handleToss = useCallback(async () => {
    if (phase === 'tossing' || phase === 'landing') return
    await unlockAudio()

    const face = randomFace()
    resultRef.current = face
    startTransition(() => {
      setResult(face)
      setRevealed(false)
      setPhase('tossing')
      setTossId((n) => n + 1)
      setTossCount((n) => n + 1)
    })

    play(playTossWhoosh)
    window.setTimeout(() => play(playCoinSpin), 180)
  }, [phase, play])

  const handleLand = useCallback(() => {
    setPhase('landing')
    play(playCoinLand)
  }, [play])

  const handleRevealReady = useCallback(() => {
    setPhase('reveal')
    setRevealed(true)
    play(() => playRevealChime(resultRef.current === 'heads'))
    window.setTimeout(() => setPhase('idle'), 80)
  }, [play])

  const toggleMute = useCallback(async () => {
    await unlockAudio()
    setMuted((m) => !m)
  }, [])

  return (
    <div className={`app ${ready ? 'is-ready' : ''}`}>
      <StarfieldCss />
      <a className="skip-link" href="#toss-controls">
        Skip to toss controls
      </a>

      <Suspense fallback={null}>
        <CoinScene
          phase={phase === 'idle' && revealed ? 'reveal' : phase}
          result={result}
          tossId={tossId}
          onLand={handleLand}
          onRevealReady={handleRevealReady}
          reducedMotion={reducedMotion}
        />
      </Suspense>

      <div id="toss-controls" className="hud-layer">
        <Hud
          tossing={phase === 'tossing' || phase === 'landing'}
          result={result}
          revealed={revealed}
          muted={muted}
          onToss={handleToss}
          onToggleMute={toggleMute}
          tossCount={tossCount}
        />
      </div>

      <Loader visible={!ready} />
    </div>
  )
}
