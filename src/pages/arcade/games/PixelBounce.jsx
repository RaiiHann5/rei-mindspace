import { useCallback, useEffect, useRef, useState } from 'react'
import { Rabbit, Heart, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui'
import { useArcadeStore } from '@/store/useArcadeStore'
import { playJump, playCoin, playStomp, playPowerUp, playCrash } from '@/lib/sound'
import GameFrame from '../GameFrame'

const GAME_ID = 'pixel-bounce'
const START_LIVES = 3
const GRAVITY = 2200
const JUMP_V = -760
const DOUBLE_JUMP_V = -620
const GROUND_RATIO = 0.74
const INVINCIBLE_TIME = 1.2
const STAR_TIME = 6
const PLAYER_X_RATIO = 0.24

const QUIPS = [
  'Lompatan berkelas. Musuh cuma bisa cengo.',
  'Koin ludes, ego naik.',
  'Bintangnya berasa, kamu jadi ngebut kayak orang telat kerja.',
  'Sepatu pentalnya emang beda.',
  'Stomp sana stomp sini, musuh pada nyerah.',
]

function rand(a, b) { return a + Math.random() * (b - a) }

// ---------- pixel-styled sprite drawing (procedural, retro-blocky) ----------

function drawHero(ctx, x, groundY, scale, pose, invincible, starMode, t) {
  ctx.save()
  ctx.translate(x, groundY)
  if (invincible && Math.floor(t * 16) % 2 === 0) { ctx.restore(); return }

  const capColor = starMode ? `hsl(${(t * 240) % 360},85%,60%)` : '#FF6B4A'
  const capShade = starMode ? `hsl(${(t * 240 + 20) % 360},85%,45%)` : '#D9502F'
  const overalls = starMode ? `hsl(${(t * 240 + 140) % 360},70%,55%)` : '#1EC4B0'
  const overallsShade = starMode ? `hsl(${(t * 240 + 140) % 360},70%,40%)` : '#14958A'
  const skin = '#FFD8A8'

  const bodyW = 22 * scale
  const bodyH = 18 * scale
  const headR = 12 * scale

  let squash = 1, stretch = 1, legPhase = 0, armUp = false, tilt = 0
  if (pose === 'jump') { stretch = 1.18; squash = 0.9; armUp = true }
  else if (pose === 'fall') { stretch = 0.92; squash = 1.1 }
  else if (pose === 'run1') { legPhase = 1; tilt = -0.05 }
  else if (pose === 'run2') { legPhase = -1; tilt = 0.05 }
  else if (pose === 'land') { squash = 1.3; stretch = 0.72 }

  ctx.rotate(tilt)

  // legs
  ctx.fillStyle = '#6B4A2F'
  const legY = -2 * scale
  const legW = 7 * scale
  const legH = 12 * scale * squash
  ctx.fillRect(-bodyW * 0.32 - legPhase * 3 * scale, legY, legW, legH)
  ctx.fillRect(bodyW * 0.32 - legW + legPhase * 3 * scale, legY, legW, legH)

  // body (overalls)
  const bh = bodyH * stretch
  const by = -legH - bh * squash + 2 * scale
  const grad = ctx.createLinearGradient(0, by, 0, by + bh * squash)
  grad.addColorStop(0, overalls)
  grad.addColorStop(1, overallsShade)
  ctx.fillStyle = grad
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(-bodyW / 2, by, bodyW, bh * squash, 5 * scale)
  else ctx.rect(-bodyW / 2, by, bodyW, bh * squash)
  ctx.fill()
  // buttons
  ctx.fillStyle = '#EAF4F1'
  ctx.beginPath(); ctx.arc(-bodyW * 0.18, by + bh * 0.4, 2 * scale, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(bodyW * 0.18, by + bh * 0.4, 2 * scale, 0, Math.PI * 2); ctx.fill()

  // arms
  ctx.fillStyle = skin
  const armY = armUp ? by - 4 * scale : by + bh * 0.15
  ctx.beginPath(); ctx.arc(-bodyW * 0.62, armY, 4.2 * scale, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(bodyW * 0.62, armY, 4.2 * scale, 0, Math.PI * 2); ctx.fill()

  // head
  const headY = by - headR * 0.75
  ctx.fillStyle = skin
  ctx.beginPath(); ctx.arc(0, headY, headR, 0, Math.PI * 2); ctx.fill()

  // ears (round mascot ears, not a real-world species — keeps it original & goofy)
  ctx.fillStyle = skin
  ctx.beginPath(); ctx.arc(-headR * 0.78, headY - headR * 0.75, 4 * scale, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(headR * 0.78, headY - headR * 0.75, 4 * scale, 0, Math.PI * 2); ctx.fill()

  // cap
  ctx.fillStyle = capColor
  ctx.beginPath()
  ctx.arc(0, headY - headR * 0.15, headR * 0.92, Math.PI, 0)
  ctx.fill()
  ctx.fillStyle = capShade
  ctx.fillRect(-headR * 0.95, headY - headR * 0.2, headR * 1.9, headR * 0.28)
  // cap brim
  ctx.fillStyle = capShade
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(headR * 0.1, headY - headR * 0.05, headR * 0.95, headR * 0.28, 3 * scale)
  ctx.fill()

  // eyes
  ctx.fillStyle = '#1A1A2E'
  const eyeY = headY + headR * 0.08
  ctx.beginPath(); ctx.arc(-headR * 0.32, eyeY, 1.8 * scale, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(headR * 0.32, eyeY, 1.8 * scale, 0, Math.PI * 2); ctx.fill()
  // rosy cheeks
  ctx.fillStyle = 'rgba(244,80,106,0.35)'
  ctx.beginPath(); ctx.arc(-headR * 0.55, eyeY + headR * 0.25, 2 * scale, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(headR * 0.55, eyeY + headR * 0.25, 2 * scale, 0, Math.PI * 2); ctx.fill()

  ctx.restore()
}

function drawGrump(ctx, x, y, scale, phase, squished) {
  ctx.save()
  ctx.translate(x, y)
  if (squished) ctx.scale(1.3, 0.4)
  const bodyColor = '#A78BFA'
  const bodyShade = '#7C5CD9'
  const w = 20 * scale, h = 16 * scale
  const grad = ctx.createLinearGradient(0, -h, 0, 0)
  grad.addColorStop(0, bodyColor)
  grad.addColorStop(1, bodyShade)
  ctx.fillStyle = grad
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(-w / 2, -h, w, h, [w * 0.5, w * 0.5, 4, 4])
  else ctx.rect(-w / 2, -h, w, h)
  ctx.fill()
  if (!squished) {
    // angry eyebrows
    ctx.strokeStyle = '#3D2C6B'
    ctx.lineWidth = 2 * scale
    ctx.beginPath(); ctx.moveTo(-w * 0.32, -h * 0.68); ctx.lineTo(-w * 0.1, -h * 0.55); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(w * 0.32, -h * 0.68); ctx.lineTo(w * 0.1, -h * 0.55); ctx.stroke()
    // eyes
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath(); ctx.arc(-w * 0.2, -h * 0.42, 3 * scale, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(w * 0.2, -h * 0.42, 3 * scale, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1A1A2E'
    ctx.beginPath(); ctx.arc(-w * 0.2, -h * 0.4, 1.4 * scale, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(w * 0.2, -h * 0.4, 1.4 * scale, 0, Math.PI * 2); ctx.fill()
    // feet
    ctx.fillStyle = bodyShade
    const foot = (phase > 0) ? 2 * scale : -2 * scale
    ctx.beginPath(); ctx.ellipse(-w * 0.28 + foot, 1 * scale, 4 * scale, 2.4 * scale, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(w * 0.28 - foot, 1 * scale, 4 * scale, 2.4 * scale, 0, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.fillStyle = '#3D2C6B'
    ctx.beginPath(); ctx.arc(-w * 0.2, -h * 0.5, 1.5 * scale, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(w * 0.2, -h * 0.5, 1.5 * scale, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

function drawCoin(ctx, x, y, spin, scale) {
  ctx.save()
  ctx.translate(x, y)
  const squeeze = Math.abs(Math.cos(spin))
  ctx.scale(Math.max(0.15, squeeze), 1)
  const grad = ctx.createLinearGradient(-8 * scale, 0, 8 * scale, 0)
  grad.addColorStop(0, '#C97C10')
  grad.addColorStop(0.5, '#F7C948')
  grad.addColorStop(1, '#C97C10')
  ctx.fillStyle = grad
  ctx.beginPath(); ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.beginPath(); ctx.arc(-2 * scale, -2 * scale, 2.4 * scale, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawStar(ctx, x, y, spin, scale) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(spin)
  ctx.shadowColor = 'rgba(247,201,72,0.8)'
  ctx.shadowBlur = 10
  ctx.fillStyle = '#F7C948'
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    const a2 = a + Math.PI / 5
    ctx.lineTo(Math.cos(a) * 11 * scale, Math.sin(a) * 11 * scale)
    ctx.lineTo(Math.cos(a2) * 5 * scale, Math.sin(a2) * 5 * scale)
  }
  ctx.closePath(); ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

function drawSpikes(ctx, x, y, w, scale) {
  ctx.save()
  ctx.fillStyle = '#71717A'
  const count = Math.max(2, Math.round(w / (14 * scale)))
  const sw = w / count
  for (let i = 0; i < count; i++) {
    ctx.beginPath()
    ctx.moveTo(x + i * sw, y)
    ctx.lineTo(x + i * sw + sw / 2, y - 16 * scale)
    ctx.lineTo(x + i * sw + sw, y)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
}

export default function PixelBounce() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const rafRef = useRef(null)
  const best = useArcadeStore((s) => s.getBest(GAME_ID))
  const runs = useArcadeStore((s) => s.getRuns(GAME_ID))
  const registerRun = useArcadeStore((s) => s.registerRun)

  const [phase, setPhase] = useState('idle')
  const [hud, setHud] = useState({ score: 0, lives: START_LIVES, star: false })
  const [result, setResult] = useState({ score: 0, isNewHigh: false, quip: '' })

  const freshEngine = useCallback(() => ({
    dims: { w: 420, h: 320 },
    groundY: 320 * GROUND_RATIO,
    playerY: 0,
    playerVY: 0,
    jumpsUsed: 0,
    pose: 'run1',
    poseTimer: 0,
    obstacles: [],
    pickups: [],
    particles: [],
    popups: [],
    groundOffset: 0,
    hillOffset: 0,
    spawnTimer: 1,
    pickupTimer: 2,
    elapsed: 0,
    score: 0,
    lives: START_LIVES,
    invincible: 0,
    star: 0,
    falling: false,
    fallProgress: 0,
    shake: { time: 0, mag: 0 },
    landSquash: 0,
  }), [])

  useEffect(() => { engineRef.current = freshEngine() }, [freshEngine])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const engine = engineRef.current
    if (!canvas || !engine) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(280, rect.width)
    const h = Math.max(220, rect.height)
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    engine.dims = { w, h }
    engine.groundY = h * GROUND_RATIO
  }, [])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  const doJump = useCallback(() => {
    const engine = engineRef.current
    if (!engine || engine.falling) return
    if (engine.jumpsUsed === 0) {
      engine.playerVY = JUMP_V
      engine.jumpsUsed = 1
      engine.pose = 'jump'
      playJump(1)
    } else if (engine.jumpsUsed === 1) {
      engine.playerVY = DOUBLE_JUMP_V
      engine.jumpsUsed = 2
      engine.pose = 'jump'
      playJump(1.35)
      engine.particles.push({ type: 'poof', x: 0, y: 0, life: 0.4, maxLife: 0.4 })
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const jump = () => { if (engineRef.current) doJump() }
    const onClick = () => jump()
    const onTouchStart = (e) => { e.preventDefault(); jump() }
    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); jump() }
    }
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    return () => {
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [doJump])

  const endGame = useCallback(() => {
    const engine = engineRef.current
    engine.state = 'gameover'
    const isNewHigh = registerRun(GAME_ID, engine.score, 'max')
    setResult({ score: engine.score, isNewHigh, quip: QUIPS[Math.floor(Math.random() * QUIPS.length)] })
    setPhase('gameover')
  }, [registerRun])

  const startGame = useCallback(() => {
    const dims = engineRef.current?.dims || { w: 420, h: 320 }
    engineRef.current = { ...freshEngine(), dims, groundY: dims.h * GROUND_RATIO }
    setHud({ score: 0, lives: START_LIVES, star: false })
    setPhase('playing')
  }, [freshEngine])

  useEffect(() => {
    if (phase !== 'playing') return
    let lastT = performance.now()
    const loop = (t) => {
      const dt = Math.min(0.035, (t - lastT) / 1000)
      lastT = t
      const engine = engineRef.current
      const canvas = canvasRef.current
      if (!engine || !canvas) return
      const ctx = canvas.getContext('2d')
      const { w, h } = engine.dims
      const groundY = engine.groundY
      const scale = Math.max(0.85, Math.min(1.3, w / 420))
      const playerX = w * PLAYER_X_RATIO

      engine.elapsed += dt
      if (engine.invincible > 0) engine.invincible = Math.max(0, engine.invincible - dt)
      if (engine.star > 0) engine.star = Math.max(0, engine.star - dt)
      if (engine.landSquash > 0) engine.landSquash = Math.max(0, engine.landSquash - dt * 4)
      const starMode = engine.star > 0

      const speed = Math.min(430, 195 + engine.elapsed * 7.5) * (starMode ? 1.25 : 1)
      const spawnInterval = Math.max(0.85, 1.55 - engine.elapsed * 0.012)

      // scrolling
      engine.groundOffset = (engine.groundOffset + speed * dt) % 32
      engine.hillOffset = (engine.hillOffset + speed * dt * 0.25) % w

      // physics
      if (!engine.falling) {
        engine.playerVY += GRAVITY * dt
        engine.playerY += engine.playerVY * dt
        if (engine.playerY >= 0) {
          if (engine.playerY > 0 && engine.playerVY > 300) engine.landSquash = 1
          engine.playerY = 0
          engine.playerVY = 0
          engine.jumpsUsed = 0
        }
      } else {
        engine.fallProgress += dt
        engine.playerY += 260 * dt
      }

      // pose
      if (engine.falling) engine.pose = 'fall'
      else if (engine.playerY < -4) engine.pose = engine.playerVY < 0 ? 'jump' : 'fall'
      else if (engine.landSquash > 0.6) engine.pose = 'land'
      else {
        engine.poseTimer += dt
        const stepTime = Math.max(0.09, 0.22 - engine.elapsed * 0.002)
        if (engine.poseTimer >= stepTime) {
          engine.poseTimer = 0
          engine.pose = engine.pose === 'run1' ? 'run2' : 'run1'
        }
      }

      // distance score
      engine.score += Math.round(speed * dt * 0.12)

      // spawn obstacles
      engine.spawnTimer -= dt
      if (engine.spawnTimer <= 0 && !engine.falling) {
        engine.spawnTimer = spawnInterval
        const roll = Math.random()
        const type = roll < 0.4 ? 'spike' : roll < 0.7 ? 'enemy' : 'pit'
        const width = type === 'pit' ? rand(50, 90) * scale : (type === 'spike' ? rand(28, 46) * scale : 22 * scale)
        engine.obstacles.push({ id: Math.random(), type, x: w + 20, w: width, phase: 0, squished: false, squishT: 0 })
      }

      // spawn pickups
      engine.pickupTimer -= dt
      if (engine.pickupTimer <= 0) {
        engine.pickupTimer = rand(2.6, 4.2)
        const isStar = Math.random() < 0.12
        if (isStar) {
          engine.pickups.push({ id: Math.random(), type: 'star', x: w + 30, yOff: -rand(70, 110) * scale, spin: 0 })
        } else {
          const arc = Math.floor(rand(3, 6))
          const high = Math.random() < 0.5
          for (let i = 0; i < arc; i++) {
            engine.pickups.push({
              id: Math.random() + i,
              type: 'coin',
              x: w + 40 + i * 24 * scale,
              yOff: -(high ? rand(60, 95) : rand(15, 35)) * scale,
              spin: i,
            })
          }
        }
      }

      // update obstacles
      const playerBottom = groundY + engine.playerY
      const playerTop = playerBottom - 34 * scale
      const nextObstacles = []
      for (const ob of engine.obstacles) {
        ob.x -= speed * dt
        ob.phase += dt * 4
        if (ob.squished) {
          ob.squishT += dt
          if (ob.squishT < 0.35) nextObstacles.push(ob)
          continue
        }
        if (ob.x + ob.w < -20) continue

        const overlapX = playerX + 10 * scale > ob.x && playerX - 10 * scale < ob.x + ob.w
        if (overlapX) {
          if (ob.type === 'pit') {
            if (!engine.falling && engine.playerY >= -2 && !starMode) {
              engine.falling = true
              engine.fallProgress = 0
              engine.shake = { time: 0.3, mag: 8 }
              playCrash()
              engine.popups.push({ x: playerX, y: playerBottom, vy: -50, life: 0.7, maxLife: 0.7, text: 'JATUH!', color: '#F4506A' })
            }
          } else if (ob.type === 'spike') {
            const clearedByJump = engine.playerY < -18 * scale
            if (!clearedByJump && engine.invincible <= 0 && !starMode) {
              engine.lives -= 1
              engine.invincible = INVINCIBLE_TIME
              engine.shake = { time: 0.3, mag: 9 }
              playCrash()
              engine.popups.push({ x: playerX, y: playerTop, vy: -55, life: 0.7, maxLife: 0.7, text: 'AUTS!', color: '#F4506A' })
            }
          } else if (ob.type === 'enemy') {
            const enemyTop = groundY - 14 * scale
            const stomping = engine.playerVY > 100 && playerBottom < enemyTop + 10 * scale && !engine.falling
            if (stomping) {
              ob.squished = true
              ob.squishT = 0
              engine.playerVY = JUMP_V * 0.55
              engine.playerY = Math.min(engine.playerY, -1)
              engine.score += 25
              playStomp()
              engine.popups.push({ x: ob.x + ob.w / 2, y: enemyTop, vy: -55, life: 0.7, maxLife: 0.7, text: '+25', color: '#A78BFA' })
            } else if (engine.invincible <= 0 && !starMode) {
              engine.lives -= 1
              engine.invincible = INVINCIBLE_TIME
              engine.shake = { time: 0.3, mag: 9 }
              playCrash()
              engine.popups.push({ x: playerX, y: playerTop, vy: -55, life: 0.7, maxLife: 0.7, text: 'DUAKH!', color: '#F4506A' })
            } else if (starMode) {
              ob.squished = true
              ob.squishT = 0
              engine.score += 15
              playStomp()
            }
          }
        }
        nextObstacles.push(ob)
      }
      engine.obstacles = nextObstacles

      // player finished falling into pit -> respawn
      if (engine.falling && engine.fallProgress > 0.5) {
        engine.falling = false
        engine.playerY = 0
        engine.playerVY = 0
        engine.lives -= 1
      }

      // pickups
      const nextPickups = []
      for (const p of engine.pickups) {
        p.x -= speed * dt
        p.spin += dt * 5
        if (p.x < -20) continue
        const py = groundY + p.yOff
        const overlapX = Math.abs(playerX - p.x) < 14 * scale
        const overlapY = Math.abs((playerBottom - 17 * scale) - py) < 20 * scale
        if (overlapX && overlapY) {
          if (p.type === 'coin') {
            engine.score += 10
            playCoin()
            engine.popups.push({ x: p.x, y: py, vy: -60, life: 0.6, maxLife: 0.6, text: '+10', color: '#F7C948' })
          } else {
            engine.star = STAR_TIME
            playPowerUp()
            engine.popups.push({ x: p.x, y: py, vy: -60, life: 0.9, maxLife: 0.9, text: 'BINTANG!', color: '#F7C948' })
          }
          continue
        }
        nextPickups.push(p)
      }
      engine.pickups = nextPickups

      engine.popups = engine.popups.filter((p) => { p.y += p.vy * dt; p.life -= dt; return p.life > 0 })
      engine.particles = engine.particles.filter((pt) => { pt.life -= dt; return pt.life > 0 })
      if (engine.shake.time > 0) engine.shake.time = Math.max(0, engine.shake.time - dt)

      // --- draw ---
      ctx.clearRect(0, 0, w, h)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY)
      if (starMode) {
        skyGrad.addColorStop(0, `hsl(${(engine.elapsed * 60) % 360},70%,88%)`)
        skyGrad.addColorStop(1, `hsl(${(engine.elapsed * 60 + 40) % 360},70%,94%)`)
      } else {
        skyGrad.addColorStop(0, 'rgba(163,230,53,0.10)')
        skyGrad.addColorStop(1, 'rgba(30,196,176,0.05)')
      }
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, w, h)

      ctx.save()
      if (engine.shake.time > 0) {
        const mag = engine.shake.mag * (engine.shake.time / 0.3)
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag)
      }

      // parallax hills
      ctx.fillStyle = 'rgba(30,196,176,0.12)'
      for (let i = -1; i < 4; i++) {
        const hx = i * 140 * scale - engine.hillOffset
        ctx.beginPath()
        ctx.arc(hx, groundY + 10, 70 * scale, Math.PI, 0)
        ctx.fill()
      }
      // clouds
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      for (let i = -1; i < 4; i++) {
        const cx = i * 180 * scale - engine.hillOffset * 0.6
        const cy = 30 * scale + (i % 2) * 20 * scale
        ctx.beginPath(); ctx.arc(cx, cy, 10 * scale, 0, Math.PI * 2); ctx.arc(cx + 12 * scale, cy + 2 * scale, 8 * scale, 0, Math.PI * 2); ctx.arc(cx - 10 * scale, cy + 3 * scale, 7 * scale, 0, Math.PI * 2); ctx.fill()
      }

      // ground
      ctx.fillStyle = starMode ? '#7C5CD9' : '#5C8A1B'
      ctx.fillRect(0, groundY, w, 8 * scale)
      ctx.fillStyle = 'rgba(20,20,26,0.9)'
      ctx.fillRect(0, groundY + 8 * scale, w, h - groundY - 8 * scale)
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth = 1.5
      const brick = 32 * scale
      for (let x = -engine.groundOffset; x < w + brick; x += brick) {
        ctx.beginPath(); ctx.moveTo(x, groundY + 8 * scale); ctx.lineTo(x, h); ctx.stroke()
      }

      // pit gaps drawn as sky-colored cutouts over the ground
      for (const ob of engine.obstacles) {
        if (ob.type === 'pit') {
          ctx.fillStyle = starMode ? `hsl(${(engine.elapsed * 60) % 360},70%,90%)` : '#eef7f0'
          ctx.globalAlpha = 1
          ctx.save()
          const pitGrad = ctx.createLinearGradient(0, groundY, 0, h)
          pitGrad.addColorStop(0, 'rgba(10,10,14,0.9)')
          pitGrad.addColorStop(1, 'rgba(10,10,14,0.4)')
          ctx.fillStyle = skyGrad
          ctx.fillRect(ob.x, groundY, ob.w, 8 * scale)
          ctx.fillStyle = pitGrad
          ctx.fillRect(ob.x, groundY + 8 * scale, ob.w, h - groundY)
          ctx.restore()
        }
      }

      // obstacles
      for (const ob of engine.obstacles) {
        if (ob.type === 'spike') drawSpikes(ctx, ob.x, groundY, ob.w, scale)
        else if (ob.type === 'enemy') drawGrump(ctx, ob.x + ob.w / 2, groundY, scale, Math.sin(ob.phase), ob.squished)
      }

      // pickups
      for (const p of engine.pickups) {
        const py = groundY + p.yOff
        if (p.type === 'coin') drawCoin(ctx, p.x, py, p.spin, scale)
        else drawStar(ctx, p.x, py, p.spin, scale)
      }

      // player
      if (!engine.falling || Math.floor(engine.fallProgress * 20) % 2 === 0) {
        drawHero(ctx, playerX, groundY + engine.playerY, scale, engine.pose, engine.invincible > 0, starMode, engine.elapsed)
      }

      // popups
      for (const p of engine.popups) {
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life / p.maxLife); ctx.fillStyle = p.color
        ctx.font = `700 ${13 * scale}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(p.text, p.x, p.y); ctx.restore()
      }

      ctx.restore()

      setHud({ score: engine.score, lives: engine.lives, star: starMode })

      if (engine.lives <= 0) { endGame(); return }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, endGame])

  return (
    <GameFrame
      icon={Rabbit}
      title="Pixel Bounce"
      description="Lompatin musuh, injek Grump, sikat koin dan bintang di jalur endless."
      instructions="Tap layar, klik, atau tekan Space/↑ untuk lompat (bisa lompat 2x!)"
      phase={phase}
      onStart={startGame}
      bestValue={best ?? 0}
      runs={runs}
      resultLabel="Score"
      resultValue={result.score}
      resultExtra={result.quip}
      isNewHigh={result.isNewHigh}
      aspect="420 / 320"
      maxWidth={460}
      hud={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold tabular-nums">{hud.score}</span>
            {hud.star && <Badge tone="amber" className="animate-pop gap-1"><Sparkles size={11} /> BINTANG</Badge>}
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: START_LIVES }).map((_, i) => (
              <Heart key={i} size={16} className={i < hud.lives ? 'text-rose-500 fill-rose-500' : 'text-black/10 dark:text-white/10'} />
            ))}
          </div>
        </div>
      }
    >
      <canvas ref={canvasRef} className="w-full h-full rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-light dark:border-border-dark touch-none cursor-pointer" />
    </GameFrame>
  )
}
