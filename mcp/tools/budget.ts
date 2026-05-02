import { z } from 'zod'
import { budgetGetSummarySchema, budgetGetIncomeBreakdownSchema, budgetGetExpenditureBreakdownSchema, budgetGetInstitutionsSchema, budgetGetMacroTrendsSchema } from '@/mcp/schemas/budget-schemas'

const API_BASE_URL = process.env.BUDGET_API_BASE_URL || ''
const CHARACTER_LIMIT = 25_000

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function budgetRequest(path: string): Promise<unknown> {
    const url = `${API_BASE_URL}/${path}`
    const response = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
    return response.json()
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function handleError(error: unknown): string {
    if (error instanceof Error) return `Error: ${error.message}`
    return `Error: Unexpected error — ${String(error)}`
}

function applyCharacterLimit(text: string): string {
    if (text.length <= CHARACTER_LIMIT) return text
    return text.slice(0, CHARACTER_LIMIT) + '\n\n> ⚠️ Response truncated due to size limit.'
}

// ===========================================================================
// TOOL 1 — budget_get_summary
// ===========================================================================

type GetSummaryInput = z.infer<typeof budgetGetSummarySchema>

export const budgetGetSummaryTool = {
    name: 'budget_get_summary',
    meta: {
        title: 'Get Budget Summary',
        description: `Get the top-level annual budget summary for the Republic of North Macedonia.

Returns total income, total expenditure, deficit/surplus, and the major income categories (tax revenue, social contributions, capital income, non-tax revenue, foreign donations) for a given year.

Use this as the first call when analyzing a specific budget year — it gives the high-level picture before drilling into breakdowns with budget_get_income_breakdown or budget_get_expenditure_breakdown.

Monetary values are in billions of denars. Text labels are in Macedonian Cyrillic.

Available years: 2017–2025.`,
        inputSchema: budgetGetSummarySchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: GetSummaryInput) => {
        try {
            const result = await budgetRequest(`general/${params.year}`)
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 2 — budget_get_income_breakdown
// ===========================================================================

type GetIncomeBreakdownInput = z.infer<typeof budgetGetIncomeBreakdownSchema>

export const budgetGetIncomeBreakdownTool = {
    name: 'budget_get_income_breakdown',
    meta: {
        title: 'Get Income Breakdown',
        description: `Get the detailed breakdown of tax income and social contributions by category for a given budget year.

Returns each income category with its amount and percentage share of total income — useful for understanding the composition of government revenue (e.g. which taxes contribute the most).

Use this after budget_get_summary when you need category-level detail on the income side.

Monetary values in millions of denars. Text labels are in Macedonian Cyrillic.

Available years: 2017–2025.`,
        inputSchema: budgetGetIncomeBreakdownSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: GetIncomeBreakdownInput) => {
        try {
            const result = await budgetRequest(`cash-flow/tax-income/${params.year}`)
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 3 — budget_get_expenditure_breakdown
// ===========================================================================

type GetExpenditureBreakdownInput = z.infer<typeof budgetGetExpenditureBreakdownSchema>

export const budgetGetExpenditureBreakdownTool = {
    name: 'budget_get_expenditure_breakdown',
    meta: {
        title: 'Get Expenditure Breakdown',
        description: `Get the expenditure breakdown for a given budget year from two different angles, selected via the \`breakdown\` parameter.

breakdown="economic" → spending by economic type:
- Salaries and allowances
- Social transfers
- Capital expenditures
- Goods and services
- Interest payments
Each category includes amount and percentage of total expenditure.

breakdown="functional" → spending by government sector:
- Health, Education, Defense, Social protection, etc.
Each sector includes both total expenditure and capital expenditure amounts.

Use "economic" to understand what kind of spending dominates the budget.
Use "functional" to understand which policy areas receive the most funding.
Call with both values for a complete picture of how money was spent.

Monetary values in millions of denars. Text labels are in Macedonian Cyrillic.

Available years: 2017–2025.`,
        inputSchema: budgetGetExpenditureBreakdownSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: GetExpenditureBreakdownInput) => {
        try {
            const endpoint = params.breakdown === 'economic' ? `cash-flow/total-expenditure/${params.year}` : `functional-area/${params.year}`
            const result = await budgetRequest(endpoint)
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 4 — budget_get_institutions
// ===========================================================================

type GetInstitutionsInput = z.infer<typeof budgetGetInstitutionsSchema>

export const budgetGetInstitutionsTool = {
    name: 'budget_get_institutions',
    meta: {
        title: 'Get Budget by Institution',
        description: `Get the budget allocation and spending realization per government institution for a given year.

Returns each ministry, agency, and commission with:
- Allocated budget amount
- Realized (actual) spending
- Utilization percentage

Use this to identify which institutions are over- or under-spending their budgets, or to find the allocation for a specific ministry.

Monetary values in millions of denars. Institution names are in Macedonian Cyrillic.

Available years: 2017–2025.`,
        inputSchema: budgetGetInstitutionsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: GetInstitutionsInput) => {
        try {
            const result = await budgetRequest(`budget-users/${params.year}`)
            return { content: [{ type: 'text' as const, text: applyCharacterLimit(JSON.stringify(result, null, 2)) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 5 — budget_get_macro_trends
// ===========================================================================

type GetMacroTrendsInput = z.infer<typeof budgetGetMacroTrendsSchema>

export const budgetGetMacroTrendsTool = {
    name: 'budget_get_macro_trends',
    meta: {
        title: 'Get Macroeconomic Trends',
        description: `Get the full historical macroeconomic time series for North Macedonia, from 2008 to the most recent available year.

No parameters needed — always returns the complete historical dataset.

Includes per year:
- GDP growth rate (%)
- Deficit as % of GDP
- Public debt
- Unemployment rate (%)
- Inflation rate (%)
- Total budget incomes
- Total budget expenditures

Use this for trend analysis, year-over-year comparisons, or any question about long-term economic indicators such as "how has unemployment changed since 2010" or "what was the deficit trend during the pandemic years".`,
        inputSchema: budgetGetMacroTrendsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (_params: GetMacroTrendsInput) => {
        try {
            // The API always returns the full historical series regardless of the year segment
            const result = await budgetRequest(`macroeconomic-indicator/chart-data/2024`)
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}
