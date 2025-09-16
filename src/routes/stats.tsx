import Stats from '@/modules/stats/stats'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stats')({
  component: Stats,
})
