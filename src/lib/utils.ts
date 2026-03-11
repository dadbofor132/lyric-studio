import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBlockColor(type: string): string {
  const colors: Record<string, string> = {
    verse: '#3B82F6',
    chorus: '#8B5CF6',
    bridge: '#F97316',
    'pre-chorus': '#EC4899',
    intro: '#22C55E',
    outro: '#6B7280',
    hook: '#EF4444',
    custom: '#6B7280',
  }
  return colors[type] || colors.custom
}

export function getBlockBgClass(type: string): string {
  const classes: Record<string, string> = {
    verse: 'bg-blue-500/10 border-blue-500/50',
    chorus: 'bg-purple-500/10 border-purple-500/50',
    bridge: 'bg-orange-500/10 border-orange-500/50',
    'pre-chorus': 'bg-pink-500/10 border-pink-500/50',
    intro: 'bg-green-500/10 border-green-500/50',
    outro: 'bg-gray-500/10 border-gray-500/50',
    hook: 'bg-red-500/10 border-red-500/50',
    custom: 'bg-gray-500/10 border-gray-500/50',
  }
  return classes[type] || classes.custom
}

export function parseJSON<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
