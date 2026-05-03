import { z } from 'zod'
import { nbstatBrowseSchema, nbstatGetMetadataSchema, nbstatQuerySchema } from '@/mcp/schemas/nbstat-schemas'

const API_BASE_URL = process.env.NBSTAT_API_BASE_URL || 'https://nbstat.nbrm.mk/api/v1'
const CHARACTER_LIMIT = 25_000

// ---------------------------------------------------------------------------
// TypeScript interfaces for PXWeb API responses
// ---------------------------------------------------------------------------

interface PxWebItem {
    id: string
    text: string
    type: string // "l" = level/category, "t" = table
}

interface PxWebVariable {
    code: string
    text: string
    values: string[]
    valueTexts: string[]
    elimination?: boolean
}

interface PxWebMetadata {
    title: string
    variables: PxWebVariable[]
}

interface JsonStat2Category {
    index: Record<string, number>
    label?: Record<string, string>
}

interface JsonStat2Dimension {
    label?: string
    category: JsonStat2Category
}

interface JsonStat2Dataset {
    id: string[]
    size: number[]
    dimension: Record<string, JsonStat2Dimension>
    value: (number | null)[]
}

// ---------------------------------------------------------------------------
// URL helpers — no database prefix, categories sit directly under /{lang}/
// ---------------------------------------------------------------------------

function buildBrowseUrl(lang: string, path: string): string {
    const base = `${API_BASE_URL}/${lang}`
    if (!path) return `${base}/`
    const encoded = path.split('/').map(encodeURIComponent).join('/')
    return `${base}/${encoded}/`
}

function buildTableUrl(lang: string, path: string): string {
    const base = `${API_BASE_URL}/${lang}`
    const parts = path.split('/')
    const table = parts[parts.length - 1]
    const dirs = parts.slice(0, -1)
    const dirPath = dirs.length > 0 ? `/${dirs.map(encodeURIComponent).join('/')}` : ''
    const tableFile = table.endsWith('.px') ? table : `${table}.px`
    return `${base}${dirPath}/${encodeURIComponent(tableFile)}`
}

// ---------------------------------------------------------------------------
// JSON-stat2 flattening
// ---------------------------------------------------------------------------

function flattenJsonStat2(dataset: JsonStat2Dataset): Record<string, string | number | null>[] {
    const { id: dimIds, size: sizes, dimension, value: values } = dataset

    const strides: number[] = new Array(dimIds.length)
    strides[dimIds.length - 1] = 1
    for (let d = dimIds.length - 2; d >= 0; d--) {
        strides[d] = strides[d + 1] * sizes[d + 1]
    }

    const dimCategories = dimIds.map((dimId) => {
        const dim = dimension[dimId]
        return Object.entries(dim.category.index)
            .sort(([, a], [, b]) => a - b)
            .map(([code]) => ({ code, text: dim.category.label?.[code] ?? code }))
    })

    return values.map((val, i) => {
        const row: Record<string, string | number | null> = {}
        for (let d = 0; d < dimIds.length; d++) {
            const catIndex = Math.floor(i / strides[d]) % sizes[d]
            const label = dimension[dimIds[d]].label || dimIds[d]
            row[label] = dimCategories[d][catIndex].text
        }
        row['value'] = val
        return row
    })
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function handleError(error: unknown): string {
    if (error instanceof Error) {
        if (error.message.includes('404')) return 'Error: Path not found. Verify the path using nbstat_browse.'
        if (error.message.includes('400')) return 'Error: Invalid query. Check variable codes and values using nbstat_get_metadata.'
        return `Error: ${error.message}`
    }
    return `Error: Unexpected error — ${String(error)}`
}

function applyCharacterLimit(text: string): string {
    if (text.length <= CHARACTER_LIMIT) return text
    return text.slice(0, CHARACTER_LIMIT) + '\n\n> ⚠️ Response truncated. Narrow your selection using filter="item" or filter="top" with fewer values.'
}

async function pxwebGet<T>(url: string): Promise<T> {
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
    return response.json() as Promise<T>
}

async function pxwebPost<T>(url: string, body: unknown): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
    })
    if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP ${response.status} — ${text.slice(0, 200)}`)
    }
    return response.json() as Promise<T>
}

// ===========================================================================
// TOOL 1 — nbstat_browse
// ===========================================================================

type BrowseInput = z.infer<typeof nbstatBrowseSchema>

export const nbstatBrowseTool = {
    name: 'nbstat_browse',
    meta: {
        title: 'Browse NBStat Categories',
        description: `Navigate the NBStat (National Bank of North Macedonia) statistical database hierarchy to find tables.

NBStat publishes monetary and financial statistics organized in three main databases:
- Eksterni statistiki — Balance of Payments, Foreign Reserves, External Debt, Exchange Rates, Direct & Portfolio Investment
- Finansiski smetki — Financial accounts by sector, Debt securities
- MS i KS — Monetary statistics (bank balance sheets, credit aggregates, deposits, loans) and Interest Rate statistics

Data is organized in three levels:
1. Root → databases (e.g. "Eksterni statistiki", "MS i KS")
2. Database → subcategories (e.g. "Platen Bilans", "Monetarni i kreditni agregati")
3. Subcategory → tables (type="table") — the queryable .px datasets

⚠️ IMPORTANT: The \`id\` field in results is the exact identifier used in URL paths. ALWAYS use the \`id\` or \`path\` field from this tool's output in subsequent calls — never translate or guess the path.

Workflow:
1. Call with no path → list root databases
2. Call with a database \`id\` as path → list subcategories or tables
3. When you see type="table", pass its \`path\` to nbstat_get_metadata

Returns each item with \`id\`, \`text\` (English label), \`type\` ("category" or "table"), and the full \`path\` ready to use in the next call.`,
        inputSchema: nbstatBrowseSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: BrowseInput) => {
        try {
            const url = buildBrowseUrl(params.lang, params.path)
            const items = await pxwebGet<PxWebItem[]>(url)

            if (!Array.isArray(items) || items.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No items found at this path. Verify it with nbstat_browse at a shorter path.' }] }
            }

            const result = {
                browsed_path: params.path || '(root)',
                items: items.map((item) => ({
                    id: item.id,
                    text: item.text,
                    type: item.type === 't' ? 'table' : 'category',
                    path: params.path ? `${params.path}/${item.id}` : item.id,
                })),
            }

            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 2 — nbstat_get_metadata
// ===========================================================================

type GetMetadataInput = z.infer<typeof nbstatGetMetadataSchema>

export const nbstatGetMetadataTool = {
    name: 'nbstat_get_metadata',
    meta: {
        title: 'Get NBStat Table Metadata',
        description: `Get the schema of a specific NBStat statistical table — its variables, their codes, and all available values.

This is a mandatory step before calling nbstat_query. Variable \`code\` fields and their value codes are required to build a valid query.

\`path\`: Full slash-separated path to the table using the \`path\` field from nbstat_browse. Do NOT include ".px" — the tool adds it internally.

Returns for each variable:
- \`code\`: Variable code → pass as "code" in nbstat_query selections
- \`text\`: English description (e.g. "Period", "Currency", "Indicator")
- \`values\`: Available values with their codes and labels
- \`elimination\`: If true, this variable can be omitted from the query

Tip: Use filter="top" + values=["N"] on time variables (e.g. "Период") instead of selecting specific period codes. This always returns the latest N periods without hardcoding dates.`,
        inputSchema: nbstatGetMetadataSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: GetMetadataInput) => {
        try {
            const url = buildTableUrl(params.lang, params.path)
            const metadata = await pxwebGet<PxWebMetadata>(url)

            const result = {
                table: params.path.split('/').pop(),
                title: metadata.title,
                variables: metadata.variables.map((v) => ({
                    code: v.code,
                    text: v.text,
                    elimination: v.elimination ?? false,
                    values: v.values.map((code, i) => ({
                        code,
                        text: v.valueTexts[i] ?? code,
                    })),
                })),
            }

            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 3 — nbstat_query
// ===========================================================================

type QueryInput = z.infer<typeof nbstatQuerySchema>

export const nbstatQueryTool = {
    name: 'nbstat_query',
    meta: {
        title: 'Query NBStat Data',
        description: `Fetch statistical data from an NBStat .px table with specific variable selections.

⚠️ PREREQUISITE: Always call nbstat_get_metadata first. Variable codes cannot be guessed.

\`path\`: Same slash-separated path used in nbstat_get_metadata (no ".px" suffix).

Building selections — each object targets one variable by its code:
- filter="item" + values=["code1","code2"] → select specific values by their code
- filter="all" + values=["*"] → include all values for this variable
- filter="top" + values=["5"] → latest 5 periods (recommended for time variables — stays current automatically)

Example for monthly balance of payments data:
[
  { "code": "Период", "filter": "top", "values": ["12"] },
  { "code": "Компонента", "filter": "all", "values": ["*"] }
]

Returns flattened rows with dimension labels as column names and a "value" field. Null values indicate missing or suppressed data points.`,
        inputSchema: nbstatQuerySchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: QueryInput) => {
        try {
            const url = buildTableUrl(params.lang, params.path)

            const body = {
                query: params.selections.map((s) => ({
                    code: s.code,
                    selection: { filter: s.filter, values: s.values },
                })),
                response: { format: 'json-stat2' },
            }

            const raw = await pxwebPost<Record<string, unknown>>(url, body)
            const dataset = ('dataset' in raw ? raw.dataset : raw) as JsonStat2Dataset
            const rows = flattenJsonStat2(dataset)

            const result = {
                table: params.path.split('/').pop(),
                total_rows: rows.length,
                rows,
            }

            return { content: [{ type: 'text' as const, text: applyCharacterLimit(JSON.stringify(result, null, 2)) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}
