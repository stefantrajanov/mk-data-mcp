'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, Loader2, Play, Wrench } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { Reveal } from './Reveal'

type ParamDef = {
    name: string
    type: 'string' | 'number' | 'select'
    required?: boolean
    placeholder?: string
    options?: string[]
    default?: string | number
}

type ToolDef = {
    id: string
    group: string
    description: string
    params: ParamDef[]
}

const tools: ToolDef[] = [
    // Open Finance (5)
    {
        id: 'openfinance_search_transactions',
        group: 'Open Finance',
        description: 'Free-text search across all government spending transactions.',
        params: [
            { name: 'term', type: 'string', placeholder: 'e.g. Образование' },
            { name: 'length', type: 'number', default: 20 },
        ],
    },
    {
        id: 'openfinance_get_transactions_by_payer',
        group: 'Open Finance',
        description: 'List transactions where the given institution paid.',
        params: [
            { name: 'payer', type: 'string', placeholder: 'Министерство за финансии' },
            { name: 'year_from', type: 'number', default: 2024 },
        ],
    },
    {
        id: 'openfinance_get_transactions_by_recipient',
        group: 'Open Finance',
        description: 'List transactions paid to a recipient organization.',
        params: [
            { name: 'recipient', type: 'string', placeholder: 'Recipient name' },
            { name: 'year_from', type: 'number', default: 2024 },
        ],
    },
    {
        id: 'openfinance_get_transactions_by_keyword',
        group: 'Open Finance',
        description: 'Find transactions by keyword in description (Macedonian Cyrillic).',
        params: [{ name: 'keyword', type: 'string', required: true, placeholder: 'e.g. Здравство' }],
    },
    {
        id: 'openfinance_get_spending_summary',
        group: 'Open Finance',
        description: 'Aggregated spending summary for up to 500 records.',
        params: [
            { name: 'term', type: 'string', placeholder: 'e.g. Култура' },
            { name: 'length', type: 'number', default: 500 },
        ],
    },

    // MakStat (3)
    {
        id: 'makstat_browse',
        group: 'MakStat',
        description: 'Browse the MakStat statistics catalog hierarchy.',
        params: [{ name: 'path', type: 'string', placeholder: 'Leave empty for root categories' }],
    },
    {
        id: 'makstat_get_metadata',
        group: 'MakStat',
        description: 'Get variables and values for a .px table before querying.',
        params: [{ name: 'path', type: 'string', required: true, placeholder: 'e.g. Пазар на труд/Плати/НаемниВработени' }],
    },
    {
        id: 'makstat_query',
        group: 'MakStat',
        description: 'Query a MakStat dataset with variable selections.',
        params: [
            { name: 'path', type: 'string', required: true, placeholder: 'e.g. Пазар на труд/Плати/НаемниВработени' },
            {
                name: 'selections',
                type: 'string',
                required: true,
                placeholder: '[{"code":"Година","filter":"top","values":["5"]},{"code":"Мерка","filter":"all","values":["*"]}]',
            },
        ],
    },

    // NBStat (3)
    {
        id: 'nbstat_browse',
        group: 'NBStat',
        description: 'Browse NBRM monetary & financial statistics hierarchy.',
        params: [{ name: 'path', type: 'string', placeholder: 'Leave empty for root' }],
    },
    {
        id: 'nbstat_get_metadata',
        group: 'NBStat',
        description: 'Get metadata for an NBStat table before querying.',
        params: [
            {
                name: 'path',
                type: 'string',
                required: true,
                placeholder: 'e.g. Eksterni statistiki/Platen Bilans/Platen bilans godisni/1_AgregiraniPodatociGodisniEN',
            },
        ],
    },
    {
        id: 'nbstat_query',
        group: 'NBStat',
        description: 'Query an NBStat table with variable selections.',
        params: [
            {
                name: 'path',
                type: 'string',
                required: true,
                placeholder: 'e.g. Eksterni statistiki/Platen Bilans/Platen bilans godisni/1_AgregiraniPodatociGodisniEN',
            },
            {
                name: 'selections',
                type: 'string',
                required: true,
                placeholder: '[{"code":"Период","filter":"top","values":["5"]},{"code":"Компонента","filter":"all","values":["*"]}]',
            },
        ],
    },

    // Budget (5)
    { id: 'budget_get_summary', group: 'Budget', description: 'Annual budget summary (revenue, expenditure, deficit).', params: [{ name: 'year', type: 'number', required: true, default: 2024 }] },
    {
        id: 'budget_get_income_breakdown',
        group: 'Budget',
        description: 'Income breakdown by source.',
        params: [{ name: 'year', type: 'number', required: true, default: 2024 }],
    },
    {
        id: 'budget_get_expenditure_breakdown',
        group: 'Budget',
        description: 'Expenditure breakdown by category.',
        params: [
            { name: 'year', type: 'number', required: true, default: 2024 },
            { name: 'breakdown', type: 'select', options: ['economic', 'functional'], default: 'economic' },
        ],
    },
    {
        id: 'budget_get_institutions',
        group: 'Budget',
        description: 'Budget allocations per institution.',
        params: [{ name: 'year', type: 'number', required: true, default: 2024 }],
    },
    { id: 'budget_get_macro_trends', group: 'Budget', description: 'Full macroeconomic time series from 2008.', params: [] },

    // data.gov.mk (4)
    {
        id: 'datagovmk_search_datasets',
        group: 'Data.gov.mk',
        description: 'Search the open data portal.',
        params: [
            { name: 'q', type: 'string', placeholder: 'e.g. финансии' },
            { name: 'rows', type: 'number', default: 10 },
        ],
    },
    {
        id: 'datagovmk_get_dataset',
        group: 'Data.gov.mk',
        description: 'Get dataset details by ID.',
        params: [{ name: 'id', type: 'string', required: true, placeholder: 'e.g. budzet-na-opstina-kumanovo-2024' }],
    },
    {
        id: 'datagovmk_query_datastore',
        group: 'Data.gov.mk',
        description: "Query a dataset's datastore (CKAN API).",
        params: [
            { name: 'resource_id', type: 'string', required: true, placeholder: 'Resource UUID' },
            { name: 'limit', type: 'number', default: 50 },
        ],
    },
    { id: 'datagovmk_list_organizations', group: 'Data.gov.mk', description: 'List publishing organizations.', params: [] },

    // uslugi.gov.mk (4)
    { id: 'uslugi_browse', group: 'uslugi.gov.mk', description: 'Browse the government e-services catalog.', params: [] },
    {
        id: 'uslugi_search_services',
        group: 'uslugi.gov.mk',
        description: 'Search services by keyword (Macedonian Cyrillic).',
        params: [{ name: 'term', type: 'string', required: true, placeholder: 'e.g. возачка, пасош, данок' }],
    },
    {
        id: 'uslugi_get_service',
        group: 'uslugi.gov.mk',
        description: 'Get full details (fees, deadlines, docs) for a service.',
        params: [{ name: 'id', type: 'number', required: true, placeholder: 'Service ID from uslugi_search_services' }],
    },
    { id: 'uslugi_list_institutions', group: 'uslugi.gov.mk', description: 'List government institutions with contact info.', params: [] },

    // Air MOEPP (4)
    {
        id: 'get_air_quality_stations',
        group: 'Air MOEPP',
        description: 'List all air quality monitoring stations in North Macedonia.',
        params: [{ name: 'city', type: 'string', placeholder: 'e.g. Скопје (optional filter)' }],
    },
    {
        id: 'get_station_measurements',
        group: 'Air MOEPP',
        description: 'Get recent pollution measurements (PM2.5, PM10, NO2, O3…) for a station.',
        params: [{ name: 'stationId', type: 'number', required: true, placeholder: 'Station ID from get_air_quality_stations' }],
    },
    {
        id: 'calculate_current_aqi',
        group: 'Air MOEPP',
        description: 'Calculate the current Air Quality Index for a station.',
        params: [{ name: 'stationId', type: 'number', required: true, placeholder: 'Station ID from get_air_quality_stations' }],
    },
    {
        id: 'find_nearest_station',
        group: 'Air MOEPP',
        description: 'Find the nearest air quality monitoring station to given coordinates.',
        params: [
            { name: 'lat', type: 'number', required: true, placeholder: '41.9981' },
            { name: 'lon', type: 'number', required: true, placeholder: '21.4254' },
        ],
    },
]

const groups = ['Open Finance', 'MakStat', 'NBStat', 'Budget', 'Data.gov.mk', 'uslugi.gov.mk', 'Air MOEPP']

export function Playground() {
    const { t } = useI18n()
    const [toolId, setToolId] = useState(tools[0].id)
    const [params, setParams] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<string>('')
    const [elapsed, setElapsed] = useState<number | null>(null)
    const [copied, setCopied] = useState(false)

    const tool = useMemo(() => tools.find((x) => x.id === toolId)!, [toolId])

    const onChangeTool = (id: string) => {
        setToolId(id)
        setParams({})
        setResponse('')
        setElapsed(null)
    }

    const setParam = (name: string, val: string) => setParams((p) => ({ ...p, [name]: val }))

    const run = async () => {
        setLoading(true)
        setResponse('')
        setElapsed(null)
        const start = performance.now()
        try {
            const args: Record<string, unknown> = {}
            for (const def of tool.params) {
                const raw = params[def.name] ?? (def.default !== undefined ? String(def.default) : '')
                if (raw === '') continue
                args[def.name] = def.type === 'number' ? Number(raw) : raw
            }
            const res = await fetch('/api/playground', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tool: toolId, params: args }),
            })
            const data = await res.json()
            setResponse(JSON.stringify(data, null, 2))
        } catch (err) {
            setResponse(JSON.stringify({ error: String(err) }, null, 2))
        } finally {
            setElapsed(Math.round(performance.now() - start))
            setLoading(false)
        }
    }

    const copy = async () => {
        await navigator.clipboard.writeText(response)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
    }

    return (
        <section id="playground" className="border-border scroll-mt-20 border-b">
            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
                <Reveal className="mb-10 max-w-2xl">
                    <div className="eyebrow mb-3">{t('nav_playground')}</div>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('playground_title')}</h2>
                    <p className="text-muted-foreground mt-3">{t('playground_subtitle')}</p>
                </Reveal>

                <Reveal>
                    <div className="grid gap-5 lg:grid-cols-2">
                        {/* LEFT */}
                        <div className="card-flat p-6">
                            <label className="text-muted-foreground mb-2 block text-xs font-medium tracking-wider uppercase">{t('playground_select_tool')}</label>
                            <select value={toolId} onChange={(e) => onChangeTool(e.target.value)} className="border-border bg-background w-full rounded-md border px-3 py-2 font-mono text-sm">
                                {groups.map((g) => (
                                    <optgroup key={g} label={g}>
                                        {tools
                                            .filter((x) => x.group === g)
                                            .map((x) => (
                                                <option key={x.id} value={x.id}>
                                                    {x.id}
                                                </option>
                                            ))}
                                    </optgroup>
                                ))}
                            </select>

                            <p className="text-muted-foreground mt-3 flex items-start gap-2 text-sm">
                                <Wrench className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                                {tool.description}
                            </p>

                            <div className="mt-5 space-y-3">
                                {tool.params.length === 0 && <p className="text-muted-foreground text-sm italic">No parameters required.</p>}
                                {tool.params.map((p) => (
                                    <div key={p.name}>
                                        <label className="text-foreground mb-1.5 block text-xs font-medium">
                                            <span className="font-mono">{p.name}</span>
                                            {p.required && <span className="text-destructive ml-1">*</span>}
                                            <span className="text-muted-foreground ml-2 text-[10px] tracking-wider uppercase">{p.type}</span>
                                        </label>
                                        {p.type === 'select' ? (
                                            <select
                                                value={params[p.name] ?? String(p.default ?? '')}
                                                onChange={(e) => setParam(p.name, e.target.value)}
                                                className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm"
                                            >
                                                {p.options?.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={p.type === 'number' ? 'number' : 'text'}
                                                placeholder={p.placeholder}
                                                value={params[p.name] ?? (p.default !== undefined ? String(p.default) : '')}
                                                onChange={(e) => setParam(p.name, e.target.value)}
                                                className="border-border bg-background w-full rounded-md border px-3 py-2 font-mono text-sm"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button onClick={run} disabled={loading} className="btn-primary mt-6 disabled:opacity-60">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                                {loading ? t('playground_running') : t('playground_run')}
                            </button>
                        </div>

                        {/* RIGHT */}
                        <div className="card-flat flex flex-col overflow-hidden">
                            <div className="border-border bg-surface flex items-center justify-between border-b px-4 py-2.5">
                                <span className="text-muted-foreground font-mono text-xs">{t('playground_response')}</span>
                                <button
                                    onClick={copy}
                                    disabled={!response}
                                    className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="text-source-green h-3.5 w-3.5" /> {t('playground_copied')}
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" /> {t('playground_copy')}
                                        </>
                                    )}
                                </button>
                            </div>
                            <pre className="bg-subtle max-h-[480px] min-h-[280px] flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
                                <code>{response || '// Run a tool to see the response'}</code>
                            </pre>
                            <div className="border-border bg-surface text-muted-foreground border-t px-4 py-2 text-xs">
                                {t('playground_time')}: {elapsed !== null ? `${elapsed} ms` : '—'}
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}
