import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  createHeadsTexture,
  createTailsTexture,
  createEdgeTexture,
} from '../utils/coinTextures'
import type { Face, TossPhase } from '../utils/copy'

interface CoinProps {
  phase: TossPhase
  result: Face | null
  tossId: number
  onLand: () => void
  onRevealReady: () => void
  reducedMotion: boolean
}

const RADIUS = 1
const HEIGHT = 0.09
const TOSS_DURATION = 2.35
const LAND_SETTLE = 0.4

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function easeOutBounce(t: number) {
  const n1 = 7.5625
  const d1 = 2.75
  if (t < 1 / d1) return n1 * t * t
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
  return n1 * (t -= 2.625 / d1) * t + 0.984375
}

export function Coin({
  phase,
  result,
  tossId,
  onLand,
  onRevealReady,
  reducedMotion,
}: CoinProps) {
  const group = useRef<THREE.Group>(null)
  const phaseRef = useRef(phase)
  const resultRef = useRef(result)
  const elapsed = useRef(0)
  const landed = useRef(false)
  const revealed = useRef(false)
  const spinSeed = useRef(1)
  const restRot = useRef({ x: 0, y: 0, z: 0 })
  const totalFlips = useRef(8)

  phaseRef.current = phase
  resultRef.current = result

  const materials = useMemo(() => {
    const headsMap = createHeadsTexture()
    const tailsMap = createTailsTexture()
    const edgeMap = createEdgeTexture()
    const metal = { metalness: 0.72, roughness: 0.38, envMapIntensity: 0.85 }

    const heads = new THREE.MeshStandardMaterial({ map: headsMap, ...metal })
    const tails = new THREE.MeshStandardMaterial({ map: tailsMap, ...metal })
    const edge = new THREE.MeshStandardMaterial({
      map: edgeMap,
      metalness: 0.75,
      roughness: 0.42,
      envMapIntensity: 0.8,
    })

    return {
      list: [edge, heads, tails] as THREE.MeshStandardMaterial[],
      dispose() {
        headsMap.dispose()
        tailsMap.dispose()
        edgeMap.dispose()
        heads.dispose()
        tails.dispose()
        edge.dispose()
      },
    }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 64, 1, false)
    // Top (+Y) → +Z toward camera; bottom → -Z
    geo.rotateX(Math.PI / 2)
    return geo
  }, [])

  useEffect(() => () => {
    materials.dispose()
    geometry.dispose()
  }, [materials, geometry])

  useEffect(() => {
    if (tossId === 0) return
    elapsed.current = 0
    landed.current = false
    revealed.current = false
    spinSeed.current = 0.75 + Math.random() * 0.5
    // Even half-turns → heads (0), odd → tails (π)
    const base = 8 + Math.floor(Math.random() * 3) * 2 // 8, 10, or 12
    totalFlips.current = result === 'tails' ? base + 1 : base
  }, [tossId, result])

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return

    const p = phaseRef.current
    const face = resultRef.current
    const dt = Math.min(delta, 0.048)

    if (p === 'idle' && tossId === 0) {
      const t = performance.now() * 0.001
      g.position.y = 0.12 + Math.sin(t * 1.2) * 0.08
      // Spin in-plane so the face stays camera-facing
      g.rotation.z = t * 0.4
      g.rotation.x = Math.sin(t * 0.7) * 0.12
      g.rotation.y = Math.cos(t * 0.55) * 0.18
      return
    }

    if (p === 'reveal' || (p === 'idle' && face)) {
      const t = performance.now() * 0.001
      g.position.y = 0.14 + Math.sin(t * 1.4) * 0.03
      g.rotation.x = restRot.current.x + Math.sin(t * 0.8) * 0.06
      g.rotation.y = restRot.current.y + Math.cos(t * 0.6) * 0.1
      g.rotation.z = restRot.current.z + Math.sin(t * 0.5) * 0.12
      return
    }

    if (p !== 'tossing' && p !== 'landing') return

    elapsed.current += dt
    const time = elapsed.current

    if (reducedMotion) {
      const k = Math.min(time / 0.55, 1)
      const e = easeOutCubic(k)
      const finalX = face === 'heads' ? 0 : Math.PI
      g.position.set(0, 0.12 + (1 - e) * 1.1, 0)
      g.rotation.set(finalX * e, 0, e * Math.PI * 2)
      if (k >= 1) {
        g.rotation.set(finalX, 0, 0)
        g.position.set(0, 0.12, 0)
        restRot.current = { x: finalX, y: 0, z: 0 }
        if (!landed.current) {
          landed.current = true
          onLand()
        }
        if (!revealed.current) {
          revealed.current = true
          onRevealReady()
        }
      }
      return
    }

    const duration = TOSS_DURATION
    const progress = Math.min(time / duration, 1)
    const flips = totalFlips.current

    let y: number
    if (progress < 0.7) {
      const u = progress / 0.7
      y = 0.12 + Math.sin(u * Math.PI) * 3.35
    } else {
      const u = (progress - 0.7) / 0.3
      y = 0.12 + (1 - easeOutBounce(Math.min(u, 1))) * 0.5
    }

    const driftX = Math.sin(progress * Math.PI * 2) * 0.32 * (1 - progress * 0.55)
    const driftZ = Math.cos(progress * Math.PI) * 0.18
    g.position.set(driftX, y, driftZ)

    const spinX = progress * Math.PI * flips
    const spinY = progress * Math.PI * 2 * 3.1 * spinSeed.current
    const spinZ = Math.sin(progress * Math.PI * 3) * 0.75 * (1 - progress)

    if (progress < 0.88) {
      g.rotation.set(spinX, spinY, spinZ)
    } else {
      const settle = easeOutCubic((progress - 0.88) / 0.12)
      const fullTurns = Math.PI * flips
      const targetX = face === 'heads'
        ? Math.PI * 2 * Math.round(flips / 2)
        : Math.PI * (2 * Math.floor(flips / 2) + 1)
      g.rotation.x = THREE.MathUtils.lerp(fullTurns * 0.88, targetX, settle)
      g.rotation.y = THREE.MathUtils.lerp(spinY, 0, settle)
      g.rotation.z = THREE.MathUtils.lerp(spinZ, 0, settle)
    }

    if (progress >= 1) {
      const finalX = face === 'heads' ? 0 : Math.PI
      g.position.set(0, 0.12, 0)
      g.rotation.set(finalX, 0, 0)
      restRot.current = { x: finalX, y: 0, z: 0 }

      if (!landed.current) {
        landed.current = true
        onLand()
      }
      if (time >= duration + LAND_SETTLE && !revealed.current) {
        revealed.current = true
        onRevealReady()
      }
    }
  })

  return (
    <group ref={group}>
      <mesh
        geometry={geometry}
        material={materials.list}
        castShadow
        receiveShadow
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <circleGeometry args={[1.08, 48]} />
        <shadowMaterial opacity={0.38} />
      </mesh>
    </group>
  )
}
