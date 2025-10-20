import type { LiveMatch } from '@/stores/pages/live-matches'

export const getMatchStyle = (status: LiveMatch['status']) => {
  switch (status) {
    case 'Live':
      return {
        background: 'rgba(34, 197, 94, 0.08)',
        border: 'rgba(34, 197, 94, 0.3)',
        hover: 'rgba(34, 197, 94, 0.15)',
        scoreColor: '#22c55e',
        scoreGlow: 'rgba(34, 197, 94, 0.6)'
      }
    case 'Upcoming':
      return {
        background: 'rgba(59, 130, 246, 0.08)',
        border: 'rgba(59, 130, 246, 0.2)',
        hover: 'rgba(59, 130, 246, 0.15)',
        scoreColor: '#3b82f6',
        scoreGlow: 'rgba(59, 130, 246, 0.6)'
      }
    case 'Ended':
      return {
        background: 'rgba(107, 114, 128, 0.08)',
        border: 'rgba(107, 114, 128, 0.2)',
        hover: 'rgba(107, 114, 128, 0.15)',
        scoreColor: '#6b7280',
        scoreGlow: 'rgba(107, 114, 128, 0.6)'
      }
    default:
      return {
        background: 'rgba(0, 200, 255, 0.08)',
        border: 'rgba(0, 200, 255, 0.2)',
        hover: 'rgba(0, 200, 255, 0.15)',
        scoreColor: '#00c8ff',
        scoreGlow: 'rgba(0, 200, 255, 0.6)'
      }
  }
}
