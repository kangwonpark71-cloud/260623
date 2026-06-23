import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getDaysUntil(date: string): number {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isExpiringSoon(date: string, thresholdDays = 3): boolean {
  const days = getDaysUntil(date)
  return days >= 0 && days <= thresholdDays
}

export function isExpired(date: string): boolean {
  return getDaysUntil(date) <= 0
}

export function getExpiryStatus(
  date: string
): 'expired' | 'soon' | 'fresh' {
  const days = getDaysUntil(date)
  if (days <= 0) return 'expired'
  if (days <= 3) return 'soon'
  return 'fresh'
}

export function getDifficultyColor(
  difficulty: 'easy' | 'medium' | 'hard'
): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-500'
    case 'medium':
      return 'text-yellow-500'
    case 'hard':
      return 'text-red-500'
  }
}

export function getDifficultyLabel(
  difficulty: 'easy' | 'medium' | 'hard'
): string {
  switch (difficulty) {
    case 'easy':
      return '쉬움'
    case 'medium':
      return '보통'
    case 'hard':
      return '어려움'
  }
}

export function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    vegetable: '🥬',
    fruit: '🍎',
    meat: '🥩',
    seafood: '🐟',
    dairy: '🥛',
    condiment: '🧂',
    grain: '🌾',
    seasoning: '🌿',
    other: '📦',
  }
  return map[category] || '📦'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
