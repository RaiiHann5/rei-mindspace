import { Code2, Palette, Languages, Briefcase, Music, Wrench, GraduationCap } from 'lucide-react'

export const SKILL_CATEGORIES = [
  { value: 'programming', label: 'Programming', icon: Code2, color: 'primary' },
  { value: 'design', label: 'Design', icon: Palette, color: 'rose' },
  { value: 'language', label: 'Language', icon: Languages, color: 'teal' },
  { value: 'business', label: 'Business', icon: Briefcase, color: 'amber' },
  { value: 'creative', label: 'Creative', icon: Music, color: 'rose' },
  { value: 'craft', label: 'Craft', icon: Wrench, color: 'primary' },
  { value: 'other', label: 'Other', icon: GraduationCap, color: 'default' },
]

export function categoryInfo(value) {
  return SKILL_CATEGORIES.find((c) => c.value === value) || SKILL_CATEGORIES[SKILL_CATEGORIES.length - 1]
}

export const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned', tone: 'default' },
  { value: 'in_progress', label: 'In Progress', tone: 'primary' },
  { value: 'completed', label: 'Completed', tone: 'teal' },
]

export function statusInfo(value) {
  return STATUS_OPTIONS.find((s) => s.value === value) || STATUS_OPTIONS[0]
}

export function deriveStatus(progress) {
  const p = Number(progress) || 0
  if (p >= 100) return 'completed'
  if (p > 0) return 'in_progress'
  return 'planned'
}

export function learningSummary(items = []) {
  const total = items.length
  const completed = items.filter((s) => s.status === 'completed').length
  const inProgress = items.filter((s) => s.status === 'in_progress').length
  const planned = items.filter((s) => s.status === 'planned').length
  const avgProgress = total ? Math.round(items.reduce((sum, s) => sum + (Number(s.progress) || 0), 0) / total) : 0
  return { total, completed, inProgress, planned, avgProgress }
}

export function milestoneProgress(milestones = []) {
  if (milestones.length === 0) return 0
  const done = milestones.filter((m) => m.done).length
  return Math.round((done / milestones.length) * 100)
}
