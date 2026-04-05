'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Database, Send, FileText, Wrench, Table, Download, ChevronDown, Eye, Filter } from 'lucide-react'
import Navbar from '@/components/Navbar'

const sampleResponse = `Based on data from MakStat, here is a comparison of unemployment rates and average net salaries in North Macedonia from 2015 to 2024. The unemployment rate has shown a steady decline from 26.1% in 2015 to approximately 13.1% in 2024. Meanwhile, the average net salary has increased from 22,342 MKD in 2015 to approximately 34,200 MKD in 2024. These trends indicate significant improvement in the labor market, with more people employed and higher average compensation.`

const sampleTable = [
    { year: 2015, salary: '22,342', unemployment: '26.1%' },
    { year: 2016, salary: '23,505', unemployment: '23.7%' },
    { year: 2017, salary: '24,276', unemployment: '22.4%' },
    { year: 2018, salary: '25,213', unemployment: '20.7%' },
    { year: 2019, salary: '26,382', unemployment: '17.3%' },
    { year: 2020, salary: '27,017', unemployment: '16.4%' },
    { year: 2021, salary: '28,434', unemployment: '15.7%' },
    { year: 2022, salary: '30,125', unemployment: '14.4%' },
    { year: 2023, salary: '32,075', unemployment: '13.5%' },
    { year: 2024, salary: '34,200', unemployment: '13.1%' },
]

const sampleJson = JSON.stringify(
    sampleTable.map((r) => ({
        year: r.year,
        avg_salary_mkd: r.salary,
        unemployment_rate: r.unemployment,
    })),
    null,
    2
)

const mcpReasoning = 'Model selected makstat_population_by_municipality because the dataset contains demographic statistics by municipality.'

export default function DemoPage() {
    const [query, setQuery] = useState('')
    const [model, setModel] = useState('gemini')
    const [source, setSource] = useState('auto')
    const [hasResult, setHasResult] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showReasoning, setShowReasoning] = useState(false)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [yearFrom, setYearFrom] = useState('')
    const [yearTo, setYearTo] = useState('')
    const [municipality, setMunicipality] = useState('')
    const [category, setCategory] = useState('')

    const handleRun = () => {
        setLoading(true)
        setTimeout(() => {
            setHasResult(true)
            setLoading(false)
        }, 1500)
    }

    const inputCls =
        'mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

    const selectCls =
        'mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none'

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />

            <div className="flex flex-1 flex-col lg:flex-row">
                {/* Left Sidebar — white, narrow, fixed-ish */}
                <aside className="border-border w-full shrink-0 border-b bg-white p-5 lg:w-56 lg:border-r lg:border-b-0 xl:w-64">
                    <h2 className="text-foreground text-base font-semibold">Ask a question</h2>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">Query Macedonian public datasets using natural language.</p>

                    <textarea
                        className="border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 mt-4 w-full resize-none rounded-xl border bg-slate-50 p-3 text-sm focus:ring-2 focus:outline-none"
                        rows={4}
                        placeholder="Compare unemployment and average salary trends in the last 10 years."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    {/* AI Model */}
                    <label className="text-foreground mt-4 block text-xs font-medium">AI Model</label>
                    <div className="relative">
                        <select className={selectCls} value={model} onChange={(e) => setModel(e.target.value)}>
                            <option value="gemini">Gemini Flash</option>
                            <option value="claude">Claude</option>
                            <option value="gpt">GPT</option>
                        </select>
                        <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                    </div>

                    {/* Data Source */}
                    <label className="text-foreground mt-3 block text-xs font-medium">Data source (optional)</label>
                    <div className="relative">
                        <select className={selectCls} value={source} onChange={(e) => setSource(e.target.value)}>
                            <option value="auto">Auto detect</option>
                            <option value="makstat">MakStat</option>
                            <option value="datagov">data.gov.mk</option>
                        </select>
                        <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
                    </div>

                    {/* Advanced Filters */}
                    <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="mt-3">
                        <CollapsibleTrigger className="border-border bg-background text-foreground flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-50">
                            <span className="flex items-center gap-1.5">
                                <Filter className="text-muted-foreground h-3.5 w-3.5" />
                                Advanced Filters
                            </span>
                            <ChevronDown className={`text-muted-foreground h-3.5 w-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="border-border bg-background mt-2 space-y-2 rounded-lg border p-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-muted-foreground block text-xs font-medium">Year from</label>
                                    <input type="number" placeholder="2015" className={inputCls} value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-muted-foreground block text-xs font-medium">Year to</label>
                                    <input type="number" placeholder="2024" className={inputCls} value={yearTo} onChange={(e) => setYearTo(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="text-muted-foreground block text-xs font-medium">Municipality</label>
                                <input type="text" placeholder="e.g. Skopje" className={inputCls} value={municipality} onChange={(e) => setMunicipality(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-muted-foreground block text-xs font-medium">Dataset category</label>
                                <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="">All categories</option>
                                    <option value="demographics">Demographics</option>
                                    <option value="economy">Economy</option>
                                    <option value="education">Education</option>
                                    <option value="health">Health</option>
                                </select>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Query button */}
                    <Button className="mt-5 w-full rounded-lg font-semibold" onClick={handleRun} disabled={loading}>
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="border-primary-foreground h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                                Processing…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Send className="h-4 w-4" /> Query Data
                            </span>
                        )}
                    </Button>
                </aside>

                {/* Right Content Panel — slate-50 bg */}
                <main className="flex-1 overflow-auto p-6">
                    {!hasResult && !loading ? (
                        <div className="text-muted-foreground flex h-full min-h-[400px] items-center justify-center">
                            <div className="text-center">
                                <Database className="mx-auto h-12 w-12 opacity-25" />
                                <p className="mt-3 text-sm">Run a query to see results here.</p>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="flex h-full min-h-[400px] items-center justify-center">
                            <div className="text-center">
                                <span className="border-primary mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                                <p className="text-muted-foreground mt-3 text-sm">Querying public data…</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h2 className="text-foreground text-lg font-semibold">Generated Answer</h2>

                            {/* Answer Tabs */}
                            <Tabs defaultValue="answer">
                                <TabsList className="bg-muted/60">
                                    <TabsTrigger value="answer">Answer</TabsTrigger>
                                    <TabsTrigger value="table">Table</TabsTrigger>
                                    <TabsTrigger value="json">JSON</TabsTrigger>
                                </TabsList>

                                <TabsContent value="answer" className="mt-3">
                                    <div className="border-border text-foreground rounded-xl border bg-white p-5 text-sm leading-relaxed shadow-sm">{sampleResponse}</div>
                                </TabsContent>

                                <TabsContent value="table" className="mt-3">
                                    <div className="border-border overflow-x-auto rounded-xl border bg-white shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-border border-b bg-slate-50">
                                                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">Year</th>
                                                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">Avg. Salary (MKD)</th>
                                                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">Unemployment</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-border divide-y">
                                                {sampleTable.map((row) => (
                                                    <tr key={row.year} className="transition-colors hover:bg-slate-50">
                                                        <td className="text-foreground px-4 py-3 text-sm">{row.year}</td>
                                                        <td className="text-foreground px-4 py-3 text-sm">{row.salary}</td>
                                                        <td className="text-foreground px-4 py-3 text-sm">{row.unemployment}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="json" className="mt-3">
                                    <div className="border-border rounded-xl border bg-white p-4 shadow-sm">
                                        <pre className="text-foreground overflow-x-auto font-mono text-xs whitespace-pre">{sampleJson}</pre>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {/* Download buttons */}
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg bg-white">
                                    <Download className="h-3.5 w-3.5" /> Download CSV
                                </Button>
                                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg bg-white">
                                    <Download className="h-3.5 w-3.5" /> Download JSON
                                </Button>
                            </div>

                            {/* MCP Tool Transparency */}
                            <div className="border-border rounded-xl border bg-white p-4 shadow-sm">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="flex items-start gap-2.5">
                                        <Wrench className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            <div className="text-muted-foreground text-xs">Tool used</div>
                                            <div className="text-foreground mt-0.5 font-mono text-xs font-medium break-all">makstat_population_by_municipality</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <FileText className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            <div className="text-muted-foreground text-xs">Source</div>
                                            <div className="text-foreground mt-0.5 text-sm font-medium">MakStat API</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <Table className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            <div className="text-muted-foreground text-xs">Format</div>
                                            <div className="text-foreground mt-0.5 text-sm font-medium">Normalized JSON</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowReasoning(!showReasoning)}
                                    className="text-primary hover:text-primary/80 mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    {showReasoning ? 'Hide MCP reasoning' : 'Show MCP reasoning'}
                                </button>
                                {showReasoning && <div className="text-muted-foreground mt-2 rounded-lg bg-slate-50 p-3 text-xs italic">{mcpReasoning}</div>}
                            </div>

                            {/* Structured Data Preview */}
                            <div className="border-border overflow-hidden rounded-xl border bg-white shadow-sm">
                                <div className="border-border flex items-center gap-2 border-b bg-slate-50 px-4 py-3">
                                    <Table className="text-muted-foreground h-4 w-4" />
                                    <span className="text-foreground text-sm font-medium">Structured Data Preview</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-border border-b">
                                                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium">Year</th>
                                                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium">Avg. Salary (MKD)</th>
                                                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium">Unemployment</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-border divide-y">
                                            {sampleTable.map((row) => (
                                                <tr key={row.year} className="transition-colors hover:bg-slate-50">
                                                    <td className="text-foreground px-4 py-3">{row.year}</td>
                                                    <td className="text-foreground px-4 py-3">{row.salary}</td>
                                                    <td className="text-foreground px-4 py-3">{row.unemployment}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
