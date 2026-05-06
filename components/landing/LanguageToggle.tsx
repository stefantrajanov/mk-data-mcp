'use client'

import { useI18n } from '@/lib/i18n'

export function LanguageToggle() {
    const { lang, setLang } = useI18n()
    return (
        <div className="border-border bg-background inline-flex items-center rounded-full border p-0.5 text-xs font-medium">
            <button
                onClick={() => setLang('mk')}
                className={`rounded-full px-2.5 py-1 transition-colors ${lang === 'mk' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="Македонски"
            >
                MK
            </button>
            <button
                onClick={() => setLang('en')}
                className={`rounded-full px-2.5 py-1 transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                aria-label="English"
            >
                EN
            </button>
        </div>
    )
}

export function MkSunLogo({ className = 'h-6 w-6' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
            <circle cx="12" cy="12" r="3.2" fill="var(--mk-red)" />
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * Math.PI) / 4
                const x1 = 12 + Math.cos(angle) * 4.5
                const y1 = 12 + Math.sin(angle) * 4.5
                const x2 = 12 + Math.cos(angle) * 10.5
                const y2 = 12 + Math.sin(angle) * 10.5
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--mk-red)" strokeWidth="1.6" strokeLinecap="round" />
            })}
        </svg>
    )
}
