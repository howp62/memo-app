'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ThemeMode } from '@/types'

interface ThemeContextType {
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  isDark: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as ThemeMode | null
    if (saved) setThemeState(saved)
  }, [])

  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = theme === 'dark' || (theme === 'system' && prefersDark)
      setIsDark(dark)
      document.documentElement.classList.toggle('dark', dark)
    }

    applyTheme()

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', applyTheme)
      return () => mq.removeEventListener('change', applyTheme)
    }
  }, [theme])

  const setTheme = (t: ThemeMode) => {
    setThemeState(t)
    localStorage.setItem('theme', t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
