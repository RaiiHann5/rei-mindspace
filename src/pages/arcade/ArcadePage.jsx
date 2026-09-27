import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Gamepad2,
  Brain,
  Zap,
  Hammer,
  Calculator,
  Trophy,
  Play,
  Sparkles,
  Dices,
  Star,
  Flame,
  Volume2,
  VolumeX,
  Car,
  Rabbit,
} from 'lucide-react'
import { useArcadeStore } from '@/store/useArcadeStore'
import FocusDodger from './games/FocusDodger'
import MemoryMatch from './games/MemoryMatch'
import ReflexTap from './games/ReflexTap'
import WhackDistraction from './games/WhackDistraction'
import QuickMath from './games/QuickMath'
import TurboRacer from './games/TurboRacer'
import PixelBounce from './games/PixelBounce'

let sharedAudioContext = null

function scheduleBeep(
  ctx,
  { freq = 440, endFreq, time = 0, duration = 0.08, volume = 0.04, type = 'square' }
) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const startAt = ctx.currentTime + time
  const stopAt = startAt + duration + 0.02

  oscillator.type = type
  oscillator.frequency.setValueAtTime(freq, startAt)

  if (endFreq) {
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, stopAt)
  }

  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, stopAt)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start(startAt)
  oscillator.stop(stopAt)
}

function playArcadeSound(type) {
  if (typeof window === 'undefined') return

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    if (!sharedAudioContext) {
      sharedAudioContext = new AudioContext()
    }

    const ctx = sharedAudioContext

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    switch (type) {
      case 'hover':
        scheduleBeep(ctx, { freq: 320, duration: 0.035, volume: 0.012 })
        break

      case 'click':
        scheduleBeep(ctx, { freq: 520, endFreq: 620, duration: 0.07, volume: 0.03 })
        break

      case 'open':
        scheduleBeep(ctx, { freq: 392, duration: 0.07, volume: 0.03 })
        scheduleBeep(ctx, { freq: 523.25, time: 0.07, duration: 0.07, volume: 0.03 })
        scheduleBeep(ctx, { freq: 659.25, time: 0.14, duration: 0.09, volume: 0.03 })
        break

      case 'back':
        scheduleBeep(ctx, { freq: 392, endFreq: 262, duration: 0.09, volume: 0.025 })
        break

      case 'favorite':
        scheduleBeep(ctx, { freq: 660, duration: 0.06, volume: 0.03 })
        scheduleBeep(ctx, { freq: 880, time: 0.06, duration: 0.08, volume: 0.025 })
        break

      case 'random':
        scheduleBeep(ctx, { freq: 523.25, duration: 0.05, volume: 0.03 })
        scheduleBeep(ctx, { freq: 392, time: 0.05, duration: 0.05, volume: 0.025 })
        scheduleBeep(ctx, { freq: 659.25, time: 0.1, duration: 0.07, volume: 0.03 })
        break

      default:
        break
    }
  } catch {
    // ignore audio error
  }
}

const retroStyles = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

@keyframes arcadeFadeUp {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes arcadeFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes arcadeBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

@keyframes arcadeGridMove {
  from { background-position: 0 0; }
  to { background-position: 0 32px; }
}

@keyframes arcadeScan {
  0% { top: -15%; }
  100% { top: 115%; }
}

@keyframes arcadeShine {
  from { transform: translateX(-180%) skewX(-18deg); }
  to { transform: translateX(520%) skewX(-18deg); }
}

.animate-arcade-fade-up {
  animation: arcadeFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.animate-arcade-float {
  animation: arcadeFloat 5s ease-in-out infinite;
}

.animate-arcade-blink {
  animation: arcadeBlink 1.1s steps(2, start) infinite;
}

.retro-pixel {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  line-height: 1.4;
}

.retro-grid {
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.07) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: arcadeGridMove 8s linear infinite;
}

.dark .retro-grid {
  background-image:
    linear-gradient(rgba(244, 244, 245, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(244, 244, 245, 0.08) 1px, transparent 1px);
}

.retro-root-glow {
  background-image:
    radial-gradient(circle at top, rgba(6, 182, 212, 0.12), transparent 32%),
    radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.10), transparent 28%);
}

.dark .retro-root-glow {
  background-image:
    radial-gradient(circle at top, rgba(34, 211, 238, 0.14), transparent 32%),
    radial-gradient(circle at bottom right, rgba(217, 70, 239, 0.12), transparent 28%);
}

.crt-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    0deg,
    rgba(15, 23, 42, 0.045) 0px,
    rgba(15, 23, 42, 0.045) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.16;
}

.dark .crt-overlay {
  background-image: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.06) 0px,
    rgba(255, 255, 255, 0.06) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.22;
}

.crt-beam {
  position: absolute;
  left: 0;
  right: 0;
  top: -15%;
  z-index: 20;
  animation: arcadeScan 9s linear infinite;
}

.scanlines {
  position: relative;
}

.scanlines::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    0deg,
    rgba(15, 23, 42, 0.04) 0px,
    rgba(15, 23, 42, 0.04) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.14;
}

.dark .scanlines::before {
  background-image: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.05) 0px,
    rgba(255, 255, 255, 0.05) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.18;
}

.retro-card .card-shine {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
  z-index: 20;
}

.retro-card .card-shine::after {
  content: '';
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: 0;
  width: 28%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.45),
    transparent
  );
  transform: translateX(-180%) skewX(-18deg);
  opacity: 0;
}

.dark .retro-card .card-shine::after {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
}

.retro-card:hover .card-shine::after,
.retro-card:focus-visible .card-shine::after {
  animation: arcadeShine 900ms ease;
  opacity: 1;
}
`

const TONES = {
  cyan: {
    iconBox:
      'border-cyan-500/50 bg-cyan-500/10 text-cyan-600 shadow-[0_0_18px_rgba(6,182,212,0.25)] dark:border-cyan-400/60 dark:bg-cyan-500/10 dark:text-cyan-300 dark:shadow-[0_0_24px_rgba(34,211,238,0.25)]',
    badge:
      'border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/50 dark:bg-cyan-500/15 dark:text-cyan-200',
    glow:
      'from-cyan-500/15 via-cyan-500/10 to-transparent dark:from-cyan-500/30 dark:via-cyan-500/10 dark:to-transparent',
    cta:
      'border-cyan-600/50 bg-cyan-500 text-white shadow-[0_0_18px_rgba(6,182,212,0.3)] hover:bg-cyan-400 dark:border-cyan-200/70 dark:bg-cyan-400 dark:text-zinc-950 dark:shadow-[0_0_24px_rgba(34,211,238,0.35)] dark:hover:bg-cyan-300',
    focus: 'focus-visible:ring-cyan-500/50 dark:focus-visible:ring-cyan-400/70',
    cardHover:
      'hover:border-cyan-500/60 hover:shadow-[10px_10px_0_0_rgba(6,182,212,0.18)] dark:hover:border-cyan-400/70 dark:hover:shadow-[10px_10px_0_0_rgba(34,211,238,0.25)]',
    statIcon:
      'border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:border-cyan-400/40 dark:bg-cyan-500/10 dark:text-cyan-300',
    text: 'text-cyan-600 dark:text-cyan-300',
    dot: 'bg-cyan-500 dark:bg-cyan-400',
  },
  violet: {
    iconBox:
      'border-violet-500/50 bg-violet-500/10 text-violet-600 shadow-[0_0_18px_rgba(124,58,237,0.25)] dark:border-violet-400/60 dark:bg-violet-500/10 dark:text-violet-300 dark:shadow-[0_0_24px_rgba(139,92,246,0.25)]',
    badge:
      'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:border-violet-400/50 dark:bg-violet-500/15 dark:text-violet-200',
    glow:
      'from-violet-500/15 via-violet-500/10 to-transparent dark:from-violet-500/30 dark:via-violet-500/10 dark:to-transparent',
    cta:
      'border-violet-600/50 bg-violet-500 text-white shadow-[0_0_18px_rgba(124,58,237,0.3)] hover:bg-violet-400 dark:border-violet-200/70 dark:bg-violet-400 dark:text-zinc-950 dark:shadow-[0_0_24px_rgba(139,92,246,0.35)] dark:hover:bg-violet-300',
    focus: 'focus-visible:ring-violet-500/50 dark:focus-visible:ring-violet-400/70',
    cardHover:
      'hover:border-violet-500/60 hover:shadow-[10px_10px_0_0_rgba(124,58,237,0.18)] dark:hover:border-violet-400/70 dark:hover:shadow-[10px_10px_0_0_rgba(139,92,246,0.25)]',
    statIcon:
      'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-violet-300',
    text: 'text-violet-600 dark:text-violet-300',
    dot: 'bg-violet-500 dark:bg-violet-400',
  },
  amber: {
    iconBox:
      'border-amber-500/50 bg-amber-500/10 text-amber-600 shadow-[0_0_18px_rgba(245,158,11,0.25)] dark:border-amber-400/60 dark:bg-amber-500/10 dark:text-amber-300 dark:shadow-[0_0_24px_rgba(251,191,36,0.25)]',
    badge:
      'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:border-amber-400/50 dark:bg-amber-500/15 dark:text-amber-200',
    glow:
      'from-amber-500/15 via-amber-500/10 to-transparent dark:from-amber-500/30 dark:via-amber-500/10 dark:to-transparent',
    cta:
      'border-amber-600/50 bg-amber-500 text-zinc-950 shadow-[0_0_18px_rgba(245,158,11,0.3)] hover:bg-amber-400 dark:border-amber-200/70 dark:bg-amber-400 dark:text-zinc-950 dark:shadow-[0_0_24px_rgba(251,191,36,0.35)] dark:hover:bg-amber-300',
    focus: 'focus-visible:ring-amber-500/50 dark:focus-visible:ring-amber-400/70',
    cardHover:
      'hover:border-amber-500/60 hover:shadow-[10px_10px_0_0_rgba(245,158,11,0.18)] dark:hover:border-amber-400/70 dark:hover:shadow-[10px_10px_0_0_rgba(251,191,36,0.25)]',
    statIcon:
      'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-300',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  rose: {
    iconBox:
      'border-rose-500/50 bg-rose-500/10 text-rose-600 shadow-[0_0_18px_rgba(244,63,94,0.25)] dark:border-rose-400/60 dark:bg-rose-500/10 dark:text-rose-300 dark:shadow-[0_0_24px_rgba(251,113,133,0.25)]',
    badge:
      'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:border-rose-400/50 dark:bg-rose-500/15 dark:text-rose-200',
    glow:
      'from-rose-500/15 via-rose-500/10 to-transparent dark:from-rose-500/30 dark:via-rose-500/10 dark:to-transparent',
    cta:
      'border-rose-600/50 bg-rose-500 text-white shadow-[0_0_18px_rgba(244,63,94,0.3)] hover:bg-rose-400 dark:border-rose-200/70 dark:bg-rose-400 dark:text-zinc-950 dark:shadow-[0_0_24px_rgba(251,113,133,0.35)] dark:hover:bg-rose-300',
    focus: 'focus-visible:ring-rose-500/50 dark:focus-visible:ring-rose-400/70',
    cardHover:
      'hover:border-rose-500/60 hover:shadow-[10px_10px_0_0_rgba(244,63,94,0.18)] dark:hover:border-rose-400/70 dark:hover:shadow-[10px_10px_0_0_rgba(251,113,133,0.25)]',
    statIcon:
      'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-300',
    dot: 'bg-rose-500 dark:bg-rose-400',
  },
  lime: {
    iconBox:
      'border-lime-500/50 bg-lime-500/10 text-lime-600 shadow-[0_0_18px_rgba(132,204,22,0.25)] dark:border-lime-400/60 dark:bg-lime-500/10 dark:text-lime-300 dark:shadow-[0_0_24px_rgba(163,230,53,0.25)]',
    badge:
      'border-lime-500/40 bg-lime-500/10 text-lime-700 dark:border-lime-400/50 dark:bg-lime-500/15 dark:text-lime-200',
    glow:
      'from-lime-500/15 via-lime-500/10 to-transparent dark:from-lime-500/30 dark:via-lime-500/10 dark:to-transparent',
    cta:
      'border-lime-600/50 bg-lime-500 text-zinc-950 shadow-[0_0_18px_rgba(132,204,22,0.3)] hover:bg-lime-400 dark:border-lime-200/70 dark:bg-lime-400 dark:text-zinc-950 dark:shadow-[0_0_24px_rgba(163,230,53,0.35)] dark:hover:bg-lime-300',
    focus: 'focus-visible:ring-lime-500/50 dark:focus-visible:ring-lime-400/70',
    cardHover:
      'hover:border-lime-500/60 hover:shadow-[10px_10px_0_0_rgba(132,204,22,0.18)] dark:hover:border-lime-400/70 dark:hover:shadow-[10px_10px_0_0_rgba(163,230,53,0.25)]',
    statIcon:
      'border-lime-500/40 bg-lime-500/10 text-lime-600 dark:border-lime-400/40 dark:bg-lime-500/10 dark:text-lime-300',
    text: 'text-lime-600 dark:text-lime-300',
    dot: 'bg-lime-500 dark:bg-lime-400',
  },
  orange: {
    iconBox:
      'border-orange-500/50 bg-orange-500/10 text-orange-600 shadow-[0_0_18px_rgba(249,115,22,0.25)] dark:border-orange-400/60 dark:bg-orange-500/10 dark:text-orange-300 dark:shadow-[0_0_24px_rgba(251,146,60,0.25)]',
    badge:
      'border-orange-500/40 bg-orange-500/10 text-orange-700 dark:border-orange-400/50 dark:bg-orange-500/15 dark:text-orange-200',
    glow:
      'from-orange-500/15 via-orange-500/10 to-transparent dark:from-orange-500/30 dark:via-orange-500/10 dark:to-transparent',
    cta:
      'border-orange-600/50 bg-orange-500 text-white shadow-[0_0_18px_rgba(249,115,22,0.3)] hover:bg-orange-400 dark:border-orange-200/70 dark:bg-orange-400 dark:text-zinc-950 dark:shadow-[0_0_24px_rgba(251,146,60,0.35)] dark:hover:bg-orange-300',
    focus: 'focus-visible:ring-orange-500/50 dark:focus-visible:ring-orange-400/70',
    cardHover:
      'hover:border-orange-500/60 hover:shadow-[10px_10px_0_0_rgba(249,115,22,0.18)] dark:hover:border-orange-400/70 dark:hover:shadow-[10px_10px_0_0_rgba(251,146,60,0.25)]',
    statIcon:
      'border-orange-500/40 bg-orange-500/10 text-orange-600 dark:border-orange-400/40 dark:bg-orange-500/10 dark:text-orange-300',
    text: 'text-orange-600 dark:text-orange-300',
    dot: 'bg-orange-500 dark:bg-orange-400',
  },
  teal: {
    iconBox:
      'border-teal-500/50 bg-teal-500/10 text-teal-600 shadow-[0_0_18px_rgba(20,184,166,0.25)] dark:border-teal-400/60 dark:bg-teal-500/10 dark:text-teal-300 dark:shadow-[0_0_24px_rgba(45,212,191,0.25)]',
    badge:
      'border-teal-500/40 bg-teal-500/10 text-teal-700 dark:border-teal-400/50 dark:bg-teal-500/15 dark:text-teal-200',
    glow:
      'from-teal-500/15 via-teal-500/10 to-transparent dark:from-teal-500/30 dark:via-teal-500/10 dark:to-transparent',
    cta:
      'border-teal-600/50 bg-teal-500 text-white shadow-[0_0_18px_rgba(20,184,166,0.3)] hover:bg-teal-400 dark:border-teal-200/70 dark:bg-teal-400 dark:text-zinc-950 dark:shadow-[0_0_24px_rgba(45,212,191,0.35)] dark:hover:bg-teal-300',
    focus: 'focus-visible:ring-teal-500/50 dark:focus-visible:ring-teal-400/70',
    cardHover:
      'hover:border-teal-500/60 hover:shadow-[10px_10px_0_0_rgba(20,184,166,0.18)] dark:hover:border-teal-400/70 dark:hover:shadow-[10px_10px_0_0_rgba(45,212,191,0.25)]',
    statIcon:
      'border-teal-500/40 bg-teal-500/10 text-teal-600 dark:border-teal-400/40 dark:bg-teal-500/10 dark:text-teal-300',
    text: 'text-teal-600 dark:text-teal-300',
    dot: 'bg-teal-500 dark:bg-teal-400',
  },
}

const GAMES = [
  {
    id: 'focus-dodger',
    name: 'Focus Dodger',
    tagline: 'Tangkap tomat, hindari distraksi.',
    icon: Gamepad2,
    tone: 'cyan',
    Component: FocusDodger,
    category: 'Fokus',
    format: (v) => v ?? 0,
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    tagline: 'Balik kartu dan temukan semua pasangan.',
    icon: Brain,
    tone: 'violet',
    Component: MemoryMatch,
    category: 'Memori',
    format: (v) => {
      if (v === undefined || v === null) return '—'
      const total = Math.max(0, Math.floor(v))
      return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
    },
  },
  {
    id: 'reflex-tap',
    name: 'Reflex Tap',
    tagline: 'Tes kecepatan reaksi kamu.',
    icon: Zap,
    tone: 'amber',
    Component: ReflexTap,
    category: 'Refleks',
    format: (v) =>
      v === undefined || v === null ? '—' : `${Math.round(v)}ms`,
  },
  {
    id: 'whack-distraction',
    name: 'Whack-a-Distraction',
    tagline: 'Pukul notifikasi, hindari decoy.',
    icon: Hammer,
    tone: 'rose',
    Component: WhackDistraction,
    category: 'Fokus',
    format: (v) => v ?? 0,
  },
  {
    id: 'quick-math',
    name: 'Quick Math',
    tagline: 'Sprint aritmatika 30 detik.',
    icon: Calculator,
    tone: 'lime',
    Component: QuickMath,
    category: 'Logika',
    format: (v) => v ?? 0,
  },
  {
    id: 'turbo-racer',
    name: 'Turbo Racer',
    tagline: 'Selip antar lajur, sikat nitro, hindari tabrakan.',
    icon: Car,
    tone: 'orange',
    Component: TurboRacer,
    category: 'Refleks',
    format: (v) => v ?? 0,
  },
  {
    id: 'pixel-bounce',
    name: 'Pixel Bounce',
    tagline: 'Lompatin musuh, injek Grump, sikat koin ala platformer klasik.',
    icon: Rabbit,
    tone: 'teal',
    Component: PixelBounce,
    category: 'Refleks',
    format: (v) => v ?? 0,
  },
]

export default function ArcadePage() {
  const [activeId, setActiveId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [favorites, setFavorites] = useState([])
  const [soundOn, setSoundOn] = useState(true)

  const scores = useArcadeStore((s) => s.scores) ?? {}
  const active = GAMES.find((g) => g.id === activeId)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('arcade-favorites')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter((id) => GAMES.some((g) => g.id === id)))
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('arcade-favorites', JSON.stringify(favorites))
    } catch {
      // ignore
    }
  }, [favorites])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('arcade-sound')
      if (saved === 'off') {
        setSoundOn(false)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('arcade-sound', soundOn ? 'on' : 'off')
    } catch {
      // ignore
    }
  }, [soundOn])

  const visibleGames =
    filter === 'fav' ? GAMES.filter((g) => favorites.includes(g.id)) : GAMES

  const stats = useMemo(() => {
    const items = GAMES.map((g) => {
      const score = scores[g.id]
      return {
        id: g.id,
        name: g.name,
        runs: score?.runs ?? 0,
        best: score?.best,
      }
    })

    const totalRuns = items.reduce((sum, item) => sum + item.runs, 0)
    const savedScores = items.filter(
      (item) => item.best !== undefined && item.best !== null
    ).length
    const top = [...items].sort((a, b) => b.runs - a.runs)[0]

    return {
      totalRuns,
      savedScores,
      topName: top?.runs ? top.name : '—',
    }
  }, [scores])

  const playSound = (type) => {
    if (!soundOn) return
    playArcadeSound(type)
  }

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)

    if (next) {
      playArcadeSound('click')
    }
  }

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    )
    playSound('favorite')
  }

  const openGame = (id) => {
    setActiveId(id)
    playSound('open')
  }

  const goBack = () => {
    setActiveId(null)
    playSound('back')
  }

  const playRandom = () => {
    const pool = GAMES.filter((g) => g.id !== activeId)
    const next = pool[Math.floor(Math.random() * pool.length)] ?? GAMES[0]
    setActiveId(next.id)
    playSound('random')
  }

  const changeFilter = (type) => {
    setFilter(type)
    playSound('click')
  }

  const handleCardKeyDown = (event, id) => {
    if (event.target !== event.currentTarget) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openGame(id)
    }
  }

  const baseBtn =
    'retro-pixel inline-flex items-center gap-2 border-2 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-200 active:translate-x-1 active:translate-y-1 active:shadow-none'

  const secondaryBtn = `${baseBtn} border-zinc-400/70 bg-white/80 text-zinc-800 shadow-[4px_4px_0_0_rgba(148,163,184,0.45)] hover:border-zinc-500 hover:bg-zinc-100 dark:border-white/20 dark:bg-white/5 dark:text-zinc-100 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)] dark:hover:border-white/40 dark:hover:bg-white/10`

  const primaryBtn = `${baseBtn} border-zinc-900/20 bg-zinc-900 text-zinc-50 shadow-[4px_4px_0_0_rgba(148,163,184,0.45)] hover:bg-zinc-800 dark:border-zinc-100/20 dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)] dark:hover:bg-white`

  const soundBtn = `${baseBtn} ${
    soundOn
      ? 'border-lime-500/60 bg-lime-500/15 text-lime-600 shadow-[4px_4px_0_0_rgba(148,163,184,0.35)] dark:border-lime-400/50 dark:bg-lime-500/10 dark:text-lime-300 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)]'
      : secondaryBtn
  }`

  const getFilterClass = (type) => {
    const base =
      'retro-pixel inline-flex items-center gap-2 border-2 px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-all duration-200 active:translate-x-1 active:translate-y-1 active:shadow-none'

    if (filter === type) {
      return `${base} border-lime-600/50 bg-lime-500 text-zinc-950 shadow-[4px_4px_0_0_rgba(148,163,184,0.45)] dark:border-lime-300/70 dark:bg-lime-400 dark:text-zinc-950 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)]`
    }

    return `${base} border-zinc-400/70 bg-white/70 text-zinc-700 shadow-[4px_4px_0_0_rgba(148,163,184,0.4)] hover:border-zinc-500 hover:bg-zinc-100 dark:border-white/20 dark:bg-white/5 dark:text-zinc-200 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)] dark:hover:border-white/40 dark:hover:bg-white/10`
  }

  let content = null

  if (active) {
    const tone = TONES[active.tone]
    const ActiveGame = active.Component
    const ActiveIcon = active.icon
    const score = scores[active.id] ?? {}
    const best = score.best
    const runs = score.runs ?? 0
    const isActiveFav = favorites.includes(active.id)

    const statItems = [
      {
        label: 'Skor terbaik',
        value: active.format(best),
        icon: Trophy,
        iconClass: tone.statIcon,
      },
      {
        label: 'Total main',
        value: runs,
        icon: Gamepad2,
        iconClass:
          'border-zinc-500/40 bg-zinc-500/10 text-zinc-600 dark:border-zinc-500/40 dark:bg-zinc-500/10 dark:text-zinc-300',
      },
      {
        label: 'Status',
        value: runs > 0 ? 'Pernah dimainkan' : 'Belum dimainkan',
        icon: Flame,
        iconClass:
          'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300',
      },
    ]

    content = (
      <>
        <section className="retro-card scanlines relative overflow-hidden rounded-3xl border-2 border-zinc-300/90 bg-white/80 p-6 shadow-[10px_10px_0_0_rgba(148,163,184,0.4)] backdrop-blur-xl transition-colors duration-300 animate-arcade-fade-up dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:shadow-[10px_10px_0_0_rgba(9,9,11,0.9)]">
          <div
            className={`pointer-events-none absolute inset-x-0 -top-24 h-56 bg-gradient-to-b ${tone.glow} opacity-70 blur-3xl`}
          />
          <div className="card-shine" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={goBack} className={secondaryBtn}>
                <ArrowLeft size={14} />
                Kembali
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`${baseBtn} px-3 ${
                    soundOn
                      ? 'border-lime-500/60 bg-lime-500/15 text-lime-600 shadow-[4px_4px_0_0_rgba(148,163,184,0.35)] dark:border-lime-400/50 dark:bg-lime-500/10 dark:text-lime-300 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)]'
                      : 'border-zinc-400/70 bg-white/80 text-zinc-700 shadow-[4px_4px_0_0_rgba(148,163,184,0.4)] hover:border-zinc-500 hover:bg-zinc-100 dark:border-white/20 dark:bg-white/5 dark:text-zinc-200 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)] dark:hover:border-white/40 dark:hover:bg-white/10'
                  }`}
                  aria-label={soundOn ? 'Matikan sound' : 'Nyalakan sound'}
                  aria-pressed={soundOn}
                >
                  {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(active.id)}
                  className={`${baseBtn} ${
                    isActiveFav
                      ? 'border-amber-500/60 bg-amber-400/90 text-zinc-950 shadow-[0_0_18px_rgba(251,191,36,0.3)] hover:bg-amber-300 dark:border-amber-300/70 dark:bg-amber-400/90 dark:text-zinc-950'
                      : 'border-zinc-400/70 bg-white/80 text-zinc-800 shadow-[4px_4px_0_0_rgba(148,163,184,0.4)] hover:border-amber-500/50 hover:bg-amber-500/10 dark:border-white/20 dark:bg-white/5 dark:text-zinc-100 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)] dark:hover:border-amber-300/50 dark:hover:bg-amber-500/10'
                  }`}
                >
                  <Star
                    size={14}
                    className={
                      isActiveFav ? 'fill-zinc-950 text-zinc-950' : ''
                    }
                  />
                  {isActiveFav ? 'Favorit' : 'Add fav'}
                </button>

                <button type="button" onClick={playRandom} className={primaryBtn}>
                  <Dices size={14} />
                  Random
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`animate-arcade-float flex h-14 w-14 shrink-0 items-center justify-center border-2 ${tone.iconBox}`}
                >
                  <ActiveIcon size={24} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500">
                    Now playing
                  </p>
                  <h1 className="retro-pixel mt-2 text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                    {active.name}
                  </h1>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {active.tagline}
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center border-2 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] ${tone.badge}`}
              >
                {active.category}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {statItems.map((item, index) => {
                const StatIcon = item.icon

                return (
                  <div
                    key={item.label}
                    className="scanlines relative overflow-hidden rounded-2xl border-2 border-zinc-300/90 bg-zinc-50/80 p-4 shadow-[6px_6px_0_0_rgba(148,163,184,0.35)] animate-arcade-fade-up dark:border-zinc-700/80 dark:bg-zinc-950/70 dark:shadow-[6px_6px_0_0_rgba(9,9,11,0.9)]"
                    style={{ animationDelay: `${140 + index * 70}ms` }}
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 ${item.iconClass}`}
                      >
                        <StatIcon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-500">
                          {item.label}
                        </p>
                        <p className="mt-1 truncate text-sm font-black uppercase text-zinc-900 dark:text-zinc-100">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section
          className="scanlines relative overflow-hidden rounded-3xl border-2 border-zinc-300/90 bg-white/80 p-6 shadow-[10px_10px_0_0_rgba(148,163,184,0.4)] backdrop-blur-xl animate-arcade-fade-up dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:shadow-[10px_10px_0_0_rgba(9,9,11,0.9)] sm:p-8"
          style={{ animationDelay: '90ms' }}
        >
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${tone.glow} opacity-25 blur-3xl`}
          />

          <div className="relative z-10 flex justify-center">
            <ActiveGame />
          </div>
        </section>
      </>
    )
  } else {
    const overviewStats = [
      {
        label: 'Total plays',
        value: stats.totalRuns,
        icon: Gamepad2,
        className:
          'border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:border-cyan-400/40 dark:bg-cyan-500/10 dark:text-cyan-300',
      },
      {
        label: 'Best tersimpan',
        value: `${stats.savedScores}/${GAMES.length}`,
        icon: Trophy,
        className:
          'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:border-violet-400/40 dark:bg-violet-500/10 dark:text-violet-300',
      },
      {
        label: 'Top game',
        value: stats.topName,
        icon: Flame,
        className:
          'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300',
      },
    ]

    content = (
      <>
        <section className="retro-card scanlines relative overflow-hidden rounded-3xl border-2 border-zinc-300/90 bg-white/80 p-6 shadow-[10px_10px_0_0_rgba(148,163,184,0.4)] backdrop-blur-xl animate-arcade-fade-up dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:shadow-[10px_10px_0_0_rgba(9,9,11,0.9)] sm:p-8">
          <div className="pointer-events-none absolute inset-0 retro-grid opacity-20 dark:opacity-25" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-rose-500/10 dark:from-cyan-500/15 dark:via-violet-500/15 dark:to-rose-500/15" />
          <div className="card-shine" />

          <div
            className="pointer-events-none absolute right-10 top-12 h-3 w-3 bg-cyan-500/70 animate-arcade-float dark:bg-cyan-400/70"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="pointer-events-none absolute right-24 top-24 h-2 w-2 bg-violet-500/70 animate-arcade-float dark:bg-violet-400/70"
            style={{ animationDelay: '0.8s' }}
          />
          <div
            className="pointer-events-none absolute bottom-10 right-16 h-2.5 w-2.5 bg-rose-500/70 animate-arcade-float dark:bg-rose-400/70"
            style={{ animationDelay: '1.4s' }}
          />

          <div className="relative z-10 flex flex-col gap-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 border-2 border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-700 shadow-[0_0_18px_rgba(6,182,212,0.15)] dark:border-cyan-400/40 dark:bg-cyan-500/10 dark:text-cyan-200 dark:shadow-[0_0_24px_rgba(34,211,238,0.15)]">
                <Sparkles size={13} className="animate-arcade-blink" />
                Retro Arcade
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`${baseBtn} px-3 ${
                    soundOn
                      ? 'border-lime-500/60 bg-lime-500/15 text-lime-600 shadow-[4px_4px_0_0_rgba(148,163,184,0.35)] dark:border-lime-400/50 dark:bg-lime-500/10 dark:text-lime-300 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)]'
                      : 'border-zinc-400/70 bg-white/80 text-zinc-700 shadow-[4px_4px_0_0_rgba(148,163,184,0.4)] hover:border-zinc-500 hover:bg-zinc-100 dark:border-white/20 dark:bg-white/5 dark:text-zinc-200 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)] dark:hover:border-white/40 dark:hover:bg-white/10'
                  }`}
                  aria-label={soundOn ? 'Matikan sound' : 'Nyalakan sound'}
                  aria-pressed={soundOn}
                >
                  {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => changeFilter('all')}
                  className={getFilterClass('all')}
                >
                  Semua
                </button>

                <button
                  type="button"
                  onClick={() => changeFilter('fav')}
                  className={getFilterClass('fav')}
                >
                  <Star size={13} />
                  Favorit ({favorites.length})
                </button>
              </div>
            </div>

            <div className="max-w-3xl space-y-3">
              <p className="animate-arcade-blink text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-500">
                Insert coin to continue
              </p>

              <h1 className="retro-pixel text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                <span className="bg-gradient-to-r from-cyan-600 via-violet-600 to-rose-600 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.2)] dark:from-cyan-300 dark:via-violet-300 dark:to-rose-300">
                  Arcade
                </span>
                <span className="ml-2 inline-block w-[0.5ch] animate-arcade-blink text-cyan-600 dark:text-cyan-300">
                  _
                </span>
              </h1>

              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Pilih mini game buat reset otak. Skor, jumlah main, dan favorit
                disimpan di mesin arcade ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={playRandom}
                className={`${baseBtn} border-cyan-600/50 bg-cyan-500 text-white shadow-[4px_4px_0_0_rgba(148,163,184,0.45)] hover:bg-cyan-400 dark:border-cyan-200/70 dark:bg-cyan-400 dark:text-zinc-950 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)] dark:hover:bg-cyan-300`}
              >
                <Dices size={14} />
                Main acak
              </button>

              <div className="inline-flex items-center gap-2 border-2 border-zinc-400/60 bg-white/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 shadow-[4px_4px_0_0_rgba(148,163,184,0.4)] dark:border-white/15 dark:bg-white/5 dark:text-zinc-300 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)]">
                <Gamepad2 size={14} className="text-cyan-600 dark:text-cyan-300" />
                {GAMES.length} game • {stats.totalRuns} play
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {overviewStats.map((item, index) => {
            const StatIcon = item.icon

            return (
              <div
                key={item.label}
                className="scanlines relative overflow-hidden rounded-2xl border-2 border-zinc-300/90 bg-white/80 p-4 shadow-[8px_8px_0_0_rgba(148,163,184,0.4)] backdrop-blur-xl animate-arcade-fade-up dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:shadow-[8px_8px_0_0_rgba(9,9,11,0.9)]"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-b from-zinc-500/5 to-transparent opacity-50 blur-2xl dark:from-white/5" />

                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 ${item.className}`}
                  >
                    <StatIcon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-500">
                      {item.label}
                    </p>
                    <p
                      className="mt-1 truncate text-lg font-black uppercase text-zinc-900 dark:text-zinc-100"
                      title={String(item.value)}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {visibleGames.length === 0 ? (
          <section
            className="scanlines relative overflow-hidden rounded-3xl border-2 border-dashed border-zinc-400 bg-white/60 p-10 text-center animate-arcade-fade-up dark:border-zinc-700 dark:bg-zinc-900/50"
            style={{ animationDelay: '160ms' }}
          >
            <div className="relative z-10">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-amber-500/40 bg-amber-500/10 text-amber-600 shadow-[0_0_18px_rgba(245,158,11,0.2)] dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-300">
                <Star size={20} />
              </div>

              <h2 className="retro-pixel text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
                Belum ada favorit
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                Klik ikon bintang pada kartu game untuk menyimpannya ke favorit.
              </p>

              <button
                type="button"
                onClick={() => changeFilter('all')}
                className={`${baseBtn} mt-6 border-cyan-600/50 bg-cyan-500 text-white shadow-[4px_4px_0_0_rgba(148,163,184,0.45)] hover:bg-cyan-400 dark:border-cyan-200/70 dark:bg-cyan-400 dark:text-zinc-950 dark:shadow-[4px_4px_0_0_rgba(9,9,11,0.9)] dark:hover:bg-cyan-300`}
              >
                Lihat semua game
              </button>
            </div>
          </section>
        ) : (
          <>
            <div
              className="flex items-center justify-between animate-arcade-fade-up"
              style={{ animationDelay: '160ms' }}
            >
              <h2 className="retro-pixel text-xs font-black uppercase tracking-[0.24em] text-zinc-700 dark:text-zinc-300">
                Level select
              </h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500">
                {visibleGames.length} game
              </span>
            </div>

            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleGames.map((g, index) => {
                const tone = TONES[g.tone]
                const Icon = g.icon
                const score = scores[g.id]
                const best = score?.best
                const runs = score?.runs ?? 0
                const hasBest = best !== undefined && best !== null
                const isFavorite = favorites.includes(g.id)

                return (
                  <article
                    key={g.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Main ${g.name}`}
                    onClick={() => openGame(g.id)}
                    onKeyDown={(event) => handleCardKeyDown(event, g.id)}
                    onMouseEnter={() => playSound('hover')}
                    style={{ animationDelay: `${180 + index * 80}ms` }}
                    className={`retro-card scanlines group relative overflow-hidden rounded-2xl border-2 border-zinc-300/90 bg-white/80 p-5 shadow-[8px_8px_0_0_rgba(148,163,184,0.4)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:-rotate-1 focus-visible:outline-none focus-visible:ring-2 ${tone.focus} animate-arcade-fade-up dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:shadow-[8px_8px_0_0_rgba(9,9,11,0.9)] ${tone.cardHover}`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b ${tone.glow} opacity-40 blur-3xl transition duration-500 group-hover:opacity-80`}
                    />

                    <div className="card-shine" />

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center border-2 ${tone.iconBox} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        >
                          <Icon size={21} />
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 border-2 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
                              hasBest
                                ? tone.badge
                                : 'border-zinc-400 bg-zinc-100/80 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-950/60 dark:text-zinc-400'
                            }`}
                          >
                            <Trophy size={11} />
                            {hasBest ? g.format(best) : 'No score'}
                          </span>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              toggleFavorite(g.id)
                            }}
                            aria-label={
                              isFavorite
                                ? `Hapus ${g.name} dari favorit`
                                : `Tandai ${g.name} sebagai favorit`
                            }
                            aria-pressed={isFavorite}
                            className={`inline-flex h-8 w-8 items-center justify-center border-2 transition-all duration-200 hover:-translate-y-0.5 ${
                              isFavorite
                                ? 'border-amber-500/60 bg-amber-400/90 text-zinc-950 shadow-[0_0_18px_rgba(251,191,36,0.3)] dark:border-amber-300/70 dark:bg-amber-400/90 dark:text-zinc-950'
                                : 'border-zinc-400 bg-white/80 text-zinc-400 hover:border-amber-500/60 hover:text-amber-500 dark:border-zinc-600 dark:bg-zinc-950/70 dark:text-zinc-400 dark:hover:border-amber-300/50 dark:hover:text-amber-300'
                            }`}
                          >
                            <Star
                              size={15}
                              className={
                                isFavorite
                                  ? 'fill-zinc-950 text-zinc-950'
                                  : ''
                              }
                            />
                          </button>
                        </div>
                      </div>

                      <h3 className="retro-pixel mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-900 dark:text-zinc-100">
                        {g.name}
                      </h3>

                      <p className="mb-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {g.tagline}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t-2 border-dashed border-zinc-300 pt-4 dark:border-zinc-700">
                        <div className="min-w-0">
                          <p className="text-[8px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-500">
                            Best
                          </p>
                          <p className="mt-1 truncate text-xs font-black uppercase text-zinc-900 dark:text-zinc-100">
                            {g.format(best)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[8px] uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-500">
                            Runs
                          </p>
                          <p className="mt-1 text-xs font-black uppercase text-zinc-900 dark:text-zinc-100">
                            {runs}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 border-2 px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] transition-all duration-300 group-hover:scale-105 ${tone.cta}`}
                        >
                          <Play size={12} />
                          Play
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
          </>
        )}
      </>
    )
  }

  return (
    // `arcade-scope` is a marker, not a style. The Arcade keeps its own
    // deliberate retro design language (2px borders, hard offset shadows,
    // scanlines, a CRT overlay) defined in `retroStyles` below. The global
    // neobrutalism neutralizer in index.css rewrites exactly those utilities
    // for the rest of the app, so this subtree opts out of it — otherwise the
    // Arcade silently loses the 2px borders and the CRT frame it is built on.
    <div className="arcade-scope relative overflow-hidden rounded-[2rem] bg-zinc-100 p-4 font-sans text-zinc-900 shadow-2xl shadow-zinc-400/20 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-black/50 sm:p-6">
      <style>{retroStyles}</style>

      <div className="pointer-events-none absolute inset-0 retro-grid opacity-30 dark:opacity-35" />
      <div className="pointer-events-none absolute inset-0 retro-root-glow" />
      <div className="crt-overlay" />
      <div className="crt-beam h-28 bg-gradient-to-b from-zinc-900/5 via-zinc-900/5 to-transparent blur-2xl dark:from-white/10 dark:via-white/5 dark:to-transparent" />

      <div className="relative z-10 space-y-5">{content}</div>
    </div>
  )
}