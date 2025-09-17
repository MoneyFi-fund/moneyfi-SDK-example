import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { ThemeProvider } from '@/provider/theme-provider'
import { chakraTheme } from '@/theme/chakra-theme'

interface ChakraUIProviderProps {
    children: React.ReactNode
}

export default function ChakraUIProvider({ children }: ChakraUIProviderProps) {
  return (
    <ThemeProvider>
      <ChakraProvider value={chakraTheme}>
        <NextThemeProvider attribute="class" disableTransitionOnChange>
          {children}
        </NextThemeProvider>
      </ChakraProvider>
    </ThemeProvider>
  )
}
