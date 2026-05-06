'use client'

import { createContext, useContext, useEffect, useState, startTransition, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }>({
    theme: 'light',
    toggle: () => {},
    setTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light')

    useEffect(() => {
        const stored = localStorage.getItem('mk-mcp-theme')
        let initial: Theme
        if (stored === 'light' || stored === 'dark') {
            initial = stored
        } else {
            initial = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        document.documentElement.classList.toggle('dark', initial === 'dark')
        startTransition(() => setThemeState(initial))
    }, [])

    const setTheme = (t: Theme) => {
        setThemeState(t)
        localStorage.setItem('mk-mcp-theme', t)
        document.documentElement.classList.toggle('dark', t === 'dark')
    }

    const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')

    return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
