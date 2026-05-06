'use client'

import { Microscope, GraduationCap, Newspaper, Users } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Reveal } from './Reveal'

export function Audience() {
    const { t } = useI18n()
    const cards = [
        { Icon: Microscope, title: t('aud1_title'), desc: t('aud1_desc'), color: 'var(--source-blue)' },
        { Icon: GraduationCap, title: t('aud2_title'), desc: t('aud2_desc'), color: 'var(--source-purple)' },
        { Icon: Newspaper, title: t('aud3_title'), desc: t('aud3_desc'), color: 'var(--source-orange)' },
        { Icon: Users, title: t('aud4_title'), desc: t('aud4_desc'), color: 'var(--source-teal)' },
    ]

    return (
        <section id="audience" className="border-border bg-surface scroll-mt-20 border-b">
            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
                <Reveal className="mb-12 max-w-2xl">
                    <div className="eyebrow mb-3">{t('nav_audience')}</div>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('audience_title')}</h2>
                    <p className="text-muted-foreground mt-3">{t('audience_subtitle')}</p>
                </Reveal>

                <div className="grid gap-5 sm:grid-cols-2">
                    {cards.map((c, i) => (
                        <Reveal key={c.title} delay={i * 60}>
                            <article className="card-flat h-full p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${c.color} 14%, transparent)`, color: c.color }}>
                                    <c.Icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold tracking-tight">{c.title}</h3>
                                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{c.desc}</p>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
