import { z } from 'zod'

enum ExpBreakdown {
    ECONOMIC = 'economic',
    FUNCTIONAL = 'functional',
}

const yearSchema = z.number().int().min(2017).max(2025).describe('Budget year (2017–2025).')

export const budgetGetSummarySchema = z.object({ year: yearSchema }).strict()

export const budgetGetIncomeBreakdownSchema = z.object({ year: yearSchema }).strict()

export const budgetGetExpenditureBreakdownSchema = z
    .object({
        year: yearSchema,
        breakdown: z
            .nativeEnum(ExpBreakdown)
            .describe(
                '"economic" = by spending type (salaries, transfers, capital expenditure, goods & services, interest); ' +
                    '"functional" = by sector (health, education, defense, social protection, etc.).'
            ),
    })
    .strict()

export const budgetGetInstitutionsSchema = z.object({ year: yearSchema }).strict()

export const budgetGetMacroTrendsSchema = z.object({}).strict()
