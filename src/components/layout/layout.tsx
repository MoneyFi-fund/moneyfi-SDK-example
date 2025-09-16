import React from 'react'
import Header from './header'
import Loading from '@/components/loading/loading'
import { useAuth } from '@/provider/auth-provider'

interface ILayoutProps {
    children?: React.ReactNode
}
    
export default function Layout({ children }: ILayoutProps) {
  const { isLoading } = useAuth();

  return (
    <div>
      <Header />
      {isLoading && <Loading message="Connecting wallet..." />}
      {children}
    </div>
  )
}
