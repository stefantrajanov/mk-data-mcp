'use client'

import { Bot, MousePointer2, Wind, Code2, Plus } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function CompatibleWith() {
    const { t } = useI18n()
    const items = [
        { name: 'Claude', Icon: Bot },
        { name: 'Cursor', Icon: MousePointer2 },
        { name: 'Windsurf', Icon: Wind },
        { name: 'Zed', Icon: Code2 },
        { name: t('any_client'), Icon: Plus },
    ]

    return (
        <section className="border-border bg-surface border-b">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
                    <div className="eyebrow">{t('works_with')}</div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {items.map(({ name, Icon }) => (
                            <div key={name} className="border-border bg-background hover:bg-accent inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors">
                                <Icon className="text-muted-foreground h-4 w-4" />
                                <span className="font-medium">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
