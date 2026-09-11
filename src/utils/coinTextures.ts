import * as THREE from 'three'

const SIZE = 1024
const STEEL = '#c8ccd2'
const STEEL_DARK = '#7a8088'
const STEEL_LIGHT = '#e8eaee'
const INK = '#1a1e24'
const INK_SOFT = '#3a4048'

function makeCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  return canvas
}

function drawMetalDisc(ctx: CanvasRenderingContext2D) {
  const cx = SIZE / 2
  const cy = SIZE / 2
  const r = SIZE * 0.48

  const base = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, r * 0.1, cx, cy, r)
  base.addColorStop(0, STEEL_LIGHT)
  base.addColorStop(0.45, STEEL)
  base.addColorStop(0.85, '#a8adb5')
  base.addColorStop(1, STEEL_DARK)
  ctx.fillStyle = base
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // Outer rim
  ctx.strokeStyle = '#9aa0a8'
  ctx.lineWidth = SIZE * 0.018
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.97, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = STEEL_LIGHT
  ctx.lineWidth = SIZE * 0.006
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.93, 0, Math.PI * 2)
  ctx.stroke()

  // Fine reeded edge hint
  ctx.save()
  ctx.strokeStyle = 'rgba(90, 96, 104, 0.35)'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2
    const x1 = cx + Math.cos(a) * r * 0.985
    const y1 = cy + Math.sin(a) * r * 0.985
    const x2 = cx + Math.cos(a) * r * 0.955
    const y2 = cy + Math.sin(a) * r * 0.955
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
  ctx.restore()

  // Soft brushed metal streaks
  ctx.save()
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 40; i++) {
    const y = cy - r + (i / 40) * r * 2
    ctx.strokeStyle = i % 2 === 0 ? '#fff' : '#000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.85, y)
    ctx.lineTo(cx + r * 0.85, y)
    ctx.stroke()
  }
  ctx.restore()
}

function drawLionCapital(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.fillStyle = INK
  ctx.strokeStyle = INK
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Pedestal / abacus
  ctx.fillRect(-70, 55, 140, 18)
  ctx.fillRect(-78, 70, 156, 10)

  // Wheel / Dharma Chakra hint on abacus
  ctx.beginPath()
  ctx.arc(0, 64, 10, 0, Math.PI * 2)
  ctx.fillStyle = STEEL_LIGHT
  ctx.fill()
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(0, 64, 5, 0, Math.PI * 2)
  ctx.fill()

  // Central body
  ctx.beginPath()
  ctx.moveTo(-18, 55)
  ctx.lineTo(-22, 10)
  ctx.lineTo(22, 10)
  ctx.lineTo(18, 55)
  ctx.closePath()
  ctx.fill()

  // Four lions stylized as facing outward (front + side silhouettes)
  const drawLion = (x: number, facing: 1 | -1) => {
    ctx.save()
    ctx.translate(x, 0)
    ctx.scale(facing, 1)
    // Body
    ctx.beginPath()
    ctx.ellipse(0, 18, 28, 22, 0, 0, Math.PI * 2)
    ctx.fill()
    // Chest
    ctx.beginPath()
    ctx.ellipse(18, 28, 16, 20, 0.2, 0, Math.PI * 2)
    ctx.fill()
    // Head
    ctx.beginPath()
    ctx.ellipse(28, -2, 18, 16, -0.15, 0, Math.PI * 2)
    ctx.fill()
    // Mane
    ctx.beginPath()
    ctx.arc(22, 0, 24, -1.2, 1.4)
    ctx.lineWidth = 8
    ctx.stroke()
    // Ear
    ctx.beginPath()
    ctx.ellipse(20, -16, 6, 8, -0.4, 0, Math.PI * 2)
    ctx.fill()
    // Mouth / snout
    ctx.beginPath()
    ctx.ellipse(42, 2, 10, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    // Front leg
    ctx.fillRect(8, 35, 12, 22)
    ctx.fillRect(22, 38, 10, 18)
    // Tail curl (back lions)
    ctx.beginPath()
    ctx.moveTo(-24, 8)
    ctx.quadraticCurveTo(-40, -10, -28, -22)
    ctx.lineWidth = 5
    ctx.stroke()
    ctx.restore()
  }

  drawLion(-8, -1)
  drawLion(8, 1)

  // Back lions (smaller, between)
  ctx.globalAlpha = 0.85
  ctx.beginPath()
  ctx.ellipse(0, -18, 20, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(-12, -28, 12, 10, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(12, -28, 12, 10, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  ctx.restore()
}

function drawLotusPetals(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, count: number) {
  ctx.save()
  ctx.strokeStyle = INK_SOFT
  ctx.fillStyle = 'rgba(42, 46, 52, 0.12)'
  ctx.lineWidth = 2.5
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2
    const px = cx + Math.cos(a) * r
    const py = cy + Math.sin(a) * r
    ctx.save()
    ctx.translate(px, py)
    ctx.rotate(a + Math.PI / 2)
    ctx.beginPath()
    ctx.ellipse(0, 0, 18, 36, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

export function createHeadsTexture(): THREE.CanvasTexture {
  const canvas = makeCanvas()
  const ctx = canvas.getContext('2d')!
  drawMetalDisc(ctx)

  const cx = SIZE / 2
  const cy = SIZE / 2

  // Inner guide ring
  ctx.strokeStyle = INK_SOFT
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, SIZE * 0.38, 0, Math.PI * 2)
  ctx.stroke()

  drawLionCapital(ctx, cx, cy - SIZE * 0.02, SIZE / 1024)

  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // भारत · INDIA arc top
  ctx.font = `700 ${SIZE * 0.048}px "Noto Sans Devanagari", "Segoe UI", sans-serif`
  ctx.fillText('भारत', cx - SIZE * 0.12, cy - SIZE * 0.34)
  ctx.font = `700 ${SIZE * 0.042}px Outfit, system-ui, sans-serif`
  ctx.fillText('INDIA', cx + SIZE * 0.12, cy - SIZE * 0.34)

  // Separator dots
  ctx.beginPath()
  ctx.arc(cx, cy - SIZE * 0.34, 4, 0, Math.PI * 2)
  ctx.fill()

  // सत्यमेव जयते bottom
  ctx.font = `600 ${SIZE * 0.038}px "Noto Sans Devanagari", "Segoe UI", sans-serif`
  ctx.fillText('सत्यमेव जयते', cx, cy + SIZE * 0.36)

  // Small Ashoka chakra accents
  ctx.strokeStyle = INK
  ctx.lineWidth = 2
  ;[-1, 1].forEach((side) => {
    const ax = cx + side * SIZE * 0.28
    const ay = cy + SIZE * 0.08
    ctx.beginPath()
    ctx.arc(ax, ay, 14, 0, Math.PI * 2)
    ctx.stroke()
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(ax + Math.cos(a) * 12, ay + Math.sin(a) * 12)
      ctx.stroke()
    }
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

export function createTailsTexture(): THREE.CanvasTexture {
  const canvas = makeCanvas()
  const ctx = canvas.getContext('2d')!
  drawMetalDisc(ctx)

  const cx = SIZE / 2
  const cy = SIZE / 2

  ctx.strokeStyle = INK_SOFT
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, SIZE * 0.38, 0, Math.PI * 2)
  ctx.stroke()

  drawLotusPetals(ctx, cx, cy, SIZE * 0.26, 8)

  // Cross / floral divider rings
  ctx.strokeStyle = INK
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.arc(cx, cy, SIZE * 0.2, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Large denomination
  ctx.font = `800 ${SIZE * 0.28}px Syne, Outfit, system-ui, sans-serif`
  ctx.fillText('1', cx, cy + SIZE * 0.02)

  // Rupee mark
  ctx.font = `700 ${SIZE * 0.07}px Outfit, system-ui, sans-serif`
  ctx.fillText('₹', cx, cy - SIZE * 0.12)

  // ONE RUPEE
  ctx.font = `700 ${SIZE * 0.045}px Outfit, system-ui, sans-serif`
  ctx.fillText('ONE RUPEE', cx, cy + SIZE * 0.34)

  // रूपया
  ctx.font = `600 ${SIZE * 0.04}px "Noto Sans Devanagari", "Segoe UI", sans-serif`
  ctx.fillText('रूपया', cx, cy + SIZE * 0.28)

  // Year accents
  ctx.font = `600 ${SIZE * 0.032}px Outfit, system-ui, sans-serif`
  ctx.fillStyle = INK_SOFT
  ctx.fillText('भारत · INDIA', cx, cy - SIZE * 0.34)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

export function createEdgeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  const g = ctx.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0, STEEL_DARK)
  g.addColorStop(0.35, STEEL_LIGHT)
  g.addColorStop(0.65, STEEL)
  g.addColorStop(1, STEEL_DARK)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 64)

  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  for (let i = 0; i < 64; i++) {
    const x = (i / 64) * 512
    ctx.fillRect(x, 0, 3, 64)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.repeat.set(8, 1)
  texture.needsUpdate = true
  return texture
}
