'use client'

import { ArrowUpRight, Wallet, Database, BarChart3, Landmark, FileText, Banknote, Wind } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Reveal } from './Reveal'

type Source = {
    name: string
    descMk: string
    descEn: string
    count: number
    color: string
    Icon: typeof Wallet
    tools: string[]
}

const sources: Source[] = [
    {
        name: 'Open Finance MK',
        descMk: 'Трансакции на државната потрошувачка, пребарување по платиш/примач и клучни зборови',
        descEn: 'Government spending transactions, payer/recipient lookup, keyword search',
        count: 5,
        color: 'var(--source-orange)',
        Icon: Wallet,
        tools: ['search_transactions', 'get_by_payer', 'get_by_recipient', 'get_by_keyword', 'get_spending_summary'],
    },
    {
        name: 'MakStat (State Statistical Office)',
        descMk: 'Население, труд, плати, демографија од официјалната статистичка база',
        descEn: 'Population, labor, wages, demographics from the official statistical database',
        count: 3,
        color: 'var(--source-green)',
        Icon: BarChart3,
        tools: ['browse', 'get_metadata', 'query'],
    },
    {
        name: 'NBStat (National Bank)',
        descMk: 'Монетарна политика, платен биланс, девизни курсеви, банкарска статистика',
        descEn: 'Monetary policy, balance of payments, exchange rates, banking statistics',
        count: 3,
        color: 'var(--source-red)',
        Icon: Banknote,
        tools: ['browse', 'get_metadata', 'query'],
    },
    {
        name: 'Budget Finance MK',
        descMk: 'Годишни буџети, приходи/расходи, алокации по институции, макро трендови',
        descEn: 'Annual budget summaries, income/expenditure breakdowns, institution allocations, macroeconomic trends',
        count: 5,
        color: 'var(--source-purple)',
        Icon: Landmark,
        tools: ['get_summary', 'get_income_breakdown', 'get_expenditure_breakdown', 'get_institutions', 'get_macro_trends'],
    },
    {
        name: 'data.gov.mk (Open Data Portal)',
        descMk: 'Пребарувај и прашај dataset-и од министерства, општини и агенции',
        descEn: 'Search and query datasets from ministries, municipalities, and agencies',
        count: 4,
        color: 'var(--source-blue)',
        Icon: Database,
        tools: ['search_datasets', 'get_dataset', 'query_datastore', 'list_organizations'],
    },
    {
        name: 'uslugi.gov.mk (E-Services Portal)',
        descMk: 'Каталог на државни услуги со такси, рокови, потребни документи и институции',
        descEn: 'Government services catalog with fees, deadlines, required documents, institutions',
        count: 4,
        color: 'var(--source-teal)',
        Icon: FileText,
        tools: ['browse', 'search_services', 'get_service', 'list_institutions'],
    },
    {
        name: 'Air MOEPP (air quality)',
        descMk: 'Мониторинг на квалитет на воздух — станици, мерења, AQI индекс во реално време',
        descEn: 'Air quality monitoring — stations, measurements, real-time AQI index',
        count: 4,
        color: 'var(--gold)',
        Icon: Wind,
        tools: ['get_stations', 'get_measurements', 'calculate_aqi', 'find_nearest'],
    },
]

export function Sources() {
    const { t, lang } = useI18n()
    return (
        <section id="sources" className="border-border scroll-mt-20 border-b">
            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
                <Reveal className="mb-12 max-w-2xl">
                    <div className="eyebrow mb-3">{t('nav_sources')}</div>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('sources_title')}</h2>
                    <p className="text-muted-foreground mt-3">{t('sources_subtitle')}</p>
                </Reveal>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sources.map((s, i) => (
                        <Reveal key={s.name} delay={i * 50}>
                            <article className="card-flat h-full p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${s.color} 14%, transparent)`, color: s.color }}>
                                        <s.Icon className="h-5 w-5" />
                                    </div>
                                    <span className="pill border-border bg-subtle text-muted-foreground border">
                                        {s.count} {t('tools_label')}
                                    </span>
                                </div>

                                <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.name}</h3>
                                <p className="text-muted-foreground mt-1 min-h-[3rem] text-sm">{lang === 'mk' ? s.descMk : s.descEn}</p>

                                <ul className="border-border mt-4 space-y-1.5 border-t pt-4">
                                    {s.tools.map((tool) => (
                                        <li key={tool} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="text-foreground/85 font-mono text-[12px]">{tool}</span>
                                            <ArrowUpRight className="text-muted-foreground h-3.5 w-3.5" />
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-5 flex items-center gap-2 text-xs">
                                    <span className="relative flex h-2 w-2">
                                        <span className="bg-source-green absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" />
                                        <span className="bg-source-green relative inline-flex h-2 w-2 rounded-full" />
                                    </span>
                                    <span className="text-muted-foreground tracking-wider uppercase">{t('live')}</span>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
