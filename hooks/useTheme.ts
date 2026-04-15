'use client'

import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 1순위: localStorage
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(saved)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // 2순위: OS 설정
      setTheme('dark')
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme, mounted }
}
