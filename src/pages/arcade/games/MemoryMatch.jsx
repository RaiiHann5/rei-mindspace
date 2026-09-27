import { useCallback, useEffect, useRef, useState } from 'react'
import { Brain, Flame, Star, Heart, Zap, Target, Award, Coffee, Rocket } from 'lucide-react'
import { useArcadeStore } from '@/store/useArcadeStore'
import { playCatch, playHit, playHighScore } from '@/lib/sound'
import { cn } from '@/lib/utils'
import GameFrame from '../GameFrame'

const GAME_ID = 'memory-match'
const SYMBOLS = [
  { icon: Flame, color: 'text-rose-500' },
  { icon: Star, color: 'text-amber-500' },
  { icon: Heart, color: 'text-rose-400' },
  { icon: Zap, color: 'text-primary-600 dark:text-primary-400' },
  { icon: Target, color: 'text-teal-500' },
  { icon: Award, color: 'text-amber-600' },
  { icon: Coffee, color: 'text-orange-500' },
  { icon: Rocket, color: 'text-violet-500' },
]

function shuffledDeck() {
  const deck = [...SYMBOLS, ...SYMBOLS].map((sym, i) => ({ id: i, sym, flipped: false, matched: false, mismatch: false }))
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MemoryMatch() {
  const best = useArcadeStore((s) => s.getBest(GAME_ID))
  const runs = useArcadeStore((s) => s.getRuns(GAME_ID))
  const registerRun = useArcadeStore((s) => s.registerRun)

  const [phase, setPhase] = useState('idle')
  const [deck, setDeck] = useState([])
  const [selected, setSelected] = useState([])
  const [moves, setMoves] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState({ time: 0, isNewHigh: false })
  const lockRef = useRef(false)
  const startRef = useRef(0)
  const tickRef = useRef(null)

  const startGame = useCallback(() => {
    setDeck(shuffledDeck())
    setSelected([])
    setMoves(0)
    setElapsed(0)
    lockRef.current = false
    startRef.current = performance.now()
    setPhase('playing')
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    tickRef.current = setInterval(() => setElapsed((performance.now() - startRef.current) / 1000), 200)
    return () => clearInterval(tickRef.current)
  }, [phase])

  const onFlip = (card) => {
    if (phase !== 'playing' || lockRef.current || card.flipped || card.matched) return
    const nextDeck = deck.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
    setDeck(nextDeck)
    const nextSelected = [...selected, card.id]
    setSelected(nextSelected)

    if (nextSelected.length === 2) {
      lockRef.current = true
      setMoves((m) => m + 1)
      const [a, b] = nextSelected
      const cardA = nextDeck.find((c) => c.id === a)
      const cardB = nextDeck.find((c) => c.id === b)
      if (cardA.sym === cardB.sym) {
        playCatch(1)
        setTimeout(() => {
          setDeck((d) => d.map((c) => (c.id === a || c.id === b ? { ...c, matched: true } : c)))
          setSelected([])
          lockRef.current = false
        }, 260)
      } else {
        playHit()
        setDeck((d) => d.map((c) => (c.id === a || c.id === b ? { ...c, mismatch: true } : c)))
        setTimeout(() => {
          setDeck((d) => d.map((c) => (c.id === a || c.id === b ? { ...c, flipped: false, mismatch: false } : c)))
          setSelected([])
          lockRef.current = false
        }, 700)
      }
    }
  }

  useEffect(() => {
    if (phase === 'playing' && deck.length > 0 && deck.every((c) => c.matched)) {
      clearInterval(tickRef.current)
      const finalTime = (performance.now() - startRef.current) / 1000
      const isNewHigh = registerRun(GAME_ID, finalTime, 'min')
      setResult({ time: finalTime, isNewHigh })
      setPhase('gameover')
      if (isNewHigh) playHighScore()
    }
  }, [deck, phase, registerRun])

  return (
    <GameFrame
      icon={Brain}
      title="Memory Match"
      description="Flip cards and find all 8 matching pairs as fast as you can."
      instructions="Tap two cards to flip them"
      phase={phase}
      onStart={startGame}
      bestValue={best !== undefined ? formatTime(best) : '—'}
      runs={runs}
      resultLabel="Time"
      resultValue={formatTime(result.time)}
      resultExtra={`${moves} moves`}
      isNewHigh={result.isNewHigh}
      aspect="380 / 480"
      hud={
        <div className="flex items-center justify-between text-sm">
          <span className="font-display text-xl font-semibold tabular-nums">{formatTime(elapsed)}</span>
          <span className="text-muted-light dark:text-muted-dark">{moves} moves</span>
        </div>
      }
    >
      <div className="w-full h-full rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-light dark:border-border-dark p-3">
        <div className="grid grid-cols-4 grid-rows-4 gap-2.5 h-full">
          {deck.map((card) => {
            const revealed = card.flipped || card.matched
            const Icon = card.sym.icon
            return (
              <button
                key={card.id}
                onClick={() => onFlip(card)}
                disabled={phase !== 'playing'}
                className={cn('relative w-full h-full rounded-xl', card.mismatch && 'animate-shake')}
                style={{ perspective: 400 }}
              >
                <div
                  className="relative w-full h-full rounded-xl transition-transform duration-300"
                  style={{ transformStyle: 'preserve-3d', transform: revealed ? 'rotateY(180deg)' : 'none' }}
                >
                  <div
                    className={cn(
                      'absolute inset-0 rounded-xl bg-primary-500 border-2 border-ink-light dark:border-ink-dark flex items-center justify-center transition-transform',
                      !revealed && 'hover:scale-[1.04]'
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="h-2 w-2 rounded-full bg-ink-light/60" />
                  </div>
                  <div
                    className={cn(
                      'absolute inset-0 rounded-xl flex items-center justify-center bg-white dark:bg-neutral-800 border-2',
                      card.matched ? 'border-teal-500 shadow-[0_0_0_3px_rgba(30,196,176,0.25)]' : 'border-border-light dark:border-border-dark',
                      card.matched && 'opacity-70'
                    )}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <Icon size={22} className={cn(card.sym.color, card.matched && 'animate-pop-strong')} strokeWidth={2.25} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </GameFrame>
  )
}
