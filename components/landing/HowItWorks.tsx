'use client'

import { Plug, MessageCircleQuestion, Database } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Reveal } from './Reveal'

export function HowItWorks() {
    const { t } = useI18n()
    const steps = [
        { Icon: Plug, title: t('step1_title'), desc: t('step1_desc') },
        { Icon: MessageCircleQuestion, title: t('step2_title'), desc: t('step2_desc') },
        { Icon: Database, title: t('step3_title'), desc: t('step3_desc') },
    ]

    return (
        <section className="border-border bg-surface border-b">
            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
                <Reveal className="mb-14 max-w-2xl">
                    <div className="eyebrow mb-3">{t('how_title')}</div>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('how_title')}</h2>
                    <p className="text-muted-foreground mt-3">{t('how_subtitle')}</p>
                </Reveal>

                <div className="grid gap-6 md:grid-cols-3">
                    {steps.map((s, i) => (
                        <Reveal key={s.title} delay={i * 80}>
                            <div className="card-flat h-full p-6">
                                <div className="flex items-center justify-between">
                                    <div className="border-border bg-background flex h-10 w-10 items-center justify-center rounded-lg border">
                                        <s.Icon className="text-foreground h-5 w-5" strokeWidth={1.75} />
                                    </div>
                                    <span className="text-muted-foreground font-mono text-xs">0{i + 1}</span>
                                </div>
                                <h3 className="mt-6 text-lg font-semibold tracking-tight">{s.title}</h3>
                                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
