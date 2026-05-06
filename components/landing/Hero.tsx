'use client'

import { ArrowRight, Copy, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { CountUp } from './CountUp'
import { MCP_CONFIG_TEXT, useCopy } from './copy'

export function Hero() {
    const { t } = useI18n()
    const { copied, copy } = useCopy()

    return (
        <section id="top" className="border-border relative border-b">
            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div className="animate-fade-in-up">
                        <div className="eyebrow mb-5">MCP Server · Open Data</div>
                        <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-6xl">{t('hero_title')}</h1>
                        <p className="text-muted-foreground mt-6 max-w-xl text-base leading-relaxed sm:text-lg">{t('hero_subtitle')}</p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <a href="#sources" className="btn-primary">
                                {t('hero_cta_primary')}
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <button onClick={() => copy(MCP_CONFIG_TEXT)} className="btn-outline">
                                {copied ? <Check className="text-source-green h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {t('hero_cta_secondary')}
                            </button>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                            {[
                                { n: 28, label: t('stat_tools') },
                                { n: 7, label: t('stat_sources') },
                                { n: 100, label: t('stat_open'), suffix: '%' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <div className="text-3xl font-semibold tracking-tight">
                                        <CountUp to={s.n} suffix={s.suffix ?? ''} />
                                    </div>
                                    <div className="text-muted-foreground mt-0.5 text-xs tracking-wider uppercase">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="animate-fade-in relative mx-auto aspect-square w-full max-w-md lg:ml-auto lg:max-w-none">
                        <HeroArt />
                    </div>
                </div>
            </div>
        </section>
    )
}

function HeroArt() {
    return (
        <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
            <rect x="0" y="0" width="400" height="400" rx="16" fill="var(--subtle)" />
            <g stroke="var(--border)" strokeWidth="1">
                {Array.from({ length: 9 }).map((_, i) => (
                    <line key={`v${i}`} x1={(i + 1) * 40} y1="0" x2={(i + 1) * 40} y2="400" />
                ))}
                {Array.from({ length: 9 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={(i + 1) * 40} x2="400" y2={(i + 1) * 40} />
                ))}
            </g>
            <rect x="60" y="60" width="120" height="120" rx="6" fill="var(--mk-red)" />
            <g transform="translate(280 120)">
                <circle r="28" fill="var(--gold)" />
                {Array.from({ length: 8 }).map((_, i) => {
                    const a = (i * Math.PI) / 4
                    return <line key={i} x1={Math.cos(a) * 36} y1={Math.sin(a) * 36} x2={Math.cos(a) * 60} y2={Math.sin(a) * 60} stroke="var(--gold)" strokeWidth="6" strokeLinecap="round" />
                })}
            </g>
            <g>
                <circle cx="120" cy="280" r="10" fill="var(--foreground)" />
                <circle cx="200" cy="320" r="10" fill="var(--foreground)" />
                <circle cx="280" cy="280" r="10" fill="var(--foreground)" />
                <line x1="120" y1="280" x2="200" y2="320" stroke="var(--foreground)" strokeWidth="1.5" />
                <line x1="200" y1="320" x2="280" y2="280" stroke="var(--foreground)" strokeWidth="1.5" />
                <line x1="120" y1="280" x2="280" y2="280" stroke="var(--foreground)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
            </g>
            <g transform="translate(60 220)">
                <rect width="110" height="28" rx="14" fill="var(--background)" stroke="var(--border)" />
                <circle cx="14" cy="14" r="4" fill="var(--source-green)" />
                <text x="26" y="18" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="500" fill="var(--foreground)">
                    28 tools live
                </text>
            </g>
        </svg>
    )
}
