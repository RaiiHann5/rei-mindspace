// Tiny Web Audio beep — no audio file assets needed. Plays a short two-tone
// chime, used for Pomodoro session transitions.
let ctx

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(audioCtx, freq, startTime, duration, gain = 0.15) {
  const osc = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, startTime)
  g.gain.linearRampToValueAtTime(gain, startTime + 0.02)
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.connect(g)
  g.connect(audioCtx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

export function playChime(kind = 'focus-done') {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  if (kind === 'focus-done') {
    tone(audioCtx, 587.33, now, 0.22) // D5
    tone(audioCtx, 880, now + 0.16, 0.3) // A5
  } else {
    tone(audioCtx, 440, now, 0.2) // A4
    tone(audioCtx, 554.37, now + 0.14, 0.28) // C#5
  }
}

// Short upward blip for a good catch in the arcade minigame.
export function playCatch(comboLevel = 0) {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const base = 660 + Math.min(comboLevel, 8) * 40
  tone(audioCtx, base, now, 0.1, 0.12)
}

// Low buzz for hitting a distraction / losing a life.
export function playHit() {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  tone(audioCtx, 180, now, 0.18, 0.16)
  tone(audioCtx, 140, now + 0.08, 0.2, 0.14)
}

// Little fanfare for a new high score.
export function playHighScore() {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  tone(audioCtx, 523.25, now, 0.14, 0.14)
  tone(audioCtx, 659.25, now + 0.1, 0.14, 0.14)
  tone(audioCtx, 783.99, now + 0.2, 0.28, 0.16)
}

// Rising sweep for a nitro / boost pickup in the racing game.
export function playBoost() {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.22)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.09, now + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)
  osc.connect(g)
  g.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.26)
}

// Dull crunch for a crash in the racing game.
export function playCrash() {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  tone(audioCtx, 160, now, 0.16, 0.18)
  tone(audioCtx, 90, now + 0.05, 0.22, 0.16)
  tone(audioCtx, 60, now + 0.1, 0.26, 0.14)
}

// Cheerful little hop for a platformer jump.
export function playJump(power = 1) {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(340 * power, now)
  osc.frequency.exponentialRampToValueAtTime(720 * power, now + 0.12)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.07, now + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)
  osc.connect(g)
  g.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.16)
}

// Bright coin-collect ding.
export function playCoin() {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  tone(audioCtx, 988, now, 0.08, 0.1)
  tone(audioCtx, 1318, now + 0.06, 0.16, 0.12)
}

// Squashy thud when stomping an enemy.
export function playStomp() {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(300, now)
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.16)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
  osc.connect(g)
  g.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.2)
}

// Silly power-up fanfare for a star pickup.
export function playPowerUp() {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  tone(audioCtx, 523.25, now, 0.09, 0.11)
  tone(audioCtx, 659.25, now + 0.07, 0.09, 0.11)
  tone(audioCtx, 783.99, now + 0.14, 0.09, 0.11)
  tone(audioCtx, 1046.5, now + 0.21, 0.22, 0.13)
}
