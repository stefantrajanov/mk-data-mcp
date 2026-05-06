'use client'

import { Check, Clipboard } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { MCP_URL, useCopy } from './copy'

export function FloatingCopy() {
    const { t } = useI18n()
    const { copied, copy } = useCopy(2200)
    return (
        <button
            onClick={() => copy(MCP_URL)}
            className="border-border bg-background hover:bg-accent fixed right-5 bottom-5 z-40 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg transition-all"
            aria-label={t('floating_copy')}
        >
            {copied ? (
                <>
                    <Check className="text-source-green h-4 w-4" />
                    <span>{t('floating_copied')}</span>
                </>
            ) : (
                <>
                    <Clipboard className="text-muted-foreground h-4 w-4" />
                    <span>{t('floating_copy')}</span>
                </>
            )}
        </button>
    )
}
