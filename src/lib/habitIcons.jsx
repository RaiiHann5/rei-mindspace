import {
  Barbell, PersonSimpleWalk, Bicycle, Drop, ForkKnife, BowlFood, BookOpen,
  GraduationCap, PenNib, Notebook, Brain, Moon, Bed, Sun, Alarm, Shower,
  PaintBrush, MusicNotes, Code, PiggyBank, CigaretteSlash, Plant, Heartbeat,
  Smiley, Sparkle, Target, Fire, CheckCircle, Waves, Leaf, Wine, Tooth, Pill,
  Stethoscope, Scales, Wallet, Bank, ChartLineUp, Lightbulb, Wrench, Camera,
  FilmSlate, Headphones, GameController, PuzzlePiece, CookingPot, AppleLogo,
  Eyeglasses, Gavel, Anchor, RocketLaunch, Butterfly, Campfire, Feather,
  ShootingStar, CloudRain, Umbrella, TShirt, PawPrint, Bird, Confetti,
  HeartStraight, HandsClapping, Note, Crown, FlowerLotus, Tree, Orange, Avocado,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

// Habit icons, following the "plump flat" reference: chunky, fully filled,
// generously rounded shapes rather than thin outlines. Lucide (used elsewhere
// in the app) is stroke-only, so habits use Phosphor instead — every icon
// below has a `fill` weight, which is what produces the solid silhouette.
//
// The lookup keys are what get persisted in each habit's `icon` field, so the
// legacy Lucide names are mapped rather than replaced: a habit saved with
// `Dumbbell` keeps rendering instead of silently falling back.
const P = (Icon) => (props) => <Icon weight="fill" {...props} />

// Habits created before the icon set changed stored a raw emoji. Those records
// are still in every user's data, so the emoji map to a sensible Phosphor icon
// rather than all collapsing onto one fallback — otherwise every seeded habit
// renders as the same droplet.
const LEGACY_EMOJI = {
  '\u{1F9D8}': P(Butterfly),        // 🧘 meditation
  '\u{1F4DA}': P(BookOpen),         // 📚 reading
  '\u{1F36C}': P(BowlFood),         // 🍬 sugar / snacking
  '\u{1F3CB}': P(Barbell),          // 🏋️ lifting
  '\u{1F3CB}\uFE0F': P(Barbell),
  '\u{1F3AE}': P(GameController),   // 🎮 gaming
  '\u{1F3B5}': P(MusicNotes),       // 🎵 music
  '\u{1F4F7}': P(Camera),           // 📷 photo
  '\u{1F4BB}': P(Code),             // 💻 code
  '\u{1F9F3}': P(PaintBrush),       // 🧳 travel
  '\u{1F9D8}\u200D\u{1F91D}': P(Heartbeat), // 🧘‍♂️
  '\u{1F48A}': P(HeartStraight),    // 💊 medicine
  '\u{1F6B6}': P(PersonSimpleWalk), // 🚶 walk
  '\u{1F3C3}': P(Waves),            // 🏃 run
  '\u{1F9F8}': P(Bed),              // 🧘 sleep
  '\u{1F4DD}': P(Notebook),         // 📝 note
  '\u{1F4F0}': P(Notebook),         // 📰 journal
  '\u{1F331}': P(Plant),            // 🌱 plants
  '\u{1F345}': P(AppleLogo),        // 🍅 food
  '\u{2615}': P(BowlFood),          // ☕ coffee
}

export const HABIT_ICONS = {
  // --- movement & body ---------------------------------------------------
  Flame: P(Fire),
  Barbell: P(Barbell),
  Dumbbell: P(Barbell),
  Footprints: P(PersonSimpleWalk),
  Walk: P(PersonSimpleWalk),
  Bike: P(Bicycle),
  Bicycle: P(Bicycle),
  Heart: P(Heartbeat),
  HeartPulse: P(Heartbeat),
  Pill: P(Pill),
  Tooth: P(Tooth),
  Stethoscope: P(Stethoscope),
  Yoga: P(Butterfly),

  // --- food & drink ------------------------------------------------------
  Water: P(Drop),
  Droplets: P(Drop),
  Coffee: P(BowlFood),
  Utensils: P(ForkKnife),
  Food: P(BowlFood),
  Cook: P(CookingPot),
  Apple: P(AppleLogo),
  Fruit: P(Orange),
  Avocado: P(Avocado),
  Leaf: P(Leaf),
  Plant: P(Plant),
  Garden: P(FlowerLotus),
  Tree: P(Tree),
  Wine: P(Wine),

  // --- mind & learning ---------------------------------------------------
  Book: P(BookOpen),
  BookOpen: P(BookOpen),
  Read: P(BookOpen),
  Study: P(GraduationCap),
  GraduationCap: P(GraduationCap),
  Journal: P(Notebook),
  NotebookPen: P(Notebook),
  Notebook: P(Notebook),
  Write: P(PenNib),
  PenLine: P(PenNib),
  Idea: P(Lightbulb),
  Brain: P(Brain),
  Focus: P(Target),
  Target: P(Target),
  Code: P(Code),
  Music: P(MusicNotes),
  Art: P(PaintBrush),
  Paintbrush: P(PaintBrush),
  Camera: P(Camera),
  Film: P(FilmSlate),
  Game: P(GameController),
  Puzzle: P(PuzzlePiece),
  Bird: P(Bird),
  Dog: P(PawPrint),
  Pet: P(PawPrint),
  Feather: P(Feather),

  // --- rest & routine ----------------------------------------------------
  Sleep: P(Moon),
  Moon: P(Moon),
  Bed: P(Bed),
  Sun: P(Sun),
  Morning: P(Sun),
  Alarm: P(Alarm),
  AlarmClock: P(Alarm),
  Shower: P(Shower),
  Swim: P(Waves),
  Waves: P(Waves),
  Meditate: P(Butterfly),
  Beach: P(Umbrella),
  TShirt: P(TShirt),
  Glasses: P(Eyeglasses),

  // --- money & admin -----------------------------------------------------
  Money: P(PiggyBank),
  PiggyBank: P(PiggyBank),
  Save: P(PiggyBank),
  Budget: P(Wallet),
  Wallet: P(Wallet),
  Bank: P(Bank),
  Scales: P(Scales),
  Law: P(Gavel),
  Ship: P(Anchor),
  Launch: P(RocketLaunch),
  Grow: P(ChartLineUp),
  Fix: P(Wrench),
  Check: P(CheckCircle),
  CheckCircle2: P(CheckCircle),
  NoSmoke: P(CigaretteSlash),
  CigaretteOff: P(CigaretteSlash),

  // --- playful -----------------------------------------------------------
  Smile: P(Smiley),
  Sparkles: P(Sparkle),
  Star: P(ShootingStar),
  Campfire: P(Campfire),
  Confetti: P(Confetti),
  Clap: P(HandsClapping),
  Love: P(HeartStraight),
  Crown: P(Crown),
  Note: P(Note),
  CloudRain: P(CloudRain),
}

// The picker order is deliberate: body and routine first (the habits people
// actually track), then food, then mind, then admin, then playful.
export const HABIT_ICON_GROUPS = [
  { label: 'Body', keys: ['Water', 'Barbell', 'Walk', 'Bike', 'Sleep', 'Shower', 'Meditate', 'Pill', 'Heart', 'Yoga'] },
  { label: 'Routine', keys: ['Morning', 'Alarm', 'Journal', 'Read', 'Study', 'Write', 'Code', 'Music', 'Art', 'Focus'] },
  { label: 'Food', keys: ['Coffee', 'Food', 'Cook', 'Apple', 'Fruit', 'Water', 'Wine', 'Garden'] },
  { label: 'Money', keys: ['Budget', 'Save', 'Bank', 'Grow', 'NoSmoke', 'Law'] },
  { label: 'Play', keys: ['Star', 'Clap', 'Love', 'Crown', 'Confetti', 'Game', 'Bird', 'Pet', 'Campfire'] },
]

export const HABIT_ICON_OPTIONS = HABIT_ICON_GROUPS.flatMap((g) => g.keys)
export const DEFAULT_HABIT_ICON = 'Water'

// Renders a habit's icon by name. Resolves, in order: a current icon name, a
// legacy emoji from before the icon set changed, then a neutral default.
export function HabitIcon({ name, size = 18, className, ...props }) {
  const Icon =
    HABIT_ICONS[name] ||
    LEGACY_EMOJI[name] ||
    LEGACY_EMOJI[name?.replace(/\uFE0F/g, '')] ||
    HABIT_ICONS[DEFAULT_HABIT_ICON]
  return <Icon size={size} className={cn('shrink-0', className)} {...props} />
}

// Colour presets offered alongside the picker. Tones are the app's existing
// low-chroma status palette, so a habit never introduces a hue that competes
// with the ember accent.
export const HABIT_TONES = {
  primary: 'bg-primary-500/12 text-primary-600 dark:text-ember-300',
  teal: 'bg-teal-500/14 text-teal-700 dark:text-teal-300',
  amber: 'bg-amber-500/14 text-amber-700 dark:text-amber-300',
  rose: 'bg-rose-500/14 text-rose-700 dark:text-rose-300',
  dusk: 'bg-black/[0.05] dark:bg-white/[0.07] text-dusk',
}
