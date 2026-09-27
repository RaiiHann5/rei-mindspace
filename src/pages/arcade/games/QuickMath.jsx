import { useCallback, useEffect, useRef, useState } from 'react'
import { Calculator, Flame } from 'lucide-react'
import { Badge } from '@/components/ui'
import { useArcadeStore } from '@/store/useArcadeStore'
import { playCatch, playHit, playHighScore } from '@/lib/sound'
import { cn } from '@/lib/utils'
import GameFrame from '../GameFrame'

const GAME_ID = 'quick-math'
const ROUND_SECONDS = 30
const FEEDBACK_DELAY = 420

function makeProblem() {
  const ops = ['+', '-', '×']
  const op = ops[Math.floor(Math.random() * ops.length)]
  let a, b, answer
  if (op === '+') { a = Math.floor(Math.random() * 40) + 1; b = Math.floor(Math.random() * 40) + 1; answer = a + b }
  else if (op === '-') { a = Math.floor(Math.random() * 40) + 10; b = Math.floor(Math.random() * a); answer = a - b }
  else { a = Math.floor(Math.random() * 11) + 2; b = Math.floor(Math.random() * 11) + 2; answer = a * b }

  const choices = new Set([answer])
  while (choices.size < 4) {
    const delta = Math.floor(Math.random() * 10) - 5
    const fake = answer + (delta === 0 ? 3 : delta)
    if (fake >= 0) choices.add(fake)
  }
  const shuffled = [...choices].sort(() => Math.random() - 0.5)
  return { a, b, op, answer, choices: shuffled }
}

export default function QuickMath() {
  const best = useArcadeStore((s) => s.getBest(GAME_ID))
  const runs = useArcadeStore((s) => s.getRuns(GAME_ID))
  const registerRun = useArcadeStore((s) => s.registerRun)

  const [phase, setPhase] = useState('idle')
  const [problem, setProblem] = useState(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState(null) // { choice, isCorrect }
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [result, setResult] = useState({ score: 0, isNewHigh: false })
  const roundTimerRef = useRef(null)
  const feedbackTimeoutRef = useRef(null)

  const endGame = useCallback((finalScore) => {
    clearInterval(roundTimerRef.current)
    const isNewHigh = registerRun(GAME_ID, finalScore, 'max')
    setResult({ score: finalScore, isNewHigh })
    setPhase('gameover')
    if (isNewHigh) playHighScore()
  }, [registerRun])

  const startGame = useCallback(() => {
    setScore(0)
    setStreak(0)
    setFeedback(null)
    setTimeLeft(ROUND_SECONDS)
    setProblem(makeProblem())
    setPhase('playing')
    clearInterval(roundTimerRef.current)
    roundTimerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setScore((s) => { endGame(s); return s })
          return 0
        }
        return t - 1
      })
    }, 1000)
  }, [endGame])

  useEffect(() => () => { clearInterval(roundTimerRef.current); clearTimeout(feedbackTimeoutRef.current) }, [])

  const answer = (choice) => {
    if (phase !== 'playing' || feedback) return
    const isCorrect = choice === problem.answer
    if (isCorrect) {
      const bonus = 10 + Math.min(streak, 5) * 2
      setScore((s) => s + bonus)
      setStreak((s) => s + 1)
      playCatch(Math.min(streak, 6))
    } else {
      setStreak(0)
      playHit()
    }
    setFeedback({ choice, isCorrect })
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null)
      setProblem(makeProblem())
    }, FEEDBACK_DELAY)
  }

  return (
    <GameFrame
      icon={Calculator}
      title="Quick Math"
      description="Solve as many quick sums as you can before time runs out."
      instructions="Tap the correct answer"
      phase={phase}
      onStart={startGame}
      bestValue={best ?? 0}
      runs={runs}
      resultLabel="Score"
      resultValue={result.score}
      resultExtra="30-second round complete"
      isNewHigh={result.isNewHigh}
      aspect="380 / 480"
      hud={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold tabular-nums">{score}</span>
            {streak > 1 && (
              <Badge tone="teal" className="animate-pop gap-1"><Flame size={11} className="fill-current" /> {streak}</Badge>
            )}
          </div>
          <Badge tone={timeLeft <= 10 ? 'rose' : 'primary'} className={cn(timeLeft <= 10 && 'animate-pulse-slow')}>{timeLeft}s</Badge>
        </div>
      }
    >
      <div className="w-full h-full rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-border-light dark:border-border-dark flex flex-col items-center justify-center gap-6 px-6">
        {problem && phase === 'playing' && (
          <>
            <span className="font-display text-3xl font-semibold tabular-nums">{problem.a} {problem.op} {problem.b}</span>
            <div className="grid grid-cols-2 gap-3 w-full max-w-[260px]">
              {problem.choices.map((c) => {
                const isChosen = feedback?.choice === c
                const isCorrectChoice = feedback && c === problem.answer
                return (
                  <button
                    key={c}
                    onClick={() => answer(c)}
                    disabled={!!feedback}
                    className={cn(
                      'py-3 rounded-xl border-2 font-display font-semibold text-lg transition-colors',
                      isChosen && feedback.isCorrect && 'bg-teal-500/15 border-teal-500 text-teal-600 dark:text-teal-400 animate-pop-strong',
                      isChosen && !feedback.isCorrect && 'bg-rose-500/15 border-rose-500 text-rose-500 animate-shake',
                      !isChosen && isCorrectChoice && 'bg-teal-500/10 border-teal-500/60 text-teal-600 dark:text-teal-400',
                      !feedback && 'bg-white dark:bg-neutral-800 border-border-light dark:border-border-dark hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
                    )}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </GameFrame>
  )
}
