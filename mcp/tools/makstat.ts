import { z } from 'zod'
import { makstatBrowseSchema, makstatGetMetadataSchema, makstatQuerySchema } from '@/mcp/schemas/makstat-schemas'

const API_BASE_URL = process.env.MAKSTAT_API_BASE_URL || ''
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
// URL helpers
// ---------------------------------------------------------------------------

function buildBrowseUrl(lang: string, path: string): string {
    const base = `${API_BASE_URL}/${lang}/MakStat`
    if (!path) return `${base}/`
    const encoded = path.split('/').map(encodeURIComponent).join('/')
    return `${base}/${encoded}/`
}

function buildTableUrl(lang: string, path: string): string {
    const base = `${API_BASE_URL}/${lang}/MakStat`
    const parts = path.split('/')
    const table = parts[parts.length - 1]
    const dirs = parts.slice(0, -1)
    const dirPath = dirs.length > 0 ? `/${dirs.map(encodeURIComponent).join('/')}` : ''
    // The browse API returns table IDs that already include .px — only append if missing
    const tableFile = table.endsWith('.px') ? table : `${table}.px`
    return `${base}${dirPath}/${encodeURIComponent(tableFile)}`
}

// ---------------------------------------------------------------------------
// JSON-stat2 flattening
// ---------------------------------------------------------------------------

function flattenJsonStat2(dataset: JsonStat2Dataset): Record<string, string | number | null>[] {
    const { id: dimIds, size: sizes, dimension, value: values } = dataset

    // stride[d] = product of sizes[d+1..last] — how many values one step in dim d skips
    const strides: number[] = new Array(dimIds.length)
    strides[dimIds.length - 1] = 1
    for (let d = dimIds.length - 2; d >= 0; d--) {
        strides[d] = strides[d + 1] * sizes[d + 1]
    }

    // Pre-sort each dimension's category keys by their assigned index
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
        if (error.message.includes('404')) return 'Error: Path not found. Verify the path using makstat_browse.'
        if (error.message.includes('400')) return 'Error: Invalid query. Check variable codes and values using makstat_get_metadata.'
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
// TOOL 1 — makstat_browse
// ===========================================================================

type BrowseInput = z.infer<typeof makstatBrowseSchema>

export const makstatBrowseTool = {
    name: 'makstat_browse',
    meta: {
        title: 'Browse MakStat Categories',
        description: `Navigate the MakStat (State Statistical Office) category hierarchy to find statistical tables.

MakStat data is organized in three levels:
1. Root → categories (e.g. "Labour Market", "Population", "GDP")
2. Category → subcategories (e.g. "Wages", "LFS Quarterly Data")
3. Subcategory → tables (type="table") — the queryable .px datasets

⚠️ IMPORTANT — Macedonian ID gotcha: Even on the English endpoint, the \`id\` field in results is the Macedonian identifier used in URL paths. ALWAYS use the \`id\` or \`path\` field from this tool's output in subsequent calls — never translate or guess the path.

Workflow:
1. Call with no path → list root categories
2. Call with a category \`id\` as path → list subcategories or tables
3. When you see type="table", pass its \`path\` to makstat_get_metadata

Returns each item with \`id\` (Macedonian, use in path), \`text\` (English label), \`type\` ("category" or "table"), and the full \`path\` ready to use in the next call.`,
        inputSchema: makstatBrowseSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: BrowseInput) => {
        try {
            const url = buildBrowseUrl(params.lang, params.path)
            const items = await pxwebGet<PxWebItem[]>(url)

            if (!Array.isArray(items) || items.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No items found at this path. Verify it with makstat_browse at a shorter path.' }] }
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
// TOOL 2 — makstat_get_metadata
// ===========================================================================

type GetMetadataInput = z.infer<typeof makstatGetMetadataSchema>

export const makstatGetMetadataTool = {
    name: 'makstat_get_metadata',
    meta: {
        title: 'Get MakStat Table Metadata',
        description: `Get the schema of a specific MakStat statistical table — its variables, their Macedonian Cyrillic codes, and all available values.

This is a mandatory step before calling makstat_query. Variable \`code\` fields (Macedonian Cyrillic, e.g. "Година", "Мерка") and their value codes are required to build a valid query.

\`path\`: Full slash-separated path to the table using the \`path\` field from makstat_browse. Example: "Пазар на труд/Плати/НаемниВработени". Do NOT include ".px" — the tool adds it internally.

Returns for each variable:
- \`code\`: Macedonian Cyrillic code → pass as "code" in makstat_query selections
- \`text\`: English description (e.g. "Year", "Measure")
- \`values\`: Available values with their codes and English labels
- \`elimination\`: If true, this variable can be omitted from the query (will be collapsed across all values)

Tip: Use filter="top" + values=["N"] on time variables (e.g. "Година") instead of selecting specific year codes. This always returns the latest N periods without hardcoding years.`,
        inputSchema: makstatGetMetadataSchema,
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
// TOOL 3 — makstat_query
// ===========================================================================

type QueryInput = z.infer<typeof makstatQuerySchema>

export const makstatQueryTool = {
    name: 'makstat_query',
    meta: {
        title: 'Query MakStat Data',
        description: `Fetch statistical data from a MakStat .px table with specific variable selections.

⚠️ PREREQUISITE: Always call makstat_get_metadata first. Variable codes are in Macedonian Cyrillic and cannot be guessed.

\`path\`: Same slash-separated path used in makstat_get_metadata (no ".px" suffix).

Building selections — each object targets one variable by its Cyrillic code:
- filter="item" + values=["code1","code2"] → select specific values by their code
- filter="all" + values=["*"] → include all values for this variable
- filter="top" + values=["5"] → latest 5 periods (recommended for time variables — stays current automatically)

Example for annual wage data by sector:
[
  { "code": "Година", "filter": "top", "values": ["5"] },
  { "code": "Мерка", "filter": "all", "values": ["*"] },
  { "code": "Сектори и оддели", "filter": "item", "values": ["1"] }
]

Returns flattened rows with dimension labels as column names and a "value" field. Null values indicate missing or suppressed data points.`,
        inputSchema: makstatQuerySchema,
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

            // PXWeb returns the dataset as the top-level object (class: "dataset").
            // Some deployments wrap it under a "dataset" key — handle both.
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
