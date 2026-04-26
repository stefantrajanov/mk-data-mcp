import { z } from 'zod'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.OPEN_FINANCE_API_BASE_URL || ''
const CHARACTER_LIMIT = 25_000

// ---------------------------------------------------------------------------
// Enums & shared types
// ---------------------------------------------------------------------------

enum ResponseFormat {
    MARKDOWN = 'markdown',
    JSON = 'json',
}

/**
 * Shape of a single transaction row returned by the Open Finance MK API.
 */
interface Transaction {
    data_valuta: string // Transaction date (e.g. "15.03.2026")
    naziv_primac: string // Recipient name
    naziv_davac: string // Payer name
    smetka_davac: string // Payer account number
    ec_code_davac: string // Economic category code of the payer
    bu_program_davac: string // Budget program code of the payer
    iznos: string // Amount (as string, e.g. "12345.67")
}

/**
 * Raw response envelope from the DataTables API.
 */
interface DataTablesResponse {
    draw: number
    recordsTotal: number
    recordsFiltered: number
    data: Transaction[]
}

// ---------------------------------------------------------------------------
// Shared DataTables column definitions
//
// The Open Finance MK API is powered by DataTables and requires every request
// to include the column schema.  Without these the server returns empty data.
// ---------------------------------------------------------------------------

const COLUMNS = [
    { data: 'data_valuta', name: 'data_valuta', searchable: 'true', orderable: 'true' },
    { data: 'naziv_primac', name: 'naziv_primac', searchable: 'true', orderable: 'true' },
    { data: 'naziv_davac', name: 'naziv_davac', searchable: 'true', orderable: 'true' },
    { data: 'smetka_davac', name: 'smetka_davac', searchable: 'true', orderable: 'true' },
    { data: 'ec_code_davac', name: 'ec_code_davac', searchable: 'true', orderable: 'true' },
    { data: 'bu_program_davac', name: 'bu_program_davac', searchable: 'true', orderable: 'true' },
    { data: 'iznos', name: 'iznos', searchable: 'true', orderable: 'true' },
]

// ---------------------------------------------------------------------------
// Shared helper — build & execute a request to the Open Finance API
// ---------------------------------------------------------------------------

interface OpenFinanceParams {
    term?: string
    payer?: string
    recipient?: string
    payerEDB?: string
    recipientEDB?: string
    month_from: number
    year_from: number
    month_to: number
    year_to: number
    start: number
    length: number
}

async function openfinanceRequest(params: OpenFinanceParams): Promise<DataTablesResponse> {
    const url = new URL(API_BASE_URL)

    // Primary filter params
    if (params.term) url.searchParams.set('term', params.term)
    if (params.payer) url.searchParams.set('payer', params.payer)
    if (params.recipient) url.searchParams.set('recipient', params.recipient)
    if (params.payerEDB) url.searchParams.set('payerEDB', params.payerEDB)
    if (params.recipientEDB) url.searchParams.set('recipientEDB', params.recipientEDB)

    url.searchParams.set('month_from', String(params.month_from))
    url.searchParams.set('year_from', String(params.year_from))
    url.searchParams.set('month_to', String(params.month_to))
    url.searchParams.set('year_to', String(params.year_to))
    url.searchParams.set('action', 'global')

    // Pagination & DataTables metadata
    url.searchParams.set('start', String(params.start))
    url.searchParams.set('length', String(params.length))
    url.searchParams.set('draw', '1')
    url.searchParams.set('_', String(Date.now()))

    // Required DataTables column definitions
    COLUMNS.forEach((col, i) => {
        url.searchParams.set(`columns[${i}][data]`, col.data)
        url.searchParams.set(`columns[${i}][name]`, col.name)
        url.searchParams.set(`columns[${i}][searchable]`, col.searchable)
        url.searchParams.set(`columns[${i}][orderable]`, col.orderable)
    })

    const response = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<DataTablesResponse>
}

// ---------------------------------------------------------------------------
// Shared helpers — formatting & error handling
// ---------------------------------------------------------------------------

/**
 * Format a list of transactions as a Markdown table or JSON string.
 */
function formatTransactions(transactions: Transaction[], total: number, filtered: number, params: { start: number; length: number }, format: ResponseFormat): string {
    if (transactions.length === 0) {
        return 'No transactions found matching the specified criteria.'
    }

    const has_more = filtered > params.start + transactions.length
    const next_start = has_more ? params.start + transactions.length : undefined

    if (format === ResponseFormat.JSON) {
        const output = {
            total_records: total,
            filtered_records: filtered,
            returned: transactions.length,
            start: params.start,
            has_more,
            ...(next_start !== undefined ? { next_start } : {}),
            transactions,
        }
        return JSON.stringify(output, null, 2)
    }

    // Markdown format
    const lines: string[] = [
        `**Total records:** ${total}  |  **Filtered:** ${filtered}  |  **Showing:** ${transactions.length} (from index ${params.start})`,
        '',
        '| Date | Payer | Recipient | Amount | Budget Program | EC Code |',
        '|------|-------|-----------|--------|---------------|---------|',
        ...transactions.map((t) => `| ${t.data_valuta} | ${t.naziv_davac} | ${t.naziv_primac} | ${t.iznos} | ${t.bu_program_davac} | ${t.ec_code_davac} |`),
    ]

    if (has_more) {
        lines.push('')
        lines.push(`> ℹ️ More results available. Use \`start=${next_start}\` to fetch the next page.`)
    }

    return lines.join('\n')
}

/**
 * Convert an unknown caught error into an actionable, human-readable string.
 */
function handleError(error: unknown): string {
    if (error instanceof Error) {
        if (error.message.startsWith('HTTP 429')) {
            return 'Error: Rate limit exceeded. Wait a moment before retrying.'
        }
        if (error.message.startsWith('HTTP 5')) {
            return `Error: Open Finance API server error. Try again later. (${error.message})`
        }
        if (error.message.startsWith('HTTP 4')) {
            return `Error: Bad request to Open Finance API. Check your parameters. (${error.message})`
        }
        return `Error: ${error.message}`
    }
    return `Error: Unexpected error — ${String(error)}`
}

/**
 * Truncate output if it exceeds the character limit and append a note.
 */
function applyCharacterLimit(text: string): string {
    if (text.length <= CHARACTER_LIMIT) return text
    return text.slice(0, CHARACTER_LIMIT) + '\n\n> ⚠️ Response truncated due to size limit. Use `start` and `length` to paginate through results.'
}

// ---------------------------------------------------------------------------
// Shared Zod schemas (reused across tools)
// ---------------------------------------------------------------------------

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

const dateRangeSchema = {
    month_from: z.number().int().min(1).max(12).default(1).describe('Starting month of the date range (1–12). Defaults to January (1).'),
    year_from: z.number().int().min(2000).default(currentYear).describe(`Starting year of the date range (e.g. ${currentYear}). Defaults to the current year.`),
    month_to: z.number().int().min(1).max(12).default(currentMonth).describe('Ending month of the date range (1–12). Defaults to the current month.'),
    year_to: z.number().int().min(2000).default(currentYear).describe(`Ending year of the date range (e.g. ${currentYear}). Defaults to the current year.`),
}

const paginationSchema = {
    start: z.number().int().min(0).default(0).describe('Zero-based index of the first record to return. Use for pagination (e.g. 0, 50, 100).'),
    length: z.number().int().min(1).max(500).default(50).describe('Number of records to return per page (1–500). Defaults to 50.'),
}

const responseFormatSchema = z
    .nativeEnum(ResponseFormat)
    .default(ResponseFormat.MARKDOWN)
    .describe("Output format: 'markdown' for a human-readable table (default), 'json' for machine-readable structured data.")

// ===========================================================================
// TOOL 1 — openfinance_search_transactions
// ===========================================================================

const SearchTransactionsInputSchema = z
    .object({
        term: z
            .string()
            .optional()
            .describe(
                'General keyword to search across all fields. MUST be in Macedonian Cyrillic script ' +
                    '(e.g. "Образование" for education, "Здравство" for health). ' +
                    'Leaving this empty returns all transactions in the date range.'
            ),
        payer: z
            .string()
            .optional()
            .describe('Filter by the name of the paying entity (government body, municipality, ministry). ' + 'Partial matches are supported. Example: "Министерство" to find all ministries.'),
        recipient: z
            .string()
            .optional()
            .describe('Filter by the name of the receiving entity (company, contractor, NGO). ' + 'Partial matches are supported.'),
        payerEDB: z
            .string()
            .optional()
            .describe('Filter by the Tax Identification Number (EDB) of the payer. ' + 'Use this for exact entity matching when the name may be ambiguous.'),
        recipientEDB: z
            .string()
            .optional()
            .describe('Filter by the Tax Identification Number (EDB) of the recipient. ' + 'Use this for exact entity matching when the name may be ambiguous.'),
        ...dateRangeSchema,
        ...paginationSchema,
        response_format: responseFormatSchema,
    })
    .strict()

type SearchTransactionsInput = z.infer<typeof SearchTransactionsInputSchema>

export const openfinanceSearchTransactionsTool = {
    name: 'openfinance_search_transactions',
    meta: {
        title: 'Search Open Finance Transactions',
        description: `Search Macedonian government financial transactions on open.finance.gov.mk.

This is the general-purpose tool for querying the Open Finance MK database. It supports filtering by keyword, payer name, recipient name, payer EDB (tax ID), recipient EDB, and date range. All filters are optional and can be combined freely.

⚠️ IMPORTANT: The \`term\` parameter must be in **Macedonian Cyrillic script**. Latin characters will return empty results. Always translate user queries to Cyrillic before calling this tool.

⏱️ PERFORMANCE WARNING: Wide date ranges cause very slow API response times. Ranges spanning many years (e.g. year_from=2000, year_to=2026) can take minutes or time out entirely. Always start with a short range of 3 months to 1 year. Only expand the range if the user explicitly requests historical data and understands the wait.

Use this tool when:
- The user wants to combine multiple filters (e.g. a specific payer AND a keyword AND a date range)
- None of the more specific tools fits the query
- You want maximum flexibility

Returns a paginated list of transactions. Each record includes:
- \`data_valuta\`: Transaction date
- \`naziv_davac\`: Payer name
- \`naziv_primac\`: Recipient name  
- \`smetka_davac\`: Payer account number
- \`ec_code_davac\`: Economic category code
- \`bu_program_davac\`: Budget program code
- \`iznos\`: Transaction amount

Pagination: Use \`start\` and \`length\` to page through results. The response includes \`has_more\` and \`next_start\`.

Examples:
- "Show all education payments in 2026" → term="Образование", year_from=2026, year_to=2026
- "Find transactions between Ministry of Finance and Company X" → payer="Министерство за финансии", recipient="Company X"`,
        inputSchema: SearchTransactionsInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    },
    handler: async (params: SearchTransactionsInput) => {
        try {
            const data = await openfinanceRequest(params)
            const text = formatTransactions(data.data, data.recordsTotal, data.recordsFiltered, params, params.response_format)
            return { content: [{ type: 'text' as const, text: applyCharacterLimit(text) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 2 — openfinance_get_transactions_by_payer
// ===========================================================================

const GetByPayerInputSchema = z
    .object({
        payer: z
            .string()
            .min(1)
            .optional()
            .describe(
                'Name of the paying government entity (ministry, municipality, public enterprise, etc.). ' +
                    'Partial matches are supported. Example: "Општина Центар" or "Министерство за здравство". ' +
                    'At least one of `payer` or `payerEDB` must be provided.'
            ),
        payerEDB: z
            .string()
            .optional()
            .describe(
                'Tax Identification Number (EDB) of the paying entity. ' + "Use for exact matching when the payer's name is ambiguous. " + 'At least one of `payer` or `payerEDB` must be provided.'
            ),
        ...dateRangeSchema,
        ...paginationSchema,
        response_format: responseFormatSchema,
    })
    .strict()
    .refine((d) => d.payer || d.payerEDB, {
        message: 'At least one of `payer` or `payerEDB` must be provided.',
    })

type GetByPayerInput = z.infer<typeof GetByPayerInputSchema>

export const openfinanceGetByPayerTool = {
    name: 'openfinance_get_transactions_by_payer',
    meta: {
        title: 'Get Transactions by Payer',
        description: `Retrieve all government financial transactions made by a specific paying entity on open.finance.gov.mk.

Use this tool to answer questions like:
- "How much did the Ministry of Finance pay in Q1 2026?"
- "Who did the City of Skopje make payments to?"  
- "List all transactions from public enterprise X"

Requires at least one of \`payer\` (name, partial match supported) or \`payerEDB\` (exact tax ID).

⏱️ PERFORMANCE WARNING: Wide date ranges cause very slow API response times. Ranges spanning many years (e.g. year_from=2000, year_to=2026) can take minutes or time out entirely. Always start with a short range of 3 months to 1 year. Only expand the range if the user explicitly requests historical data and understands the wait.

Returns a paginated list of transactions ordered by the API. Each record includes the recipient name, amount, date, and budget/economic codes.

Pagination: Use \`start\` and \`length\` to page through results.

Examples:
- payer="Министерство за финансии", year_from=2026, year_to=2026 → all Finance Ministry payments in 2026
- payerEDB="4030000432106" → all payments from the entity with that exact tax ID`,
        inputSchema: GetByPayerInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    },
    handler: async (params: GetByPayerInput) => {
        try {
            const data = await openfinanceRequest({ ...params, term: undefined, recipient: undefined, recipientEDB: undefined })
            const text = formatTransactions(data.data, data.recordsTotal, data.recordsFiltered, params, params.response_format)
            return { content: [{ type: 'text' as const, text: applyCharacterLimit(text) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 3 — openfinance_get_transactions_by_recipient
// ===========================================================================

const GetByRecipientInputSchema = z
    .object({
        recipient: z
            .string()
            .min(1)
            .optional()
            .describe(
                'Name of the entity receiving the payment (company, contractor, NGO, individual). ' +
                    'Partial matches are supported. Example: "Работник" or "Градежни работи". ' +
                    'At least one of `recipient` or `recipientEDB` must be provided.'
            ),
        recipientEDB: z
            .string()
            .optional()
            .describe(
                'Tax Identification Number (EDB) of the receiving entity. ' +
                    "Use for exact matching when the recipient's name may be ambiguous. " +
                    'At least one of `recipient` or `recipientEDB` must be provided.'
            ),
        ...dateRangeSchema,
        ...paginationSchema,
        response_format: responseFormatSchema,
    })
    .strict()
    .refine((d) => d.recipient || d.recipientEDB, {
        message: 'At least one of `recipient` or `recipientEDB` must be provided.',
    })

type GetByRecipientInput = z.infer<typeof GetByRecipientInputSchema>

export const openfinanceGetByRecipientTool = {
    name: 'openfinance_get_transactions_by_recipient',
    meta: {
        title: 'Get Transactions by Recipient',
        description: `Retrieve all government financial transactions received by a specific entity on open.finance.gov.mk.

Use this tool to answer questions like:
- "What government contracts did Company X receive?"
- "How much money did NGO Y earn from the government in 2025?"
- "Which government bodies paid Vendor Z?"

Requires at least one of \`recipient\` (name, partial match supported) or \`recipientEDB\` (exact tax ID).

⏱️ PERFORMANCE WARNING: Wide date ranges cause very slow API response times. Ranges spanning many years (e.g. year_from=2000, year_to=2026) can take minutes or time out entirely. Always start with a short range of 3 months to 1 year. Only expand the range if the user explicitly requests historical data and understands the wait.

Returns a paginated list of transactions. Each record includes the payer name, amount, date, and budget/economic codes.

Pagination: Use \`start\` and \`length\` to page through results.

Examples:
- recipient="Работник АД", year_from=2025, year_to=2025 → all payments received by "Работник АД" in 2025
- recipientEDB="1234567" → all payments to the entity with that exact tax ID`,
        inputSchema: GetByRecipientInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    },
    handler: async (params: GetByRecipientInput) => {
        try {
            const data = await openfinanceRequest({ ...params, term: undefined, payer: undefined, payerEDB: undefined })
            const text = formatTransactions(data.data, data.recordsTotal, data.recordsFiltered, params, params.response_format)
            return { content: [{ type: 'text' as const, text: applyCharacterLimit(text) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 4 — openfinance_get_transactions_by_keyword
// ===========================================================================

const GetByKeywordInputSchema = z
    .object({
        keyword: z
            .string()
            .min(1)
            .describe(
                '⚠️ MUST be in Macedonian Cyrillic script. Keyword to search across all transaction fields. ' +
                    "Translate the user's intent to the correct Macedonian Cyrillic term before calling this tool. " +
                    'Common Macedonian keywords by sector: ' +
                    'Education → "Образование", ' +
                    'Health → "Здравство", ' +
                    'Defense → "Одбрана", ' +
                    'Infrastructure → "Инфраструктура", ' +
                    'Social protection → "Социјална заштита", ' +
                    'Agriculture → "Земјоделство", ' +
                    'Culture → "Култура", ' +
                    'Environment → "Животна средина".'
            ),
        ...dateRangeSchema,
        ...paginationSchema,
        response_format: responseFormatSchema,
    })
    .strict()

type GetByKeywordInput = z.infer<typeof GetByKeywordInputSchema>

export const openfinanceGetByKeywordTool = {
    name: 'openfinance_get_transactions_by_keyword',
    meta: {
        title: 'Get Transactions by Keyword',
        description: `Search Macedonian government financial transactions by a thematic keyword on open.finance.gov.mk.

Use this tool when the user asks thematic or sector-based questions about government spending, such as:
- "Show me all education spending in 2026"
- "Find health-related government payments"
- "What was spent on defense in Q1?"

⚠️ CRITICAL: The \`keyword\` parameter MUST be in **Macedonian Cyrillic script**. Latin input will return empty results. Always translate the user's topic to the appropriate Macedonian Cyrillic term.

⏱️ PERFORMANCE WARNING: Wide date ranges cause very slow API response times. Ranges spanning many years (e.g. year_from=2000, year_to=2026) can take minutes or time out entirely. Always start with a short range of 3 months to 1 year. Only expand the range if the user explicitly requests historical data and understands the wait.

Common keyword translations:
- Education → "Образование"
- Health → "Здравство"  
- Defense → "Одбрана"
- Infrastructure → "Инфраструктура"
- Social protection → "Социјална заштита"
- Agriculture → "Земјоделство"
- Culture → "Култура"
- Environment → "Животна средина"
- Macedonia / Македонија → "Македонија"

Returns a paginated list of matching transactions. Use \`start\` and \`length\` for pagination.`,
        inputSchema: GetByKeywordInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    },
    handler: async (params: GetByKeywordInput) => {
        try {
            const data = await openfinanceRequest({
                ...params,
                term: params.keyword,
                payer: undefined,
                recipient: undefined,
                payerEDB: undefined,
                recipientEDB: undefined,
            })
            const text = formatTransactions(data.data, data.recordsTotal, data.recordsFiltered, params, params.response_format)
            return { content: [{ type: 'text' as const, text: applyCharacterLimit(text) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 5 — openfinance_get_spending_summary
// ===========================================================================

const GetSpendingSummaryInputSchema = z
    .object({
        term: z
            .string()
            .optional()
            .describe('Optional keyword filter (Macedonian Cyrillic). Limits the summary to transactions matching this keyword. ' + 'Example: "Образование" to summarise only education spending.'),
        payer: z.string().optional().describe('Optional payer name filter. Limits the summary to transactions from this government entity.'),
        recipient: z.string().optional().describe('Optional recipient name filter. Limits the summary to transactions received by this entity.'),
        ...dateRangeSchema,
        length: z
            .number()
            .int()
            .min(1)
            .max(500)
            .default(500)
            .describe(
                'Number of transactions to fetch for aggregation (1–500, default 500). ' +
                    'The sum is computed over the returned records. ' +
                    'If the dataset has more transactions than this limit, the summary will note that results are partial.'
            ),
    })
    .strict()

type GetSpendingSummaryInput = z.infer<typeof GetSpendingSummaryInputSchema>

export const openfinanceGetSpendingSummaryTool = {
    name: 'openfinance_get_spending_summary',
    meta: {
        title: 'Get Spending Summary',
        description: `Compute an aggregated spending summary for Macedonian government transactions on open.finance.gov.mk.

Use this tool when the user wants a high-level financial overview, such as:
- "How much was spent in total in March 2026?"
- "What is the total education budget paid out so far this year?"
- "Summarise all payments made by the Ministry of Finance in 2025"

This tool fetches up to \`length\` transactions (default 500, max 500) and computes:
- Total number of matched transactions in the database
- Number of transactions included in this summary
- Sum of all transaction amounts (\`iznos\`) in the fetched page
- Whether more transactions exist beyond the fetched page

⏱️ PERFORMANCE WARNING: Wide date ranges cause very slow API response times. Ranges spanning many years (e.g. year_from=2000, year_to=2026) can take minutes or time out entirely. Always start with a short range of 3 months to 1 year. Only expand the range if the user explicitly requests historical data and understands the wait.

⚠️ NOTE: The Open Finance API has no native aggregation endpoint. The sum is computed client-side over the fetched page. If \`has_more\` is true, the total sum is partial — call the tool again with \`length=500\` and increasing \`start\` to accumulate the full total.

⚠️ IMPORTANT: If using \`term\`, it must be in **Macedonian Cyrillic script**.

Returns:
- \`total_in_db\`: Total matching records in the database
- \`records_in_summary\`: Number of records summed
- \`total_amount\`: Sum of amounts for the fetched records
- \`has_more\`: Whether more records exist beyond this page
- \`currency_note\`: "MKD (Macedonian Denar)"`,
        inputSchema: GetSpendingSummaryInputSchema,
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    },
    handler: async (params: GetSpendingSummaryInput) => {
        try {
            const data = await openfinanceRequest({
                ...params,
                payerEDB: undefined,
                recipientEDB: undefined,
                start: 0,
            })

            const transactions = data.data
            const totalInDb = data.recordsFiltered
            const has_more = totalInDb > transactions.length

            // Sum the `iznos` field — it may be a formatted string (e.g. "1.234,56"), normalise it
            const totalAmount = transactions.reduce((sum, t) => {
                const raw = t.iznos
                    .replace(/\./g, '') // remove thousands separator (.)
                    .replace(',', '.') // convert decimal comma to dot
                const num = parseFloat(raw)
                return sum + (isNaN(num) ? 0 : num)
            }, 0)

            const summary = {
                total_in_db: totalInDb,
                records_in_summary: transactions.length,
                total_amount: Math.round(totalAmount * 100) / 100,
                has_more,
                currency_note: 'MKD (Macedonian Denar)',
                ...(has_more
                    ? {
                          partial_warning:
                              `Only ${transactions.length} of ${totalInDb} records were summed. ` +
                              `The total amount is partial. To get the full total, call this tool iteratively with start=0, 500, 1000, ... and sum the results.`,
                      }
                    : {}),
                filters_applied: {
                    ...(params.term ? { term: params.term } : {}),
                    ...(params.payer ? { payer: params.payer } : {}),
                    ...(params.recipient ? { recipient: params.recipient } : {}),
                    date_range: `${params.month_from}/${params.year_from} – ${params.month_to}/${params.year_to}`,
                },
            }

            return {
                content: [{ type: 'text' as const, text: JSON.stringify(summary, null, 2) }],
            }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}
