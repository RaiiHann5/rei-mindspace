import { create } from 'zustand'

const FOCUS = 25 * 60
const SHORT_BREAK = 5 * 60
const LONG_BREAK = 15 * 60

export const usePomodoroStore = create((set, get) => ({
  mode: 'focus', // focus | short_break | long_break
  secondsLeft: FOCUS,
  isRunning: false,
  cyclesCompleted: 0,
  label: 'Deep work',
  setLabel: (label) => set({ label }),
  tick: () => {
    const { secondsLeft, isRunning } = get()
    if (!isRunning) return
    if (secondsLeft <= 1) {
      get().advance()
    } else {
      set({ secondsLeft: secondsLeft - 1 })
    }
  },
  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => set({ secondsLeft: get().durationFor(get().mode), isRunning: false }),
  durationFor: (mode) => (mode === 'focus' ? FOCUS : mode === 'short_break' ? SHORT_BREAK : LONG_BREAK),
  advance: () => {
    const { mode, cyclesCompleted } = get()
    if (mode === 'focus') {
      const nextCycles = cyclesCompleted + 1
      const nextMode = nextCycles % 4 === 0 ? 'long_break' : 'short_break'
      set({ mode: nextMode, secondsLeft: get().durationFor(nextMode), cyclesCompleted: nextCycles, isRunning: false })
      return { finishedMode: 'focus', cyclesCompleted: nextCycles }
    }
    set({ mode: 'focus', secondsLeft: FOCUS, isRunning: false })
    return { finishedMode: mode }
  },
  setMode: (mode) => set({ mode, secondsLeft: get().durationFor(mode), isRunning: false }),
}))
