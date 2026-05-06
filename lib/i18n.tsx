'use client'

import { createContext, useContext, useEffect, useState, startTransition, type ReactNode } from 'react'

export type Lang = 'mk' | 'en'

type Dict = Record<string, string>

const translations: Record<Lang, Dict> = {
    mk: {
        nav_sources: 'Извори',
        nav_demo: 'Демо',
        nav_setup: 'Поставување',
        nav_changelog: 'Новости',
        nav_audience: 'За кого е',
        nav_playground: 'Playground',

        hero_title: 'Македонски Државни Податоци за AI',
        hero_subtitle: '28 алатки од 7 официјални извори. Поврзи го твојот AI асистент со јавни податоци од Северна Македонија во реално време.',
        hero_cta_primary: 'Погледни Алатки',
        hero_cta_secondary: 'Копирај MCP Config',
        hero_tools_live: '28 алатки активни',
        stat_tools: 'Алатки',
        stat_sources: 'Извори',
        stat_open: 'Отворени Податоци',

        works_with: 'Работи со',
        and_more: 'и повеќе',
        any_client: 'Било кој MCP клиент',

        sources_title: 'Достапни Извори',
        sources_subtitle: 'Седум официјални извори на македонски државни податоци, достапни како MCP алатки.',
        tools_label: 'алатки',
        live: 'Активно',

        how_title: 'Како Функционира',
        how_subtitle: 'Три едноставни чекори до македонски државни податоци во твојот AI.',
        step1_title: 'Поврзи',
        step1_desc: 'Додај го MCP server URL во твојот AI асистент (30 секунди).',
        step2_title: 'Прашај',
        step2_desc: 'Постави прашање на природен јазик за македонски јавни податоци.',
        step3_title: 'Добиј Податоци',
        step3_desc: 'AI ги користи алатките за да донесе официјални податоци во реално време.',

        demo_title: 'Пробај Живо',
        demo_subtitle: 'Погледни како твојот AI асистент користи MK Data MCP за да одговори на прашања.',
        demo_tools_used: 'Користени алатки',
        demo_pause: 'Пауза',
        demo_play: 'Пушти',

        audience_title: 'За кого е ова?',
        audience_subtitle: 'Изградено за луѓе кои работат со јавни податоци секој ден.',
        aud1_title: 'Дата научници и аналитичари',
        aud1_desc: 'Прашај структурирани статистички податоци од MakStat и NBStat директно во твојата анализа. Без скрапирање, без CSV преземања.',
        aud2_title: 'Студенти и истражувачи',
        aud2_desc: 'Провери факти, следи буџетски алокации и истражи економски трендови со реални податоци за твоја теза или истражување.',
        aud3_title: 'Новинари и civic tech',
        aud3_desc: 'Истражи јавна потрошувачка, вкрстено-провери трансакции и пронајди приказни закопани во јавните финансиски записи.',
        aud4_title: 'Граѓани и јавна администрација',
        aud4_desc: 'Најди државни услуги, провери такси, дознај кои документи ти требаат и разбери ги буџетските одлуки на едноставен јазик.',

        playground_title: 'Developer Playground',
        playground_subtitle: 'Тестирај ги MCP алатките директно со реални податоци.',
        playground_select_tool: 'Избери алатка',
        playground_run: 'Изврши',
        playground_running: 'Се извршува...',
        playground_response: 'Одговор',
        playground_copy: 'Копирај',
        playground_copied: 'Копирано!',
        playground_time: 'Време на одговор',

        setup_title: 'Поставување',
        setup_subtitle: 'Конфигурирај го твојот клиент за помалку од минута.',
        setup_note: 'За локален развој, замени го URL-от со http://localhost:3000/api/mcp.',
        setup_path: 'Патека на конфигурацијата',
        copy: 'Копирај',
        copied: 'Копирано!',

        changelog_title: 'Неодамна Додадено',
        changelog_subtitle: 'Што е ново во MK Data MCP.',

        footer_tagline: 'MK Data MCP — Отворени податоци за Северна Македонија',
        footer_built: 'Изграден врз официјални API-ја на македонски државни институции',
        footer_devs: 'За програмери',
        footer_playground: 'Tool Playground',

        floating_copy: 'Копирај MCP URL',
        floating_copied: 'Копирано во клипборд',
    },
    en: {
        nav_sources: 'Sources',
        nav_demo: 'Demo',
        nav_setup: 'Setup',
        nav_changelog: 'Changelog',
        nav_audience: "Who it's for",
        nav_playground: 'Playground',

        hero_title: 'Macedonian Government Data for AI',
        hero_subtitle: '28 tools from 7 official sources. Connect your AI assistant to real-time public data from North Macedonia.',
        hero_cta_primary: 'Browse Tools',
        hero_cta_secondary: 'Copy MCP Config',
        hero_tools_live: '28 tools live',
        stat_tools: 'Tools',
        stat_sources: 'Sources',
        stat_open: 'Open Data',

        works_with: 'Works with',
        and_more: 'and more',
        any_client: 'Any MCP client',

        sources_title: 'Available Sources',
        sources_subtitle: 'Seven official sources of Macedonian government data, exposed as MCP tools.',
        tools_label: 'tools',
        live: 'Live',

        how_title: 'How it Works',
        how_subtitle: 'Three simple steps to Macedonian government data inside your AI.',
        step1_title: 'Connect',
        step1_desc: 'Add the MCP server URL to your AI assistant (30 seconds).',
        step2_title: 'Ask',
        step2_desc: 'Ask a natural-language question about Macedonian public data.',
        step3_title: 'Get Data',
        step3_desc: 'The AI uses the tools to fetch official data in real time.',

        demo_title: 'Try it Live',
        demo_subtitle: 'See how your AI assistant uses MK Data MCP to answer questions.',
        demo_tools_used: 'Tools used',
        demo_pause: 'Pause',
        demo_play: 'Play',

        audience_title: 'Who is this for?',
        audience_subtitle: 'Built for people who work with public data every day.',
        aud1_title: 'Data Scientists & Analysts',
        aud1_desc: 'Query structured statistical datasets from MakStat and NBStat directly in your analysis pipeline. No scraping, no CSV downloads.',
        aud2_title: 'Students & Researchers',
        aud2_desc: 'Verify facts, trace budget allocations, and explore economic trends with real data for your thesis or research paper.',
        aud3_title: 'Journalists & Civic Tech',
        aud3_desc: 'Investigate government spending, cross-reference transactions, and surface stories buried in public financial records.',
        aud4_title: 'Citizens & Public Administration',
        aud4_desc: 'Find government services, check fees, learn what documents you need, and understand public budget decisions in plain language.',

        playground_title: 'Developer Playground',
        playground_subtitle: 'Test MCP tools directly against real data.',
        playground_select_tool: 'Select a tool',
        playground_run: 'Run',
        playground_running: 'Running...',
        playground_response: 'Response',
        playground_copy: 'Copy',
        playground_copied: 'Copied!',
        playground_time: 'Response time',

        setup_title: 'Setup',
        setup_subtitle: 'Configure your client in under a minute.',
        setup_note: 'For local development, replace the URL with http://localhost:3000/api/mcp.',
        setup_path: 'Config file path',
        copy: 'Copy',
        copied: 'Copied!',

        changelog_title: 'Recently Added',
        changelog_subtitle: "What's new in MK Data MCP.",

        footer_tagline: 'MK Data MCP — Open data for North Macedonia',
        footer_built: 'Built on official APIs of Macedonian government institutions',
        footer_devs: 'For developers',
        footer_playground: 'Tool Playground',

        floating_copy: 'Copy MCP URL',
        floating_copied: 'Copied to clipboard',
    },
}

const I18nContext = createContext<{
    lang: Lang
    setLang: (l: Lang) => void
    t: (k: keyof typeof translations.mk) => string
}>({ lang: 'mk', setLang: () => {}, t: (k) => k as string })

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>('mk')

    useEffect(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('mk-mcp-lang') : null
        if (stored === 'mk' || stored === 'en') startTransition(() => setLangState(stored))
    }, [])

    const setLang = (l: Lang) => {
        setLangState(l)
        if (typeof window !== 'undefined') localStorage.setItem('mk-mcp-lang', l)
    }

    const t = (k: keyof typeof translations.mk) => translations[lang][k] ?? (k as string)

    return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
