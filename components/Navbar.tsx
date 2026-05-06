'use client'

import { Database } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const pathname = usePathname()
    const isDemo = pathname === '/demo'

    return (
        <nav className="border-border bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md">
            <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <Link href="/" className="text-foreground flex items-center gap-2 font-semibold">
                    <Database className="text-foreground h-5 w-5" />
                    <span className="text-sm font-medium">MCP Public Data Connector</span>
                </Link>
                <div className="flex items-center gap-4">
                    {!isDemo ? (
                        <Link
                            href="/tool-playground"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center rounded-full px-5 text-sm font-semibold shadow-sm transition-colors"
                        >
                            Try Demo
                        </Link>
                    ) : (
                        <Link
                            href="/"
                            className="border-border text-foreground hover:bg-muted bg-background inline-flex h-9 items-center gap-1.5 rounded-full border px-5 text-sm font-medium transition-colors"
                        >
                            ← Back
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
