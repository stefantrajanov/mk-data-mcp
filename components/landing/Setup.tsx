'use client'

import { Bot, MousePointer2, Wind, Code2, Check, Copy } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Reveal } from './Reveal'
import { useCopy } from './copy'
import { useState } from 'react'

const CONFIG = `{
  "mcpServers": {
    "mk-data-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mk-data-mcp.vercel.app/api/mcp"]
    }
  }
}`

const tabs = [
    {
        key: 'claude',
        label: 'Claude Desktop',
        Icon: Bot,
        paths: ['macOS: ~/Library/Application Support/Claude/claude_desktop_config.json', 'Windows: %APPDATA%\\Claude\\claude_desktop_config.json'],
    },
    {
        key: 'cursor',
        label: 'Cursor',
        Icon: MousePointer2,
        paths: ['Project: .cursor/mcp.json', 'Global: ~/.cursor/mcp.json'],
    },
    {
        key: 'windsurf',
        label: 'Windsurf',
        Icon: Wind,
        paths: ['~/.codeium/windsurf/mcp_config.json'],
    },
    {
        key: 'zed',
        label: 'Zed',
        Icon: Code2,
        paths: ['~/.config/zed/settings.json (under "context_servers" — see Zed MCP docs for the exact format)'],
    },
]

function highlight(json: string) {
    return json
        .replace(/&/g, '&amp;')
        .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span style="color:var(--mk-red)">$1</span>$2')
        .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span style="color:var(--source-green)">$1</span>')
        .replace(/(\{|\}|\[|\])/g, '<span style="color:var(--muted-foreground)">$1</span>')
}

export function Setup() {
    const { t } = useI18n()
    const [active, setActive] = useState(tabs[0].key)
    const { copied, copy } = useCopy()
    const tab = tabs.find((x) => x.key === active)!

    return (
        <section id="setup" className="border-border bg-surface scroll-mt-20 border-b">
            <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
                <Reveal className="mb-10 max-w-2xl">
                    <div className="eyebrow mb-3">{t('setup_title')}</div>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('setup_title')}</h2>
                    <p className="text-muted-foreground mt-3">{t('setup_subtitle')}</p>
                </Reveal>

                <Reveal>
                    <div className="mb-5 flex flex-wrap gap-2">
                        {tabs.map(({ key, label, Icon }) => (
                            <button
                                key={key}
                                onClick={() => setActive(key)}
                                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                                    active === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="card-flat overflow-hidden">
                        <div className="border-border bg-background flex items-center justify-between border-b px-4 py-2.5">
                            <span className="text-muted-foreground font-mono text-xs">mcp.config.json</span>
                            <button
                                onClick={() => copy(CONFIG)}
                                className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="text-source-green h-3.5 w-3.5" /> {t('copied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" /> {t('copy')}
                                    </>
                                )}
                            </button>
                        </div>
                        <pre className="bg-background overflow-x-auto p-5 font-mono text-sm leading-relaxed">
                            <code dangerouslySetInnerHTML={{ __html: highlight(CONFIG) }} />
                        </pre>
                    </div>

                    <div className="border-border bg-background mt-4 rounded-lg border p-4">
                        <div className="text-muted-foreground mb-2 text-xs tracking-wider uppercase">{t('setup_path')}</div>
                        <ul className="space-y-1">
                            {tab.paths.map((p) => (
                                <li key={p} className="text-foreground/85 font-mono text-sm">
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-muted-foreground mt-4 text-sm">{t('setup_note')}</p>
                </Reveal>
            </div>
        </section>
    )
}
