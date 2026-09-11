import { useEffect, useId, useRef, useState } from 'react'
import { COPY, pickIdleHint, type Face } from '../utils/copy'

interface HudProps {
  tossing: boolean
  result: Face | null
  revealed: boolean
  muted: boolean
  onToss: () => void
  onToggleMute: () => void
  tossCount: number
}

export function Hud({
  tossing,
  result,
  revealed,
  muted,
  onToss,
  onToggleMute,
  tossCount,
}: HudProps) {
  const hint = pickIdleHint(tossCount)
  const resultId = useId()
  const [pulse, setPulse] = useState(false)
  const prevReveal = useRef(false)

  useEffect(() => {
    if (revealed && result && !prevReveal.current) {
      setPulse(true)
      const id = window.setTimeout(() => setPulse(false), 700)
      prevReveal.current = true
      return () => clearTimeout(id)
    }
    if (!revealed) prevReveal.current = false
  }, [revealed, result])

  const cta = tossing ? COPY.tossingCta : result && revealed ? COPY.againCta : COPY.tossCta

  return (
    <div className="hud">
      <header className="hud-top">
        <div className="brand-block">
          <p className="brand">{COPY.brand}</p>
          <p className="tagline">{COPY.tagline}</p>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? COPY.muteOn : COPY.muteOff}
        >
          {muted ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 5 6 9H3v6h3l5 4V5z" />
              <path d="m22 9-6 6M16 9l6 6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 5 6 9H3v6h3l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          )}
        </button>
      </header>

      <div className="hud-center" aria-live="polite">
        {!revealed && !tossing && (
          <p className="hint fade-in" key={hint}>
            {hint}
          </p>
        )}

        {tossing && (
          <p className="hint tossing-hint fade-in">in orbit… hold that thought</p>
        )}
      </div>

      <footer className="hud-bottom">
        {revealed && result && (
          <div
            className={`result-card ${pulse ? 'result-pulse' : ''} ${result}`}
            id={resultId}
            role="status"
          >
            <p className="result-kicker">the universe said</p>
            <h2 className="result-title">
              {result === 'heads' ? COPY.headsTitle : COPY.tailsTitle}
            </h2>
            <p className="result-sub">
              {result === 'heads' ? COPY.headsSub : COPY.tailsSub}
            </p>
          </div>
        )}
        <button
          type="button"
          className={`toss-btn ${tossing ? 'is-busy' : ''}`}
          onClick={onToss}
          disabled={tossing}
          aria-label={COPY.a11yToss}
          aria-describedby={revealed && result ? resultId : undefined}
        >
          <span className="toss-btn-glow" aria-hidden="true" />
          <span className="toss-btn-label">{cta}</span>
        </button>
        <p className="micro">tap · click · commit to the bit</p>
      </footer>
    </div>
  )
}

export function Loader({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader-orb" aria-hidden="true" />
      <p>{COPY.loading}</p>
    </div>
  )
}

export function StarfieldCss() {
  return (
    <div className="starfield" aria-hidden="true">
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="twinkle" />
    </div>
  )
}
