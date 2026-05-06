'use client'

import { useI18n } from '@/lib/i18n'
import { Reveal } from './Reveal'

type Entry = { date: string; title: string; descMk: string; descEn: string; isNew?: boolean }

const entries: Entry[] = [
    { date: 'May 2025', title: 'Air MOEPP', descMk: 'Мониторинг на квалитет на воздух со AQI индекс (4 алатки)', descEn: 'Air quality monitoring with AQI index (4 tools)', isNew: true },
    {
        date: 'May 2025',
        title: 'NBStat (НБРМ)',
        descMk: 'Монетарна статистика, платен биланс, девизни резерви (3 алатки)',
        descEn: 'Monetary statistics, balance of payments, FX reserves (3 tools)',
        isNew: true,
    },
    { date: 'May 2025', title: 'uslugi.gov.mk', descMk: 'Државни е-услуги со такси и рокови (4 алатки)', descEn: 'Government e-services with fees and deadlines (4 tools)', isNew: true },
    { date: 'April 2025', title: 'Budget Finance MK', descMk: 'Буџет по институции и макро трендови (5 алатки)', descEn: 'Budget by institution and macro trends (5 tools)' },
    { date: 'April 2025', title: 'MakStat', descMk: 'Статистички податоци од Државниот завод (3 алатки)', descEn: 'Statistical data from the State Statistical Office (3 tools)' },
    { date: 'March 2025', title: 'Data.gov.mk', descMk: 'Отворен портал за податоци (4 алатки)', descEn: 'Open data portal (4 tools)' },
    { date: 'March 2025', title: 'Open Finance MK', descMk: 'Финансиски трансакции (5 алатки)', descEn: 'Financial transactions (5 tools)' },
]

export function Changelog() {
    const { t, lang } = useI18n()
    return (
        <section id="changelog" className="border-border bg-surface scroll-mt-20 border-b">
            <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
                <Reveal className="mb-10">
                    <div className="eyebrow mb-3">Changelog</div>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('changelog_title')}</h2>
                    <p className="text-muted-foreground mt-3">{t('changelog_subtitle')}</p>
                </Reveal>

                <div className="divide-border border-border bg-background divide-y rounded-xl border-y">
                    {entries.map((e, i) => (
                        <Reveal key={i} delay={i * 40}>
                            <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`h-2 w-2 rounded-full ${e.isNew ? 'bg-source-green' : 'bg-border'}`} />
                                    <span className="text-muted-foreground w-28 font-mono text-xs tracking-wider uppercase">{e.date}</span>
                                    <span className="font-semibold">{e.title}</span>
                                    {e.isNew && <span className="pill border-source-green/30 bg-source-green/10 text-source-green border tracking-wider uppercase">New</span>}
                                </div>
                                <p className="text-muted-foreground text-sm sm:max-w-md sm:text-right">{lang === 'mk' ? e.descMk : e.descEn}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
