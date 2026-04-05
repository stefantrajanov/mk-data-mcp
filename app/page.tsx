import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Cpu, Brain, Code2, Globe, BarChart3, Landmark, FileText, MessageSquare, Wrench, Server, CheckCircle2, FlaskConical, GraduationCap, Building2, Users, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'

const aiModels = [
    { name: 'Gemini Flash (Google)', icon: Sparkles },
    { name: 'Claude (Anthropic)', icon: Brain },
    { name: 'GPT (OpenAI)', icon: Cpu },
    { name: 'Open-source LLM (Llama, Mistral)', icon: Code2 },
]

const dataSources = [
    { name: 'data.gov.mk', desc: 'Open government datasets', icon: Globe, active: true },
    { name: 'MakStat', desc: 'Statistical office data', icon: BarChart3, active: true },
    { name: 'Open Finance', desc: 'Coming soon', icon: Landmark, active: false },
    { name: 'Sobranie Open Data', desc: 'Coming soon', icon: FileText, active: false },
]

const steps = [
    { icon: MessageSquare, title: 'Ask a question', desc: 'In natural language' },
    { icon: Wrench, title: 'AI selects tool', desc: 'Via MCP protocol' },
    { icon: Server, title: 'Query public API', desc: 'Via MCP adapter' },
    { icon: CheckCircle2, title: 'Get answer', desc: 'From official data' },
]

const users = [
    { icon: FlaskConical, title: 'Data Scientists', desc: 'Analyze public datasets faster' },
    { icon: GraduationCap, title: 'Researchers & Students', desc: 'Access structured data easily' },
    { icon: Building2, title: 'Public Administration', desc: 'Data-driven decisions' },
    { icon: Users, title: 'Citizens', desc: 'Understand public data' },
]

const exampleQueries = [
    'Population by municipality for the last 10 years',
    'Compare unemployment rate and average salary trends 2015–2024',
    'Top 5 municipalities by population growth',
    'Budget spending by category in 2023',
]

export default function HomePage() {
    return (
        <div className="bg-background min-h-screen">
            <Navbar />

            {/* Hero — periwinkle/lavender gradient background */}
            <section className="py-28 text-center" style={{ background: 'var(--hero-gradient)' }}>
                <div className="mx-auto max-w-2xl px-6">
                    {/* Badge */}
                    <div className="mb-5 inline-flex flex-col items-center gap-2">
                        <div className="text-primary inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium shadow-sm backdrop-blur-sm">
                            <Sparkles className="h-4 w-4" />
                            Powered by MCP
                        </div>
                        <p className="text-muted-foreground text-sm">MCP (Model Context Protocol) allows AI models to securely access external tools and real-time public datasets.</p>
                    </div>

                    {/* Heading */}
                    <h1 className="text-foreground text-5xl leading-[1.1] font-extrabold tracking-tight sm:text-6xl">Access Macedonian Public Data through AI</h1>
                    <p className="text-muted-foreground mt-5 text-lg leading-relaxed">Query and retrieve structured datasets from data.gov.mk and MakStat using natural language through MCP.</p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex items-center justify-center gap-3">
                        <Button asChild size="lg" className="rounded-full px-7 font-semibold shadow-md">
                            <Link href="/demo">Try Demo</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full bg-white px-7 font-semibold shadow-sm">
                            <a href="#data-sources">View Data Sources</a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Example Queries — white bg */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-3xl px-6">
                    <h2 className="text-muted-foreground mb-8 text-center text-xs font-semibold tracking-widest uppercase">Example Queries</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {exampleQueries.map((q) => (
                            <Link
                                key={q}
                                href="/demo"
                                className="border-border text-foreground hover:border-primary/30 flex items-start gap-3 rounded-xl border bg-white p-4 text-sm shadow-sm transition-all hover:shadow-md"
                            >
                                <Search className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                                <span>{q}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Supported AI Models — slightly gray bg */}
            <section className="bg-slate-50 py-16">
                <div className="mx-auto max-w-3xl px-6">
                    <h2 className="text-muted-foreground mb-8 text-center text-xs font-semibold tracking-widest uppercase">Supported AI Models</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {aiModels.map((m) => (
                            <div key={m.name} className="border-border flex flex-col items-center gap-3 rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                                <m.icon className="text-primary h-8 w-8" />
                                <span className="text-foreground text-center text-sm font-medium">{m.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Supported Data Sources — white bg */}
            <section id="data-sources" className="bg-white py-16">
                <div className="mx-auto max-w-3xl px-6">
                    <h2 className="text-muted-foreground mb-2 text-center text-xs font-semibold tracking-widest uppercase">Supported Data Sources</h2>
                    <p className="text-muted-foreground mb-8 text-center text-sm">Data is retrieved through official APIs when available.</p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {dataSources.map((s) => (
                            <div
                                key={s.name}
                                className={`flex flex-col items-center gap-2 rounded-xl border bg-white p-6 text-center transition-shadow hover:shadow-md ${
                                    s.active ? 'border-border' : 'border-muted-foreground/30 border-dashed opacity-60'
                                }`}
                            >
                                <s.icon className={`h-8 w-8 ${s.active ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className="text-foreground text-sm font-semibold">{s.name}</span>
                                <span className="text-muted-foreground text-xs">{s.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works — slightly gray bg */}
            <section className="bg-slate-50 py-16">
                <div className="mx-auto max-w-3xl px-6">
                    <h2 className="text-muted-foreground mb-10 text-center text-xs font-semibold tracking-widest uppercase">How It Works</h2>
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        {steps.map((s, i) => (
                            <div key={s.title} className="flex flex-col items-center gap-3 text-center">
                                {/* Circular icon container — teal-ish bg */}
                                <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full">
                                    <s.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-primary text-xs font-bold">
                                        {i + 1} {s.title}
                                    </p>
                                    <p className="text-muted-foreground text-xs">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Built For — white bg */}
            <section className="bg-white py-16">
                <div className="mx-auto max-w-3xl px-6">
                    <h2 className="text-muted-foreground mb-8 text-center text-xs font-semibold tracking-widest uppercase">Built For</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {users.map((u) => (
                            <div key={u.title} className="border-border flex flex-col items-center gap-2 rounded-xl border bg-white p-6 text-center shadow-sm">
                                <u.icon className="text-primary h-8 w-8" />
                                <span className="text-foreground text-sm font-semibold">{u.title}</span>
                                <span className="text-muted-foreground text-xs">{u.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-border text-muted-foreground border-t bg-white py-8 text-center text-sm">
                MCP Public Data Connector — Open-source project for accessing Macedonian public data through AI.
            </footer>
        </div>
    )
}
