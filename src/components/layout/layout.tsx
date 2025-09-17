import React from 'react'
import { Box } from '@chakra-ui/react'
import Header from './header'
import Loading from '@/components/loading/loading'
import { useAuth } from '@/provider/auth-provider'
import { useThemeColors } from '@/provider/theme-provider'

interface ILayoutProps {
    children?: React.ReactNode
}
    
export default function Layout({ children }: ILayoutProps) {
  const { isLoading } = useAuth();
  const { colors } = useThemeColors();

  return (
    <Box 
      minH="100vh" 
      bg={colors.background} 
      color={colors.onBackground}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <Header />
      {isLoading && <Loading message="Connecting wallet..." />}
      {children}
    </Box>
  )
}
