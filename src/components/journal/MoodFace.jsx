// Mood faces for the journal, drawn to match the reference: chunky pixel
// characters with two dot eyes and a straight or curved mouth, one per mood
// level. They replace the emoji the journal used before, which rendered
// differently on every platform and lost the palette in dark mode.
//
// Anchors follow the reference exactly — green reads as "great", blue as
// "steady", red as "needs attention" — with amber and teal filling the gap
// between them so five levels still read as a scale.

const FACES = {
  // 1 — heavy frown, red
  1: { body: '#F4756F', eye: '#B3302B', mouth: 'frown', brow: true },
  // 2 — slight frown, amber
  2: { body: '#F5A65B', eye: '#B06E1C', mouth: 'flat-frown', brow: true },
  // 3 — neutral, blue (the reference's "Doing OK")
  3: { body: '#6C9BF0', eye: '#2F4E96', mouth: 'flat' },
  // 4 — smile, teal
  4: { body: '#4EC5B8', eye: '#1E6E66', mouth: 'smile' },
  // 5 — big smile, green (the reference's "Doing Great")
  5: { body: '#5FC46A', eye: '#256B2C', mouth: 'grin' },
}

const MOUTHS = {
  frown: 'M9 19 h10',
  'flat-frown': 'M10 18 h8',
  flat: 'M10 17 h8',
  smile: 'M9 16 q5 4 10 0',
  grin: 'M8 15 q6 7 12 0',
}

// Sized in a 28x24 grid so every face has the same optical weight regardless
// of which mouth it uses.
export default function MoodFace({ value, size = 28, className, title }) {
  const face = FACES[value] || FACES[3]
  const label = title || `Mood ${value}`

  return (
    <svg
      width={size}
      height={(size * 24) / 28}
      viewBox="0 0 28 24"
      className={className}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      {/* body — a rounded pixel blob, deliberately not a circle */}
      <path
        fill={face.body}
        d="M4 2 h20 a2 2 0 0 1 2 2 v6 h2 v8 h-2 v4 a2 2 0 0 1-2 2 H4 a2 2 0 0 1-2-2 v-4 H0 v-8 h2 V4 a2 2 0 0 1 2-2 Z"
      />
      {/* eyes */}
      <rect x="7" y="9" width="3.5" height="4" fill={face.eye} />
      <rect x="17.5" y="9" width="3.5" height="4" fill={face.eye} />
      {/* brows, only on the two low moods */}
      {face.brow && (
        <>
          <rect x="6" y="6" width="5" height="1.8" fill={face.eye} />
          <rect x="17" y="6" width="5" height="1.8" fill={face.eye} />
        </>
      )}
      {/* mouth */}
      <path
        d={MOUTHS[face.mouth]}
        stroke={face.eye}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

// Tint + heading pair, per the reference's three mood cards.
export const MOOD_TONE = {
  1: { bg: 'bg-rose-500/[0.13]', text: 'text-rose-600 dark:text-rose-300' },
  2: { bg: 'bg-amber-500/[0.14]', text: 'text-amber-700 dark:text-amber-300' },
  3: { bg: 'bg-teal-500/[0.12]', text: 'text-teal-700 dark:text-teal-300' },
  4: { bg: 'bg-teal-500/[0.18]', text: 'text-teal-700 dark:text-teal-300' },
  5: { bg: 'bg-emerald-500/[0.16]', text: 'text-emerald-700 dark:text-emerald-300' },
}

// A short line under the mood title, echoing the reference's
// "You are on the right track" / "You're off track right now".
export const MOOD_NOTE = {
  1: { icon: '▼', text: "Off track right now" },
  2: { icon: '▼', text: 'Slightly off' },
  3: { icon: '–', text: 'Doing pretty well' },
  4: { icon: '▲', text: 'On the right track' },
  5: { icon: '▲', text: 'Great day' },
}
