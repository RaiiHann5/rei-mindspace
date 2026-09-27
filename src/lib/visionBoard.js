import { Briefcase, HeartPulse, Plane, Users, Landmark, Sparkles, Mountain } from 'lucide-react'

export const VISION_CATEGORIES = [
  { value: 'career', label: 'Career', icon: Briefcase, color: 'primary' },
  { value: 'health', label: 'Health', icon: HeartPulse, color: 'rose' },
  { value: 'travel', label: 'Travel', icon: Plane, color: 'teal' },
  { value: 'relationships', label: 'Relationships', icon: Users, color: 'amber' },
  { value: 'financial', label: 'Financial', icon: Landmark, color: 'primary' },
  { value: 'adventure', label: 'Adventure', icon: Mountain, color: 'rose' },
  { value: 'personal', label: 'Personal', icon: Sparkles, color: 'default' },
]

export function categoryInfo(value) {
  return VISION_CATEGORIES.find((c) => c.value === value) || VISION_CATEGORIES[VISION_CATEGORIES.length - 1]
}

export const TIMEFRAME_OPTIONS = [
  { value: 'someday', label: 'Someday' },
  { value: '1_year', label: 'Within 1 Year' },
  { value: '5_year', label: 'Within 5 Years' },
  { value: '10_year', label: 'Within 10 Years' },
]

export function timeframeLabel(value) {
  return TIMEFRAME_OPTIONS.find((t) => t.value === value)?.label || 'Someday'
}

export function visionSummary(items = []) {
  const total = items.length
  const achieved = items.filter((v) => v.achieved).length
  const pct = total ? Math.round((achieved / total) * 100) : 0
  return { total, achieved, pending: total - achieved, pct }
}
