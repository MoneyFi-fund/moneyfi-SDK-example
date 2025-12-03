import EVMPage from '@/modules/evm/evm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/evm')({
  component: EVMPage,
})
