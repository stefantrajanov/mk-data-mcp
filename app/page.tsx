'use client'

import { ThemeProvider } from '@/lib/theme'
import { I18nProvider } from '@/lib/i18n'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { CompatibleWith } from '@/components/landing/CompatibleWith'
import { Sources } from '@/components/landing/Sources'
import { Audience } from '@/components/landing/Audience'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Demo } from '@/components/landing/Demo'
import { Playground } from '@/components/landing/Playground'
import { Changelog } from '@/components/landing/Changelog'
import { Setup } from '@/components/landing/Setup'
import { Footer } from '@/components/landing/Footer'
import { FloatingCopy } from '@/components/landing/FloatingCopy'

export default function HomePage() {
    return (
        <ThemeProvider>
            <I18nProvider>
                <main className="relative min-h-screen">
                    <Navbar />
                    <Hero />
                    <CompatibleWith />
                    <Sources />
                    <Audience />
                    <HowItWorks />
                    <Demo />
                    <Playground />
                    <Changelog />
                    <Setup />
                    <Footer />
                    <FloatingCopy />
                </main>
            </I18nProvider>
        </ThemeProvider>
    )
}
