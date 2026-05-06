import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'MK Data MCP — Macedonian Government Data for AI',
    description: '28 MCP tools from 7 official sources. Connect your AI assistant to real-time public data from North Macedonia.',
    openGraph: {
        title: 'MK Data MCP — Macedonian Government Data for AI',
        description: '28 MCP tools from 7 official sources of North Macedonia government open data.',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
            <body className="flex min-h-full flex-col">{children}</body>
        </html>
    )
}
