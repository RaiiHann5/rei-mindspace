import { useCallback, useEffect, useRef, useState } from 'react'
import { Car, Gauge } from 'lucide-react'
import { Badge } from '@/components/ui'
import { useArcadeStore } from '@/store/useArcadeStore'
import { playBoost, playCrash, playHighScore } from '@/lib/sound'
import GameFrame from '../GameFrame'

const GAME_ID = 'turbo-racer'
const LANES = 3
const START_LIVES = 3
const INVINCIBLE_TIME = 1.1
const BOOST_TIME = 2.6
const CAR_COLORS = [
  { body: '#F4506A', dark: '#C23652' },
  { body: '#3B82F6', dark: '#1D4ED8' },
  { body: '#F7A331', dark: '#C97C10' },
  { body: '#A855F7', dark: '#7E22CE' },
]
const QUIPS = [
  'Pole position energy. Nice run.',
  'Clean laps, minimal fender-benders.',
  'Nitro well spent — you felt that speed.',
  'Traffic never stood a chance.',
  'Nearly F1-grade reflexes right there.',
]

function laneCenter(dims, i) {
  const roadW = dims.w * 0.86
  const roadX0 = (dims.w - roadW) / 2
  const laneW = roadW / LANES
  return roadX0 + laneW * (i + 0.5)
}

function drawCar(ctx, x, y, w, h, colors, angle = 0, alpha = 1) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 3
  const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2)
  grad.addColorStop(0, colors.body)
  grad.addColorStop(1, colors.dark)
  ctx.fillStyle = grad
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(-w / 2, -h / 2, w, h, w * 0.32)
  else ctx.rect(-w / 2, -h / 2, w, h)
  ctx.fill()
  ctx.shadowColor = 'transparent'
  // windshield
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(-w * 0.3, -h * 0.28, w * 0.6, h * 0.32, w * 0.14)
  ctx.fill()
  // headlights / taillights
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath(); ctx.arc(-w * 0.28, -h * 0.42, w * 0.07, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(w * 0.28, -h * 0.42, w * 0.07, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.beginPath(); ctx.arc(-w * 0.26, h * 0.4, w * 0.06, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(w * 0.26, h * 0.4, w * 0.06, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

export default function TurboRacer() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const rafRef = useRef(null)
  const best = useArcadeStore((s) => s.getBest(GAME_ID))
  const runs = useArcadeStore((s) => s.getRuns(GAME_ID))
  const registerRun = useArcadeStore((s) => s.registerRun)

  const [phase, setPhase] = useState('idle')
  const [hud, setHud] = useState({ score: 0, lives: START_LIVES, boosted: false })
  const [result, setResult] = useState({ score: 0, isNewHigh: false, quip: '' })

  const freshEngine = useCallback(() => ({
    state: 'idle',
    dims: { w: 380, h: 560 },
    lane: 1,
    playerX: laneCenter({ w: 380, h: 560 }, 1),
    traffic: [],
    nitros: [],
    streaks: [],
    popups: [],
    dashOffset: 0,
    spawnTimer: 0,
    nitroTimer: 2,
    elapsed: 0,
    score: 0,
    lives: START_LIVES,
    invincible: 0,
    boost: 0,
    hudBoosted: false,
    shake: { time: 0, mag: 0 },
  }), [])

  useEffect(() => { engineRef.current = freshEngine() }, [freshEngine])

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const engine = engineRef.current
    if (!canvas || !engine) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const w = Math.max(240, rect.width)
    const h = Math.max(320, rect.height)
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    engine.dims = { w, h }
    engine.playerX = laneCenter(engine.dims, engine.lane)
  }, [])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  const shiftLane = useCallback((dir) => {
    const engine = engineRef.current
    if (!engine || engine.state !== 'playing') return
    engine.lane = Math.max(0, Math.min(LANES - 1, engine.lane + dir))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onPointerDown = (clientX) => {
      const rect = canvas.getBoundingClientRect()
      const relX = clientX - rect.left
      shiftLane(relX < rect.width / 2 ? -1 : 1)
    }
    const onClick = (e) => onPointerDown(e.clientX)
    const onTouchStart = (e) => { if (e.touches[0]) onPointerDown(e.touches[0].clientX) }
    const onKeyDown = (e) => {
      if (e.code === 'ArrowLeft') shiftLane(-1)
      if (e.code === 'ArrowRight') shiftLane(1)
    }
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    return () => {
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [shiftLane])

  const endGame = useCallback(() => {
    const engine = engineRef.current
    engine.state = 'gameover'
    const isNewHigh = registerRun(GAME_ID, engine.score, 'max')
    setResult({ score: engine.score, isNewHigh, quip: QUIPS[Math.floor(Math.random() * QUIPS.length)] })
    setPhase('gameover')
    if (isNewHigh) playHighScore()
  }, [registerRun])

  const startGame = useCallback(() => {
    const dims = engineRef.current?.dims || { w: 380, h: 560 }
    engineRef.current = { ...freshEngine(), dims }
    engineRef.current.state = 'playing'
    engineRef.current.lane = 1
    engineRef.current.playerX = laneCenter(dims, 1)
    setHud({ score: 0, lives: START_LIVES, boosted: false })
    setPhase('playing')
  }, [freshEngine])

  useEffect(() => {
    if (phase !== 'playing') return
    let lastT = performance.now()
    const loop = (t) => {
      const dt = Math.min(0.05, (t - lastT) / 1000)
      lastT = t
      const engine = engineRef.current
      const canvas = canvasRef.current
      if (!engine || !canvas || engine.state !== 'playing') return
      const ctx = canvas.getContext('2d')
      const { w, h } = engine.dims

      engine.elapsed += dt
      if (engine.invincible > 0) engine.invincible = Math.max(0, engine.invincible - dt)
      if (engine.boost > 0) engine.boost = Math.max(0, engine.boost - dt)
      const boosted = engine.boost > 0

      const baseSpeed = Math.min(360, 150 + engine.elapsed * 6.5)
      const speed = boosted ? baseSpeed * 1.75 : baseSpeed
      const spawnInterval = Math.max(0.55, 1.15 - engine.elapsed * 0.012)
      const carW = (w * 0.86 / LANES) * 0.56
      const carH = carW * 1.7

      // road markings scroll
      engine.dashOffset = (engine.dashOffset + speed * dt) % 46

      // player easing toward target lane
      const targetX = laneCenter(engine.dims, engine.lane)
      engine.playerX += (targetX - engine.playerX) * Math.min(1, dt * 16)

      // spawn traffic
      engine.spawnTimer += dt
      if (engine.spawnTimer >= spawnInterval) {
        engine.spawnTimer = 0
        const lane = Math.floor(Math.random() * LANES)
        engine.traffic.push({
          id: Math.random(), lane, y: -carH,
          vy: speed * (0.78 + Math.random() * 0.18),
          color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
        })
      }

      // spawn nitro pickups
      engine.nitroTimer -= dt
      if (engine.nitroTimer <= 0) {
        engine.nitroTimer = 4.5 + Math.random() * 3
        const lane = Math.floor(Math.random() * LANES)
        if (!engine.traffic.some((c) => c.lane === lane && c.y < carH * 2)) {
          engine.nitros.push({ id: Math.random(), lane, y: -carH, vy: speed * 0.75, spin: 0 })
        }
      }

      const playerY = h - carH * 1.1
      let scoreChanged = false, livesChanged = false
      let boostChanged = boosted !== engine.hudBoosted
      engine.hudBoosted = boosted

      // distance score
      engine.score += Math.round(speed * dt * (boosted ? 0.6 : 0.3))
      scoreChanged = true

      // update traffic
      const nextTraffic = []
      for (const c of engine.traffic) {
        c.y += c.vy * dt
        const laneX = laneCenter(engine.dims, c.lane)
        const collide = c.lane === engine.lane &&
          c.y + carH / 2 > playerY - carH / 2 && c.y - carH / 2 < playerY + carH / 2
        if (collide && engine.invincible <= 0) {
          engine.lives -= 1
          livesChanged = true
          engine.invincible = INVINCIBLE_TIME
          engine.shake = { time: 0.3, mag: 10 }
          playCrash()
          engine.popups.push({ x: laneX, y: c.y, vy: -55, life: 0.7, maxLife: 0.7, text: 'CRASH', color: '#F4506A' })
          continue
        }
        if (c.y - carH > h) {
          engine.score += 5
          scoreChanged = true
          continue
        }
        nextTraffic.push(c)
      }
      engine.traffic = nextTraffic

      // update nitros
      const nextNitros = []
      for (const n of engine.nitros) {
        n.y += n.vy * dt
        n.spin += dt * 4
        const laneX = laneCenter(engine.dims, n.lane)
        const collected = n.lane === engine.lane && n.y + carH / 2 > playerY - carH / 2 && n.y - carH / 2 < playerY + carH / 2
        if (collected) {
          engine.boost = BOOST_TIME
          engine.score += 20
          scoreChanged = true; boostChanged = true
          playBoost()
          engine.popups.push({ x: laneX, y: n.y, vy: -60, life: 0.7, maxLife: 0.7, text: 'NITRO!', color: '#1EC4B0' })
          continue
        }
        if (n.y - carH > h) continue
        nextNitros.push(n)
      }
      engine.nitros = nextNitros

      // speed streak particles when boosted
      if (boosted && Math.random() < 0.6) {
        engine.streaks.push({ x: Math.random() * w, y: -10, vy: speed * 2.2, life: 0.4, maxLife: 0.4 })
      }
      engine.streaks = engine.streaks.filter((s) => { s.y += s.vy * dt; s.life -= dt; return s.life > 0 })

      engine.popups = engine.popups.filter((p) => { p.y += p.vy * dt; p.life -= dt; return p.life > 0 })
      if (engine.shake.time > 0) engine.shake.time = Math.max(0, engine.shake.time - dt)

      // --- draw ---
      ctx.clearRect(0, 0, w, h)
      const roadW = w * 0.86
      const roadX0 = (w - roadW) / 2
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
      bgGrad.addColorStop(0, 'rgba(30,196,176,0.06)')
      bgGrad.addColorStop(1, 'rgba(163,230,53,0.05)')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, w, h)

      ctx.save()
      if (engine.shake.time > 0) {
        const mag = engine.shake.mag * (engine.shake.time / 0.3)
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag)
      }

      // road surface
      ctx.fillStyle = 'rgba(20,20,26,0.9)'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(roadX0, 0, roadW, h, 14)
      else ctx.rect(roadX0, 0, roadW, h)
      ctx.fill()

      // lane dividers
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'
      ctx.lineWidth = 3
      for (let i = 1; i < LANES; i++) {
        const x = roadX0 + (roadW / LANES) * i
        ctx.setLineDash([20, 18])
        ctx.lineDashOffset = -engine.dashOffset
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      ctx.setLineDash([])

      // road edges
      ctx.strokeStyle = 'rgba(247,163,49,0.8)'
      ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(roadX0 + 3, 0); ctx.lineTo(roadX0 + 3, h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(roadX0 + roadW - 3, 0); ctx.lineTo(roadX0 + roadW - 3, h); ctx.stroke()

      // speed streaks
      for (const s of engine.streaks) {
        ctx.strokeStyle = `rgba(255,255,255,${Math.max(0, s.life / s.maxLife) * 0.5})`
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x, s.y - 22); ctx.stroke()
      }

      // nitro pickups
      for (const n of engine.nitros) {
        const x = laneCenter(engine.dims, n.lane)
        ctx.save()
        ctx.translate(x, n.y)
        ctx.rotate(n.spin)
        ctx.fillStyle = '#1EC4B0'
        ctx.shadowColor = 'rgba(30,196,176,0.7)'; ctx.shadowBlur = 12
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2
          const a2 = a + Math.PI / 5
          ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11)
          ctx.lineTo(Math.cos(a2) * 5, Math.sin(a2) * 5)
        }
        ctx.closePath(); ctx.fill()
        ctx.restore()
      }

      // traffic cars
      for (const c of engine.traffic) {
        drawCar(ctx, laneCenter(engine.dims, c.lane), c.y, carW, carH, c.color)
      }

      // player car (flicker while invincible)
      const playerVisible = engine.invincible <= 0 || Math.floor(engine.invincible * 12) % 2 === 0
      if (playerVisible) {
        drawCar(ctx, engine.playerX, playerY, carW * 1.02, carH * 1.02, boosted ? { body: '#A3E635', dark: '#5C8A1B' } : { body: '#3B82F6', dark: '#1D4ED8' })
      }

      // popups
      for (const p of engine.popups) {
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life / p.maxLife); ctx.fillStyle = p.color
        ctx.font = '700 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.text, p.x, p.y); ctx.restore()
      }

      ctx.restore()

      if (scoreChanged || livesChanged || boostChanged) {
        setHud({ score: engine.score, lives: engine.lives, boosted })
      }
      if (engine.lives <= 0) { endGame(); return }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, endGame])

  return (
    <GameFrame
      icon={Car}
      title="Turbo Racer"
      description="Weave through traffic, grab nitro, survive the highway."
      instructions="Tap left/right side, or use arrow keys, to switch lanes"
      phase={phase}
      onStart={startGame}
      bestValue={best ?? 0}
      runs={runs}
      resultLabel="Score"
      resultValue={result.score}
      resultExtra={result.quip}
      isNewHigh={result.isNewHigh}
      hud={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold tabular-nums">{hud.score}</span>
            {hud.boosted && <Badge tone="teal" className="animate-pop gap-1"><Gauge size={11} /> NITRO</Badge>}
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: START_LIVES }).map((_, i) => (
              <Car key={i} size={16} className={i < hud.lives ? 'text-primary-600 dark:text-primary-400' : 'text-black/10 dark:text-white/10'} />
            ))}
          </div>
        </div>
      }
    >
      <canvas ref={canvasRef} className="w-full h-full rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-light dark:border-border-dark touch-none cursor-pointer" />
    </GameFrame>
  )
}
