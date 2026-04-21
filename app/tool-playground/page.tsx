'use client'

import { executeTool } from '@/app/actions/executeTool'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, BookOpen, Play, RefreshCw, Terminal } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ---------------------------------------------------------------------------
// TYPES & CONFIG
// ---------------------------------------------------------------------------

type FieldType = 'string' | 'number' | 'enum'

interface ToolField {
    name: string
    type: FieldType
    label: string
    description?: string
    placeholder?: string
    options?: string[]
    required?: boolean
    default?: string | number
}

interface ToolConfig {
    name: string
    title: string
    description: string
    fields: ToolField[]
}

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

const sharedDateFields: ToolField[] = [
    { name: 'month_from', type: 'number', label: 'Month From', default: 1, description: 'Starting month (1-12)' },
    { name: 'year_from', type: 'number', label: 'Year From', default: currentYear, description: 'Starting year (e.g. 2000)' },
    { name: 'month_to', type: 'number', label: 'Month To', default: currentMonth, description: 'Ending month (1-12)' },
    { name: 'year_to', type: 'number', label: 'Year To', default: currentYear, description: 'Ending year' },
]

const sharedPaginationFields: ToolField[] = [
    { name: 'start', type: 'number', label: 'Start', default: 0, description: 'Pagination offset' },
    { name: 'length', type: 'number', label: 'Length', default: 50, description: 'Records per page (1-500)' },
]

const responseFormatField: ToolField = {
    name: 'response_format',
    type: 'enum',
    label: 'Format',
    default: 'markdown',
    options: ['markdown', 'json'],
    description: 'Format returned by the API',
}

const TOOLS_CONFIG: ToolConfig[] = [
    {
        name: 'multiply',
        title: 'Multiply',
        description: 'A simple test tool to multiply two numbers. Use this to verify the basic MCP connection.',
        fields: [
            { name: 'a', type: 'number', label: 'A', required: true, default: 0 },
            { name: 'b', type: 'number', label: 'B', required: true, default: 0 },
        ],
    },
    {
        name: 'openfinance_search_transactions',
        title: 'Search Transactions',
        description:
            'General-purpose tool to query Open Finance MK. Supports filtering by keyword, payer, recipient, EDBs, and date range. **Note: term MUST be in Macedonian Cyrillic.**\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow API response times.',
        fields: [
            { name: 'term', type: 'string', label: 'Keyword (Cyrillic)', placeholder: 'Образование', description: 'General keyword (Macedonian Cyrillic only)' },
            { name: 'payer', type: 'string', label: 'Payer Name', placeholder: 'Министерство...' },
            { name: 'recipient', type: 'string', label: 'Recipient Name', placeholder: 'Работник...' },
            { name: 'payerEDB', type: 'string', label: 'Payer EDB' },
            { name: 'recipientEDB', type: 'string', label: 'Recipient EDB' },
            ...sharedDateFields,
            ...sharedPaginationFields,
            responseFormatField,
        ],
    },
    {
        name: 'openfinance_get_transactions_by_payer',
        title: 'Get by Payer',
        description: 'Retrieve transactions strictly by a paying entity. Requires either `payer` or `payerEDB`.\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow API responses.',
        fields: [
            { name: 'payer', type: 'string', label: 'Payer Name', placeholder: 'Општина Центар' },
            { name: 'payerEDB', type: 'string', label: 'Payer EDB' },
            ...sharedDateFields,
            ...sharedPaginationFields,
            responseFormatField,
        ],
    },
    {
        name: 'openfinance_get_transactions_by_recipient',
        title: 'Get by Recipient',
        description:
            'Retrieve transactions strictly assigned to a receiving entity. Requires either `recipient` or `recipientEDB`.\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow API responses.',
        fields: [
            { name: 'recipient', type: 'string', label: 'Recipient Name', placeholder: 'Градежни работи' },
            { name: 'recipientEDB', type: 'string', label: 'Recipient EDB' },
            ...sharedDateFields,
            ...sharedPaginationFields,
            responseFormatField,
        ],
    },
    {
        name: 'openfinance_get_transactions_by_keyword',
        title: 'Get by Keyword',
        description:
            'Search by a thematic keyword. **CRITICAL: The keyword MUST be in Macedonian Cyrillic script.** (e.g. Образование)\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow responses.',
        fields: [{ name: 'keyword', type: 'string', label: 'Keyword (Cyrillic)', placeholder: 'Здравство', required: true }, ...sharedDateFields, ...sharedPaginationFields, responseFormatField],
    },
    {
        name: 'openfinance_get_spending_summary',
        title: 'Get Spending Summary',
        description: 'Compute an aggregated spending summary client-side for up to 500 records limits.\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow responses.',
        fields: [
            { name: 'term', type: 'string', label: 'Keyword (Cyrillic)', placeholder: 'Култура' },
            { name: 'payer', type: 'string', label: 'Payer Name' },
            { name: 'recipient', type: 'string', label: 'Recipient Name' },
            ...sharedDateFields,
            { name: 'length', type: 'number', label: 'Length', default: 500, description: 'Max records to fetch & sum (max 500)' },
        ],
    },
]

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

export default function DemoPage() {
    const [selectedToolId, setSelectedToolId] = useState<string>(TOOLS_CONFIG[0].name)
    const [formValues, setFormValues] = useState<Record<string, string | number>>({})
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ content?: { text?: string }[] } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [lastArgs, setLastArgs] = useState<Record<string, string | number> | null>(null)

    const activeTool = TOOLS_CONFIG.find((t) => t.name === selectedToolId)!

    // Populate defaults when tool changes
    const handleToolSelect = (toolName: string) => {
        setSelectedToolId(toolName)
        const tool = TOOLS_CONFIG.find((t) => t.name === toolName)!
        const initialVars: Record<string, string | number> = {}
        tool.fields.forEach((f) => {
            if (f.default !== undefined) {
                initialVars[f.name] = f.default
            }
        })
        setFormValues(initialVars)
        setResult(null)
        setError(null)
    }

    const handleChange = (name: string, value: string, type: FieldType) => {
        setFormValues((prev) => {
            const copy = { ...prev }
            if (value === '') {
                delete copy[name]
            } else if (type === 'number') {
                copy[name] = Number(value)
            } else {
                copy[name] = value
            }
            return copy
        })
    }

    const handleRun = async () => {
        setLoading(true)
        setError(null)
        setResult(null)
        setLastArgs(formValues)

        const payloadStr = JSON.stringify(formValues)

        try {
            const res = await executeTool(activeTool.name, payloadStr)
            if (!res.success) {
                setError(res.error || 'Execution failed.')
            } else {
                setResult(res.result as { content?: { text?: string }[] } | null)
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setLoading(false)
        }
    }

    // Helper: Result Parsing
    const getRenderedContent = () => {
        if (!result || !result.content || result.content.length === 0) return 'No content.'
        return result.content[0].text
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
            <Navbar />

            <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 p-4 lg:flex-row lg:p-8">
                {/* 
                  =======================================================
                  LEFT COLUMN: CONFIGURATION
                  ======================================================= 
                */}
                <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[380px]">
                    <div className="border-border flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
                        <div className="border-border border-b bg-slate-50/50 p-4">
                            <h2 className="flex items-center gap-2 text-sm font-semibold">
                                <Terminal className="text-primary h-4 w-4" />
                                Tool Configuration
                            </h2>
                            <p className="text-muted-foreground mt-1 text-xs">Select and configure an MCP tool to execute.</p>
                        </div>

                        <div className="flex max-h-[calc(100vh-200px)] flex-1 flex-col gap-4 overflow-y-auto p-4">
                            {/* Tool Selection */}
                            <div>
                                <label className="text-foreground mb-1.5 block text-xs font-semibold">Select Tool</label>
                                <select
                                    className="border-border bg-background focus:ring-primary/20 w-full appearance-none rounded-lg border px-3 py-2.5 font-mono text-sm transition-all focus:ring-2 focus:outline-none"
                                    value={selectedToolId}
                                    onChange={(e) => handleToolSelect(e.target.value)}
                                >
                                    {TOOLS_CONFIG.map((tool) => (
                                        <option key={tool.name} value={tool.name}>
                                            {tool.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <hr className="border-border my-1" />

                            {/* Dynamic Fields */}
                            <div className="flex flex-col gap-4">
                                {activeTool.fields.map((field) => (
                                    <div key={field.name}>
                                        <label className="text-foreground mb-1.5 flex items-center justify-between text-xs font-semibold">
                                            <span>
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </span>
                                            <span className="text-muted-foreground rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px]">{field.name}</span>
                                        </label>

                                        {field.type === 'enum' ? (
                                            <select
                                                className="border-border bg-background focus:ring-primary/20 w-full appearance-none rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                                                value={formValues[field.name] || ''}
                                                onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                                            >
                                                <option value="" disabled>
                                                    Select {field.label}...
                                                </option>
                                                {field.options?.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type === 'number' ? 'number' : 'text'}
                                                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                                className="border-border bg-background placeholder:text-muted-foreground focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm transition-all focus:ring-2 focus:outline-none"
                                                value={formValues[field.name] ?? ''}
                                                onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                                            />
                                        )}
                                        {field.description && <p className="text-muted-foreground mt-1.5 text-[11px] leading-snug">{field.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-border border-t bg-slate-50/50 p-4">
                            <Button
                                onClick={handleRun}
                                disabled={loading}
                                className="bg-primary text-primary-foreground hover:bg-primary/95 h-10 w-full rounded-xl font-semibold shadow-sm transition-all"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Executing Tool...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Play className="h-4 w-4 fill-current" />
                                        Run Tool
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* 
                  =======================================================
                  RIGHT COLUMN: DOCUMENTATION & RESULTS
                  ======================================================= 
                */}
                <main className="flex w-full min-w-0 flex-1 flex-col gap-6">
                    {/* Tool Documentation Header */}
                    <div className="border-border rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="bg-primary/10 rounded-lg p-2">
                                <BookOpen className="text-primary h-5 w-5" />
                            </div>
                            <h1 className="text-foreground text-xl font-bold">{activeTool.title}</h1>
                        </div>
                        <div className="prose prose-sm text-muted-foreground prose-strong:text-foreground prose-strong:font-semibold mt-4 max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeTool.description}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Results Body */}
                    <div className="border-border flex min-h-[400px] flex-1 flex-col rounded-2xl border bg-white shadow-sm">
                        {!result && !error && !loading ? (
                            <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center p-8 text-center">
                                <div className="ring-border mb-4 rounded-full bg-slate-50 p-4 ring-1">
                                    <Play className="text-muted-foreground h-8 w-8 opacity-50" />
                                </div>
                                <h3 className="text-foreground font-semibold">Awaiting Execution</h3>
                                <p className="mt-1 max-w-sm text-sm">Fill in the arguments on the left and run the tool to see the execution results here.</p>
                            </div>
                        ) : loading ? (
                            <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center p-8 text-center">
                                <RefreshCw className="text-primary mb-4 h-8 w-8 animate-spin" />
                                <h3 className="text-foreground text-sm font-semibold">Processing Request...</h3>
                                <p className="mt-1 text-xs">This may take a moment depending on the date range.</p>
                            </div>
                        ) : (
                            <Tabs defaultValue={error ? 'raw' : 'rendered'} className="relative flex w-full flex-1 flex-col">
                                <div className="border-border rounded-t-2xl border-b bg-slate-50/50 p-2">
                                    <TabsList className="bg-background/50 border-border/50 border">
                                        <TabsTrigger value="rendered" disabled={!!error} className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            Rendered Output
                                        </TabsTrigger>
                                        <TabsTrigger value="raw" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            Raw Response
                                        </TabsTrigger>
                                        <TabsTrigger value="args" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                            Payload Sent
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="relative flex-1 overflow-x-auto p-4">
                                    {error ? (
                                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
                                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                            <div className="flex w-full min-w-0 flex-col gap-1">
                                                <span className="text-sm font-semibold">Execution Failed</span>
                                                <code className="mt-1 block overflow-x-auto rounded bg-red-100/50 px-2 py-1 text-xs whitespace-pre-wrap">{error}</code>
                                            </div>
                                        </div>
                                    ) : (
                                        <TabsContent value="rendered" className="mt-0 h-full text-sm outline-none data-[state=inactive]:hidden">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    table: ({ node, ...props }) => (
                                                        <div className="border-border scrollbar-thin scrollbar-thumb-slate-300 my-6 w-full overflow-x-auto rounded-lg border bg-white shadow-sm">
                                                            <table className="w-full min-w-max border-collapse text-left text-sm whitespace-nowrap" {...props} />
                                                        </div>
                                                    ),
                                                    thead: ({ node, ...props }) => <thead className="border-border border-b bg-slate-50" {...props} />,
                                                    th: ({ node, ...props }) => <th className="text-muted-foreground p-3 font-semibold" {...props} />,
                                                    td: ({ node, ...props }) => <td className="border-border/50 text-foreground border-b p-3" {...props} />,
                                                    p: ({ node, ...props }) => <p className="text-foreground mb-4 leading-relaxed" {...props} />,
                                                    blockquote: ({ node, ...props }) => (
                                                        <blockquote className="my-4 rounded-r-lg border-l-4 border-blue-500/50 bg-blue-50/50 p-3 text-xs text-blue-800 italic" {...props} />
                                                    ),
                                                    strong: ({ node, ...props }) => <strong className="text-foreground font-semibold" {...props} />,
                                                    h1: ({ node, ...props }) => <h1 className="mt-6 mb-4 text-xl font-bold" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="mt-5 mb-3 text-lg font-bold" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="mb-4 list-inside list-disc space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="text-foreground" {...props} />,
                                                    code: ({ node, className, children, ...props }) => {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        return !match ? (
                                                            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-pink-600" {...props}>
                                                                {children}
                                                            </code>
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        )
                                                    },
                                                }}
                                            >
                                                {getRenderedContent()}
                                            </ReactMarkdown>
                                        </TabsContent>
                                    )}

                                    <TabsContent value="raw" className="mt-0 h-full outline-none data-[state=inactive]:hidden">
                                        <div className="w-full overflow-x-auto rounded-xl border border-[#30363D] bg-[#0D1117] p-4 font-mono text-xs text-[#C9D1D9]">
                                            <pre>{JSON.stringify(result, null, 2)}</pre>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="args" className="mt-0 h-full outline-none data-[state=inactive]:hidden">
                                        <div className="overflow-x-auto rounded-xl border border-[#30363D] bg-[#0D1117] p-4 font-mono text-xs text-[#C9D1D9]">
                                            <pre>{JSON.stringify({ tool: activeTool.name, args: lastArgs }, null, 2)}</pre>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
