'use client'

import { useEffect, useRef, useState, startTransition } from 'react'
import { Pause, Play, User, Wrench } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Reveal } from './Reveal'
import { MkSunLogo } from './LanguageToggle'

type Item = {
    qMk: string
    qEn: string
    aMk: string
    aEn: string
    tools: string[]
}

const items: Item[] = [
    {
        qMk: 'Колкава беше стапката на невработеност во Северна Македонија во последните 5 години?',
        qEn: 'What was the unemployment rate in North Macedonia in the last 5 years?',
        aMk: 'Според MakStat: 2020 — 16.4%, 2021 — 15.7%, 2022 — 14.4%, 2023 — 13.1%, 2024 — 12.3%. Тренд: постепен пад во последните 5 години, со најголем пад во 2023.',
        aEn: 'According to MakStat: 2020 — 16.4%, 2021 — 15.7%, 2022 — 14.4%, 2023 — 13.1%, 2024 — 12.3%. Trend: gradual decline over the past 5 years, with the largest drop in 2023.',
        tools: ['makstat_browse', 'makstat_query'],
    },
    {
        qMk: 'Покажи ми ги државните трошоци за образование во 2024.',
        qEn: 'Show me government spending on education in 2024.',
        aMk: 'Министерството за образование и наука потроши 28.4 милијарди денари во 2024 (околу 4.1% од БДП), од кои 62% за плати, 18% за капитални инвестиции, 20% за тековни расходи.',
        aEn: 'The Ministry of Education and Science spent 28.4 billion MKD in 2024 (around 4.1% of GDP), of which 62% on salaries, 18% on capital investment, 20% on current expenditure.',
        tools: ['budget_get_expenditure_breakdown', 'budget_get_institutions'],
    },
    {
        qMk: 'Кои документи ми требаат за барање пасош?',
        qEn: 'What documents do I need to apply for a passport?',
        aMk: 'Потребно: важечка лична карта, родилен лист (за прв пат), уплата за такса (1,500–2,000 МКД редовна, 6,100 МКД итна) и извод од МВР. Постапка: 15 дена редовна, 3 дена итна.',
        aEn: 'Required: valid ID card, birth certificate (first-time only), fee payment (1,500–2,000 MKD regular, 6,100 MKD express), and MVR extract. Processing: 15 days regular, 3 days express.',
        tools: ['uslugi_search_services', 'uslugi_get_service'],
    },
    {
        qMk: 'Кои се нивоата на загаден воздух во Скопје денес?',
        qEn: 'What are the current air pollution levels in Skopje?',
        aMk: 'Мерна станица Карпош: PM2.5 = 18 μg/m³ (Добар), PM10 = 34 μg/m³ (Умерен). AQI индекс: 67 — Умерен. Препорака: Чувствителни групи да ограничат продолжено надворешно изложување.',
        aEn: 'Station Karpoš: PM2.5 = 18 μg/m³ (Good), PM10 = 34 μg/m³ (Moderate). AQI: 67 — Moderate. Recommendation: Sensitive groups should limit prolonged outdoor exposure.',
        tools: ['get_air_quality_stations', 'calculate_current_aqi'],
    },
    {
        qMk: 'Колку чини еден EUR во MKD моментално?',
        qEn: 'What is the current exchange rate of EUR to MKD?',
        aMk: 'Според НБРМ, средниот курс е 1 EUR ≈ 61.55 MKD. Денарот е де-факто фиксиран кон еврото уште од 2002 (околу 61.5 ± 0.3%).',
        aEn: 'Per NBRM, the mid-rate is 1 EUR ≈ 61.55 MKD. The denar has been de-facto pegged to the euro since 2002 (around 61.5 ± 0.3%).',
        tools: ['nbstat_browse', 'nbstat_query'],
    },
]

const TYPE_SPEED = 28
const ANSWER_DELAY = 600
const HOLD = 3500
const ANSWER_SPEED = 14

export function Demo() {
    const { t, lang } = useI18n()
    const [idx, setIdx] = useState(0)
    const [paused, setPaused] = useState(false)
    const [qText, setQText] = useState('')
    const [aText, setAText] = useState('')
    const [showA, setShowA] = useState(false)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (paused) return
        const item = items[idx]
        const fullQ = lang === 'mk' ? item.qMk : item.qEn
        const fullA = lang === 'mk' ? item.aMk : item.aEn

        let cancelled = false
        startTransition(() => {
            setQText('')
            setAText('')
            setShowA(false)
        })

        const typeQ = (i: number) => {
            if (cancelled || paused) return
            if (i <= fullQ.length) {
                setQText(fullQ.slice(0, i))
                timer.current = setTimeout(() => typeQ(i + 1), TYPE_SPEED)
            } else {
                timer.current = setTimeout(() => {
                    if (cancelled) return
                    setShowA(true)
                    typeA(0)
                }, ANSWER_DELAY)
            }
        }

        const typeA = (i: number) => {
            if (cancelled || paused) return
            if (i <= fullA.length) {
                setAText(fullA.slice(0, i))
                timer.current = setTimeout(() => typeA(i + 1), ANSWER_SPEED)
            } else {
                timer.current = setTimeout(() => {
                    if (cancelled) return
                    setIdx((p) => (p + 1) % items.length)
                }, HOLD)
            }
        }

        typeQ(0)
        return () => {
            cancelled = true
            if (timer.current) clearTimeout(timer.current)
        }
    }, [idx, lang, paused])

    const item = items[idx]

    return (
        <section id="demo" className="border-border scroll-mt-20 border-b">
            <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
                <Reveal className="mb-10 max-w-2xl">
                    <div className="eyebrow mb-3">{t('demo_title')}</div>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('demo_title')}</h2>
                    <p className="text-muted-foreground mt-3">{t('demo_subtitle')}</p>
                </Reveal>

                <Reveal>
                    <div className="card-flat overflow-hidden">
                        <div className="border-border bg-surface flex items-center justify-between gap-2 border-b px-4 py-2.5">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <span className="bg-border h-2.5 w-2.5 rounded-full" />
                                    <span className="bg-border h-2.5 w-2.5 rounded-full" />
                                    <span className="bg-border h-2.5 w-2.5 rounded-full" />
                                </div>
                                <div className="text-muted-foreground ml-2 font-mono text-xs">mk-data-mcp · chat</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {items.map((_, i) => (
                                        <span key={i} className={`h-1 w-6 rounded-full transition-colors ${i === idx ? 'bg-foreground' : 'bg-border'}`} />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setPaused((p) => !p)}
                                    className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors"
                                    aria-label={paused ? t('demo_play') : t('demo_pause')}
                                >
                                    {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                                    {paused ? t('demo_play') : t('demo_pause')}
                                </button>
                            </div>
                        </div>

                        <div className="min-h-[320px] space-y-5 p-5 sm:p-7">
                            <div className="flex items-start gap-3">
                                <div className="bg-subtle border-border flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
                                    <User className="text-muted-foreground h-4 w-4" />
                                </div>
                                <div className="border-border bg-subtle min-h-[2.5rem] max-w-[85%] rounded-2xl rounded-tl-md border px-4 py-2.5 text-sm">
                                    {qText}
                                    <span className="bg-foreground/60 ml-0.5 inline-block h-4 w-[2px] animate-pulse align-middle" />
                                </div>
                            </div>

                            {showA && (
                                <div className="animate-fade-in flex items-start gap-3">
                                    <div className="border-border bg-background flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
                                        <MkSunLogo className="h-4 w-4" />
                                    </div>
                                    <div className="max-w-[85%] flex-1">
                                        <div className="border-border bg-background rounded-2xl rounded-tl-md border px-4 py-2.5 text-sm leading-relaxed">
                                            {aText}
                                            {aText.length < (lang === 'mk' ? item.aMk.length : item.aEn.length) && (
                                                <span className="bg-foreground/60 ml-0.5 inline-block h-4 w-[2px] animate-pulse align-middle" />
                                            )}
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="text-muted-foreground text-[11px] tracking-wider uppercase">{t('demo_tools_used')}:</span>
                                            {item.tools.map((tool) => (
                                                <span key={tool} className="pill border-border bg-subtle text-foreground border font-mono">
                                                    <Wrench className="text-muted-foreground h-3 w-3" />
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}
