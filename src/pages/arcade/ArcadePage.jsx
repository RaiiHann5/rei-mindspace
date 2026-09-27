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

/* Was cyan-over-purple; retinted to the single ember corner glow used
   everywhere else in Space+ so the Break Room belongs to the same console. */
.retro-root-glow {
  background-image:
    radial-gradient(circle at top right, rgba(255, 122, 41, 0.11), transparent 34%),
    radial-gradient(circle at bottom left, rgba(193, 64, 13, 0.07), transparent 30%);
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

// Game accent tones.
//
// This used to be seven saturated neons (cyan / violet / amber / rose / lime /
// orange / teal), each with its own coloured outer glow. Seven hues at once read
// as a rainbow and fought the ember accent everywhere else in the app, and the
// per-card neon bloom meant there was no "one glow per screen" left.
//
// The keys are kept because GAMES references them by name. The values now come
// from the Space+ palette — two ember, two teal, amber, rose, dusk — so seven
// games still read as distinct but the page holds together as one system. The
// retro character (2px borders, hard offset shadows, scanlines, the pixel face)
// is untouched; only the colour is brought in line.
const TONES = {
  cyan: {
    iconBox:
      'border-teal-500/50 bg-teal-500/10 text-teal-700 dark:border-teal-300/40 dark:bg-teal-500/10 dark:text-teal-300',
    badge:
      'border-teal-500/40 bg-teal-500/10 text-teal-700 dark:border-teal-300/30 dark:bg-teal-500/10 dark:text-teal-300',
    glow:
      'from-teal-500/10 via-teal-500/[0.06] to-transparent dark:from-teal-500/15 dark:via-teal-500/[0.05] dark:to-transparent',
    cta:
      'border-teal-600/50 bg-teal-500 text-white hover:bg-teal-600 dark:border-teal-300/40 dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400',
    focus: 'focus-visible:ring-teal-500/50 dark:focus-visible:ring-teal-300/60',
    cardHover:
      'hover:border-teal-500/50 dark:hover:border-teal-300/40 dark:hover:shadow-[10px_10px_0_0_rgba(110,140,136,0.22)]',
    statIcon:
      'border-teal-500/40 bg-teal-500/10 text-teal-700 dark:border-teal-300/30 dark:bg-teal-500/10 dark:text-teal-300',
    text: 'text-teal-700 dark:text-teal-300',
    dot: 'bg-teal-500 dark:bg-teal-300',
  },
  violet: {
    iconBox:
      'border-[color:var(--line-strong)] bg-black/[0.05] text-dusk dark:bg-white/[0.06] dark:text-dusk',
    badge:
      'border-[color:var(--line)] bg-black/[0.04] text-muted-light dark:bg-white/[0.05] dark:text-muted-dark',
    glow:
      'from-black/[0.06] via-black/[0.03] to-transparent dark:from-white/[0.05] dark:via-white/[0.03] dark:to-transparent',
    cta:
      'border-[color:var(--line-strong)] bg-panel2-light text-ink-light hover:border-ember-500/60 hover:text-ember-500 dark:bg-panel2-dark dark:text-ink-dark dark:hover:text-ember-300',
    focus: 'focus-visible:ring-dusk/50',
    cardHover:
      'hover:border-[color:var(--line-strong)] dark:hover:shadow-[10px_10px_0_0_rgba(0,0,0,0.45)]',
    statIcon:
      'border-[color:var(--line)] bg-black/[0.04] text-dusk dark:bg-white/[0.05] dark:text-dusk',
    text: 'text-muted-light dark:text-muted-dark',
    dot: 'bg-dusk',
  },
  amber: {
    iconBox:
      'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:border-amber-300/40 dark:bg-amber-500/10 dark:text-amber-300',
    badge:
      'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-300',
    glow:
      'from-amber-500/10 via-amber-500/[0.06] to-transparent dark:from-amber-500/15 dark:via-amber-500/[0.05] dark:to-transparent',
    cta:
      'border-amber-600/50 bg-amber-500 text-ink-light hover:bg-amber-600 dark:border-amber-300/40 dark:bg-amber-500 dark:text-ink-light dark:hover:bg-amber-400',
    focus: 'focus-visible:ring-amber-500/50 dark:focus-visible:ring-amber-300/60',
    cardHover:
      'hover:border-amber-500/50 dark:hover:border-amber-300/40 dark:hover:shadow-[10px_10px_0_0_rgba(192,168,118,0.20)]',
    statIcon:
      'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500 dark:bg-amber-300',
  },
  rose: {
    iconBox:
      'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:border-rose-300/40 dark:bg-rose-500/10 dark:text-rose-300',
    badge:
      'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:border-rose-300/30 dark:bg-rose-500/10 dark:text-rose-300',
    glow:
      'from-rose-500/10 via-rose-500/[0.06] to-transparent dark:from-rose-500/15 dark:via-rose-500/[0.05] dark:to-transparent',
    cta:
      'border-rose-600/50 bg-rose-500 text-white hover:bg-rose-600 dark:border-rose-300/40 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400',
    focus: 'focus-visible:ring-rose-500/50 dark:focus-visible:ring-rose-300/60',
    cardHover:
      'hover:border-rose-500/50 dark:hover:border-rose-300/40 dark:hover:shadow-[10px_10px_0_0_rgba(168,83,95,0.22)]',
    statIcon:
      'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:border-rose-300/30 dark:bg-rose-500/10 dark:text-rose-300',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500 dark:bg-rose-300',
  },
  lime: {
    iconBox:
      'border-ember-500/50 bg-ember-500/10 text-ember-700 dark:border-ember-300/40 dark:bg-ember-500/10 dark:text-ember-300',
    badge:
      'border-ember-500/40 bg-ember-500/10 text-ember-700 dark:border-ember-300/30 dark:bg-ember-500/10 dark:text-ember-300',
    glow:
      'from-ember-500/12 via-ember-500/[0.06] to-transparent dark:from-ember-500/18 dark:via-ember-500/[0.06] dark:to-transparent',
    cta:
      'border-ember-700/50 bg-ember-500 text-accent-ink hover:bg-ember-600 dark:border-ember-300/40 dark:bg-ember-500 dark:text-accent-ink dark:hover:bg-ember-400',
    focus: 'focus-visible:ring-ember-500/50 dark:focus-visible:ring-ember-300/60',
    cardHover:
      'hover:border-ember-500/50 dark:hover:border-ember-300/40 dark:hover:shadow-[10px_10px_0_0_rgba(193,64,13,0.26)]',
    statIcon:
      'border-ember-500/40 bg-ember-500/10 text-ember-700 dark:border-ember-300/30 dark:bg-ember-500/10 dark:text-ember-300',
    text: 'text-ember-700 dark:text-ember-300',
    dot: 'bg-ember-500 dark:bg-ember-300',
  },
  orange: {
    iconBox:
      'border-ember-300/50 bg-ember-300/10 text-ember-700 dark:border-ember-300/40 dark:bg-ember-300/10 dark:text-ember-300',
    badge:
      'border-ember-300/40 bg-ember-300/10 text-ember-700 dark:border-ember-300/30 dark:bg-ember-300/10 dark:text-ember-300',
    glow:
      'from-ember-300/12 via-ember-300/[0.06] to-transparent dark:from-ember-300/16 dark:via-ember-300/[0.05] dark:to-transparent',
    cta:
      'border-ember-700/50 bg-ember-300 text-accent-ink hover:bg-ember-400 dark:border-ember-300/40 dark:bg-ember-300 dark:text-accent-ink dark:hover:bg-ember-400',
    focus: 'focus-visible:ring-ember-300/50',
    cardHover:
      'hover:border-ember-300/50 dark:hover:border-ember-300/40 dark:hover:shadow-[10px_10px_0_0_rgba(255,179,67,0.22)]',
    statIcon:
      'border-ember-300/40 bg-ember-300/10 text-ember-700 dark:border-ember-300/30 dark:bg-ember-300/10 dark:text-ember-300',
    text: 'text-ember-700 dark:text-ember-300',
    dot: 'bg-ember-300',
  },
  teal: {
    iconBox:
      'border-teal-300/50 bg-teal-300/10 text-teal-700 dark:border-teal-300/35 dark:bg-teal-300/10 dark:text-teal-300',
    badge:
      'border-teal-300/40 bg-teal-300/10 text-teal-700 dark:border-teal-300/30 dark:bg-teal-300/10 dark:text-teal-300',
    glow:
      'from-teal-300/10 via-teal-300/[0.06] to-transparent dark:from-teal-300/14 dark:via-teal-300/[0.05] dark:to-transparent',
    cta:
      'border-teal-600/50 bg-teal-300 text-ink-light hover:bg-teal-400 dark:border-teal-300/35 dark:bg-teal-300 dark:text-ink-light dark:hover:bg-teal-200',
    focus: 'focus-visible:ring-teal-300/50',
    cardHover:
      'hover:border-teal-300/50 dark:hover:border-teal-300/35 dark:hover:shadow-[10px_10px_0_0_rgba(166,189,185,0.20)]',
    statIcon:
      'border-teal-300/40 bg-teal-300/10 text-teal-700 dark:border-teal-300/30 dark:bg-teal-300/10 dark:text-teal-300',
    text: 'text-teal-700 dark:text-teal-300',
    dot: 'bg-teal-300',
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

  const secondaryBtn = `${baseBtn} border-[color:var(--line-strong)] bg-panel2-light text-ink-light shadow-[4px_4px_0_0_rgba(96,62,38,0.20)] hover:border-ember-500/50 dark:bg-panel2-dark dark:text-ink-dark dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.55)] dark:hover:border-ember-500/40`

  // The one gradient in the Arcade: the primary action. Was flat zinc, which
  // read as "disabled" next to the lime filter chips.
  const primaryBtn = `${baseBtn} border-ember-700/40 bg-accent-gradient text-accent-ink shadow-[4px_4px_0_0_rgba(193,64,13,0.30)] hover:brightness-110`

  const soundBtn = `${baseBtn} ${
    soundOn
      ? 'border-teal-500/60 bg-teal-500/12 text-teal-700 shadow-[4px_4px_0_0_rgba(96,62,38,0.18)] dark:border-teal-300/40 dark:bg-teal-500/12 dark:text-teal-300 dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.55)]'
      : secondaryBtn
  }`

  const getFilterClass = (type) => {
    const base =
      'retro-pixel inline-flex items-center gap-2 border-2 px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-all duration-200 active:translate-x-1 active:translate-y-1 active:shadow-none'

    if (filter === type) {
      return `${base} border-ember-700/40 bg-accent-gradient text-accent-ink shadow-[4px_4px_0_0_rgba(193,64,13,0.28)]`
    }

    return `${base} border-[color:var(--line-strong)] bg-panel2-light text-muted-light shadow-[4px_4px_0_0_rgba(96,62,38,0.16)] hover:border-ember-500/40 hover:text-ember-700 dark:bg-panel2-dark dark:text-muted-dark dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.55)] dark:hover:text-ember-300`
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
          'border-[color:var(--line)] bg-black/[0.04] text-dusk dark:bg-white/[0.05] dark:text-dusk',
      },
      {
        label: 'Status',
        value: runs > 0 ? 'Pernah dimainkan' : 'Belum dimainkan',
        icon: Flame,
        iconClass:
          'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-300',
      },
    ]

    content = (
      <>
        <section className="retro-card scanlines relative overflow-hidden rounded-3xl border-2 border-[color:var(--line-strong)] bg-surface-light p-6 shadow-[10px_10px_0_0_rgba(96,62,38,0.18)] backdrop-blur-xl transition-colors duration-300 animate-arcade-fade-up dark:bg-surface-dark dark:shadow-[10px_10px_0_0_rgba(0,0,0,0.60)]">
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
                      ? 'border-teal-500/60 bg-teal-500/12 text-teal-700 shadow-[4px_4px_0_0_rgba(96,62,38,0.18)] dark:border-teal-300/40 dark:bg-teal-500/12 dark:text-teal-300 dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.55)]'
                      : 'border-[color:var(--line-strong)] bg-panel2-light text-muted-light shadow-[4px_4px_0_0_rgba(96,62,38,0.16)] hover:border-ember-500/40 dark:bg-panel2-dark dark:text-muted-dark dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.55)] dark:hover:border-ember-500/40'
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
                      ? 'border-amber-600/50 bg-amber-500 text-ink-light shadow-[4px_4px_0_0_rgba(154,133,87,0.35)] hover:bg-amber-600 dark:border-amber-300/50 dark:bg-amber-500 dark:text-ink-light'
                      : 'border-[color:var(--line-strong)] bg-panel2-light text-muted-light shadow-[4px_4px_0_0_rgba(96,62,38,0.16)] hover:border-amber-500/50 hover:text-amber-700 dark:bg-panel2-dark dark:text-muted-dark dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.55)] dark:hover:border-amber-300/50 dark:hover:text-amber-300'
                  }`}
                >
                  <Star
                    size={14}
                    className={
                      isActiveFav ? 'fill-ink-light text-ink-light dark:fill-ink-dark dark:text-ink-dark' : ''
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-dusk">
                    Now playing
                  </p>
                  <h1 className="retro-pixel mt-2 text-xl font-black uppercase tracking-tight text-ink-light dark:text-ink-dark sm:text-2xl">
                    {active.name}
                  </h1>
                  <p className="mt-2 text-xs text-muted-light dark:text-muted-dark">
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
                    className="scanlines relative overflow-hidden rounded-2xl border-2 border-[color:var(--line)] bg-panel2-light p-4 shadow-[6px_6px_0_0_rgba(96,62,38,0.14)] animate-arcade-fade-up dark:bg-panel2-dark dark:shadow-[6px_6px_0_0_rgba(0,0,0,0.55)]"
                    style={{ animationDelay: `${140 + index * 70}ms` }}
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 ${item.iconClass}`}
                      >
                        <StatIcon size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-[0.22em] text-dusk">
                          {item.label}
                        </p>
                        <p className="mt-1 truncate text-sm font-black uppercase text-ink-light dark:text-ink-dark">
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
          className="scanlines relative overflow-hidden rounded-3xl border-2 border-[color:var(--line-strong)] bg-surface-light p-6 shadow-[10px_10px_0_0_rgba(96,62,38,0.18)] backdrop-blur-xl animate-arcade-fade-up dark:bg-surface-dark dark:shadow-[10px_10px_0_0_rgba(0,0,0,0.60)] sm:p-8"
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
          'border-teal-500/40 bg-teal-500/10 text-teal-700 dark:border-teal-300/30 dark:bg-teal-500/10 dark:text-teal-300',
      },
      {
        label: 'Best tersimpan',
        value: `${stats.savedScores}/${GAMES.length}`,
        icon: Trophy,
        className:
          'border-[color:var(--line)] bg-black/[0.04] text-dusk dark:bg-white/[0.05] dark:text-dusk',
      },
      {
        label: 'Top game',
        value: stats.topName,
        icon: Flame,
        className:
          'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-300',
      },
    ]

    content = (
      <>
        <section className="retro-card scanlines relative overflow-hidden rounded-3xl border-2 border-[color:var(--line-strong)] bg-surface-light p-6 shadow-[10px_10px_0_0_rgba(96,62,38,0.18)] backdrop-blur-xl animate-arcade-fade-up dark:bg-surface-dark dark:shadow-[10px_10px_0_0_rgba(0,0,0,0.60)] sm:p-8">
          <div className="pointer-events-none absolute inset-0 retro-grid opacity-20 dark:opacity-25" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ember-500/10 via-ember-500/[0.05] to-transparent dark:from-ember-500/14 dark:via-ember-500/[0.05] dark:to-transparent" />
          <div className="card-shine" />

          <div
            className="pointer-events-none absolute right-10 top-12 h-3 w-3 bg-ember-500/70 animate-arcade-float"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="pointer-events-none absolute right-24 top-24 h-2 w-2 bg-ember-300/60 animate-arcade-float dark:bg-ember-400/70"
            style={{ animationDelay: '0.8s' }}
          />
          <div
            className="pointer-events-none absolute bottom-10 right-16 h-2.5 w-2.5 bg-rose-500/70 animate-arcade-float dark:bg-rose-400/70"
            style={{ animationDelay: '1.4s' }}
          />

          <div className="relative z-10 flex flex-col gap-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 border-2 border-teal-500/40 bg-teal-500/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-teal-700 dark:border-teal-300/30 dark:bg-teal-500/10 dark:text-teal-300">
                <Sparkles size={13} className="animate-arcade-blink" />
                Retro Arcade
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`${baseBtn} px-3 ${
                    soundOn
                      ? 'border-teal-500/60 bg-teal-500/12 text-teal-700 shadow-[4px_4px_0_0_rgba(96,62,38,0.18)] dark:border-teal-300/40 dark:bg-teal-500/12 dark:text-teal-300 dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.55)]'
                      : 'border-[color:var(--line-strong)] bg-panel2-light text-muted-light shadow-[4px_4px_0_0_rgba(96,62,38,0.16)] hover:border-ember-500/40 dark:bg-panel2-dark dark:text-muted-dark dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.55)] dark:hover:border-ember-500/40'
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
              <p className="animate-arcade-blink text-[10px] font-bold uppercase tracking-[0.35em] text-dusk">
                Insert coin to continue
              </p>

              <h1 className="retro-pixel text-3xl font-black uppercase tracking-tight text-ink-light dark:text-ink-dark sm:text-4xl">
                <span className="bg-gradient-to-r from-ember-300 via-ember-500 to-ember-700 bg-clip-text text-transparent">
                  Arcade
                </span>
                <span className="ml-2 inline-block w-[0.5ch] animate-arcade-blink text-ember-600 dark:text-ember-300">
                  _
                </span>
              </h1>

              <p className="text-sm leading-relaxed text-muted-light dark:text-muted-dark">
                Pilih mini game buat reset otak. Skor, jumlah main, dan favorit
                disimpan di mesin arcade ini.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={playRandom}
                className={`${baseBtn} border-ember-700/40 bg-accent-gradient text-accent-ink shadow-[4px_4px_0_0_rgba(193,64,13,0.30)] hover:brightness-110`}
              >
                <Dices size={14} />
                Main acak
              </button>

              <div className="inline-flex items-center gap-2 border-2 border-[color:var(--line)] bg-panel2-light px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-light shadow-[4px_4px_0_0_rgba(96,62,38,0.16)] dark:bg-panel2-dark dark:text-muted-dark dark:shadow-[4px_4px_0_0_rgba(0,0,0,0.55)]">
                <Gamepad2 size={14} className="text-ember-600 dark:text-ember-300" />
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
                className="scanlines relative overflow-hidden rounded-2xl border-2 border-[color:var(--line-strong)] bg-surface-light p-4 shadow-[8px_8px_0_0_rgba(96,62,38,0.16)] backdrop-blur-xl animate-arcade-fade-up dark:bg-surface-dark dark:shadow-[8px_8px_0_0_rgba(0,0,0,0.55)]"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-b from-black/[0.04] to-transparent opacity-50 blur-2xl dark:from-white/[0.04]" />

                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center border-2 ${item.className}`}
                  >
                    <StatIcon size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-dusk">
                      {item.label}
                    </p>
                    <p
                      className="mt-1 truncate text-lg font-black uppercase text-ink-light dark:text-ink-dark"
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
            className="scanlines relative overflow-hidden rounded-3xl border-2 border-dashed border-[color:var(--line-strong)] bg-panel2-light p-10 text-center animate-arcade-fade-up dark:bg-panel2-dark"
            style={{ animationDelay: '160ms' }}
          >
            <div className="relative z-10">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Star size={20} />
              </div>

              <h2 className="retro-pixel text-sm font-black uppercase tracking-[0.2em] text-ink-light dark:text-ink-dark">
                Belum ada favorit
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm text-muted-light dark:text-muted-dark">
                Klik ikon bintang pada kartu game untuk menyimpannya ke favorit.
              </p>

              <button
                type="button"
                onClick={() => changeFilter('all')}
                className={`${baseBtn} mt-6 border-ember-700/40 bg-accent-gradient text-accent-ink shadow-[4px_4px_0_0_rgba(193,64,13,0.30)] hover:brightness-110`}
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
              <h2 className="retro-pixel text-xs font-black uppercase tracking-[0.24em] text-muted-light dark:text-muted-dark">
                Level select
              </h2>
              <span className="text-[10px] uppercase tracking-[0.2em] text-dusk">
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
                    className={`retro-card scanlines group relative overflow-hidden rounded-2xl border-2 border-[color:var(--line-strong)] bg-surface-light p-5 shadow-[8px_8px_0_0_rgba(96,62,38,0.16)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:-rotate-1 focus-visible:outline-none focus-visible:ring-2 ${tone.focus} animate-arcade-fade-up dark:bg-surface-dark dark:shadow-[8px_8px_0_0_rgba(0,0,0,0.55)] ${tone.cardHover}`}
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
                                : 'border-[color:var(--line)] bg-black/[0.03] text-dusk dark:bg-white/[0.04] dark:text-dusk'
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
                                ? 'border-amber-600/50 bg-amber-500 text-ink-light shadow-[4px_4px_0_0_rgba(154,133,87,0.30)] hover:bg-amber-600 dark:border-amber-300/50 dark:bg-amber-500 dark:text-ink-light'
                                : 'border-[color:var(--line)] bg-panel2-light text-dusk hover:border-amber-500/60 hover:text-amber-700 dark:bg-panel2-dark dark:hover:text-amber-300 dark:border-[color:var(--line)] dark:bg-panel2-dark dark:text-dusk dark:hover:border-amber-300/50 dark:hover:text-amber-300'
                            }`}
                          >
                            <Star
                              size={15}
                              className={
                                isFavorite
                                  ? 'fill-ink-light text-ink-light dark:fill-ink-dark dark:text-ink-dark'
                                  : ''
                              }
                            />
                          </button>
                        </div>
                      </div>

                      <h3 className="retro-pixel mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-light dark:text-ink-dark">
                        {g.name}
                      </h3>

                      <p className="mb-4 text-xs leading-relaxed text-muted-light dark:text-muted-dark">
                        {g.tagline}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t-2 border-dashed border-[color:var(--line)] pt-4">
                        <div className="min-w-0">
                          <p className="text-[8px] uppercase tracking-[0.24em] text-dusk">
                            Best
                          </p>
                          <p className="mt-1 truncate text-xs font-black uppercase text-ink-light dark:text-ink-dark">
                            {g.format(best)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[8px] uppercase tracking-[0.24em] text-dusk">
                            Runs
                          </p>
                          <p className="mt-1 text-xs font-black uppercase text-ink-light dark:text-ink-dark">
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
    <div className="arcade-scope relative overflow-hidden rounded-[2rem] bg-canvas-light dark:bg-canvas-dark p-4 font-sans text-ink-light dark:text-ink-dark transition-colors duration-300 sm:p-6">
      <style>{retroStyles}</style>

      <div className="pointer-events-none absolute inset-0 retro-grid opacity-30 dark:opacity-25" />
      <div className="pointer-events-none absolute inset-0 retro-root-glow" />
      <div className="crt-overlay" />
      <div className="crt-beam h-28 bg-gradient-to-b from-ink-light/[0.04] via-ink-light/[0.02] to-transparent blur-2xl dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent" />

      <div className="relative z-10 space-y-5">{content}</div>
    </div>
  )
}