import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { Coin } from './Coin'
import type { Face, TossPhase } from '../utils/copy'

interface CoinSceneProps {
  phase: TossPhase
  result: Face | null
  tossId: number
  onLand: () => void
  onRevealReady: () => void
  reducedMotion: boolean
}

function CameraRig({ phase }: { phase: TossPhase }) {
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const p = phaseRef.current
    const baseZ = 6.2
    const baseY = 1.35

    if (p === 'tossing' || p === 'landing') {
      const shake = p === 'landing' ? 0.04 : 0.02
      state.camera.position.x = Math.sin(t * 14) * shake
      state.camera.position.y = baseY + Math.cos(t * 11) * shake * 0.5
      state.camera.position.z = baseZ
    } else {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(t * 0.25) * 0.15, 0.05)
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, baseY + Math.sin(t * 0.4) * 0.08, 0.05)
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, baseZ, 0.05)
    }
    state.camera.lookAt(0, 0.4, 0)
  })

  return null
}

function CosmicDust({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
    }
    return arr
  }, [count])

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.02
    ref.current.rotation.x += delta * 0.008
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#9ad7ff"
        transparent
        opacity={0.55}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function SceneContents(props: CoinSceneProps) {
  return (
    <>
      <color attach="background" args={['#050816']} />
      <fog attach="fog" args={['#050816', 8, 22]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        castShadow
        position={[4, 8, 5]}
        intensity={1.35}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        color="#fff4e6"
      />
      <directionalLight position={[-5, 2, -3]} intensity={0.45} color="#6ec8ff" />
      <pointLight position={[0, -2, 3]} intensity={0.35} color="#ff9b6a" distance={12} />
      <spotLight
        position={[0, 6, 2]}
        angle={0.45}
        penumbra={0.6}
        intensity={0.55}
        color="#b8e0ff"
        castShadow={false}
      />

      <Stars
        radius={60}
        depth={40}
        count={1200}
        factor={3.2}
        saturation={0}
        fade
        speed={0.4}
      />
      <CosmicDust count={64} />

      <Coin {...props} />

      <ContactShadows
        position={[0, -0.08, 0]}
        opacity={0.55}
        scale={10}
        blur={2.4}
        far={4}
        color="#02040c"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.09, 0]} receiveShadow>
        <circleGeometry args={[3.5, 64]} />
        <meshStandardMaterial
          color="#0a1228"
          metalness={0.6}
          roughness={0.55}
          transparent
          opacity={0.85}
        />
      </mesh>

      <Environment preset="night" environmentIntensity={0.55} />
      <CameraRig phase={props.phase} />
    </>
  )
}

export function CoinScene(props: CoinSceneProps) {
  return (
    <div className="scene-wrap" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        camera={{ position: [0, 1.35, 6.2], fov: 40, near: 0.1, far: 80 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x050816, 1)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
      >
        <Suspense fallback={null}>
          <SceneContents {...props} />
        </Suspense>
      </Canvas>
    </div>
  )
}
