import React from 'react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ThemeProvider } from "next-themes"

interface ChakraUIProviderProps {
    children: React.ReactNode
}

export default function ChakraUIProvider({ children }: ChakraUIProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  )
}

// Named export for easier imports
export { ChakraUIProvider as ChakraProvider };
