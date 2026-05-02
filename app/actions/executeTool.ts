'use server'

import { openfinanceSearchTransactionsTool, openfinanceGetByPayerTool, openfinanceGetByRecipientTool, openfinanceGetByKeywordTool, openfinanceGetSpendingSummaryTool } from '@/mcp/tools/openfinance'
import { datagovmkSearchDatasetsTool, datagovmkGetDatasetTool, datagovmkQueryDatastoreTool, datagovmkListOrganizationsTool } from '@/mcp/tools/data-gov'
import { makstatBrowseTool, makstatGetMetadataTool, makstatQueryTool } from '@/mcp/tools/makstat'
import { budgetGetSummaryTool, budgetGetIncomeBreakdownTool, budgetGetExpenditureBreakdownTool, budgetGetInstitutionsTool, budgetGetMacroTrendsTool } from '@/mcp/tools/budget'

export async function executeTool(toolName: string, argsStr: string) {
    try {
        let args: unknown = {}
        if (argsStr) {
            args = JSON.parse(argsStr)

            // Fixup for playground enums that should be booleans
            if (toolName === datagovmkListOrganizationsTool.name && typeof args === 'object' && args !== null) {
                const a = args as Record<string, unknown>
                if (a.all_fields === 'true') a.all_fields = true
                if (a.all_fields === 'false') a.all_fields = false
                if (a.include_dataset_count === 'true') a.include_dataset_count = true
                if (a.include_dataset_count === 'false') a.include_dataset_count = false
            }

            // Fixup for playground: selections is submitted as a JSON string, parse it into an array
            if (toolName === makstatQueryTool.name && typeof args === 'object' && args !== null) {
                const a = args as Record<string, unknown>
                if (typeof a.selections === 'string') {
                    a.selections = JSON.parse(a.selections)
                }
            }
        }

        let result
        switch (toolName) {
            case openfinanceSearchTransactionsTool.name: {
                const validArgs = openfinanceSearchTransactionsTool.meta.inputSchema.parse(args)
                result = await openfinanceSearchTransactionsTool.handler(validArgs)
                break
            }
            case openfinanceGetByPayerTool.name: {
                const validArgs = openfinanceGetByPayerTool.meta.inputSchema.parse(args)
                result = await openfinanceGetByPayerTool.handler(validArgs)
                break
            }
            case openfinanceGetByRecipientTool.name: {
                const validArgs = openfinanceGetByRecipientTool.meta.inputSchema.parse(args)
                result = await openfinanceGetByRecipientTool.handler(validArgs)
                break
            }
            case openfinanceGetByKeywordTool.name: {
                const validArgs = openfinanceGetByKeywordTool.meta.inputSchema.parse(args)
                result = await openfinanceGetByKeywordTool.handler(validArgs)
                break
            }
            case openfinanceGetSpendingSummaryTool.name: {
                const validArgs = openfinanceGetSpendingSummaryTool.meta.inputSchema.parse(args)
                result = await openfinanceGetSpendingSummaryTool.handler(validArgs)
                break
            }
            case datagovmkSearchDatasetsTool.name: {
                const validArgs = datagovmkSearchDatasetsTool.meta.inputSchema.parse(args)
                result = await datagovmkSearchDatasetsTool.handler(validArgs)
                break
            }
            case datagovmkGetDatasetTool.name: {
                const validArgs = datagovmkGetDatasetTool.meta.inputSchema.parse(args)
                result = await datagovmkGetDatasetTool.handler(validArgs)
                break
            }
            case datagovmkQueryDatastoreTool.name: {
                const validArgs = datagovmkQueryDatastoreTool.meta.inputSchema.parse(args)
                result = await datagovmkQueryDatastoreTool.handler(validArgs)
                break
            }
            case datagovmkListOrganizationsTool.name: {
                const validArgs = datagovmkListOrganizationsTool.meta.inputSchema.parse(args)
                result = await datagovmkListOrganizationsTool.handler(validArgs)
                break
            }
            case makstatBrowseTool.name: {
                const validArgs = makstatBrowseTool.meta.inputSchema.parse(args)
                result = await makstatBrowseTool.handler(validArgs)
                break
            }
            case makstatGetMetadataTool.name: {
                const validArgs = makstatGetMetadataTool.meta.inputSchema.parse(args)
                result = await makstatGetMetadataTool.handler(validArgs)
                break
            }
            case makstatQueryTool.name: {
                const validArgs = makstatQueryTool.meta.inputSchema.parse(args)
                result = await makstatQueryTool.handler(validArgs)
                break
            }
            case budgetGetSummaryTool.name: {
                const validArgs = budgetGetSummaryTool.meta.inputSchema.parse(args)
                result = await budgetGetSummaryTool.handler(validArgs)
                break
            }
            case budgetGetIncomeBreakdownTool.name: {
                const validArgs = budgetGetIncomeBreakdownTool.meta.inputSchema.parse(args)
                result = await budgetGetIncomeBreakdownTool.handler(validArgs)
                break
            }
            case budgetGetExpenditureBreakdownTool.name: {
                const validArgs = budgetGetExpenditureBreakdownTool.meta.inputSchema.parse(args)
                result = await budgetGetExpenditureBreakdownTool.handler(validArgs)
                break
            }
            case budgetGetInstitutionsTool.name: {
                const validArgs = budgetGetInstitutionsTool.meta.inputSchema.parse(args)
                result = await budgetGetInstitutionsTool.handler(validArgs)
                break
            }
            case budgetGetMacroTrendsTool.name: {
                const validArgs = budgetGetMacroTrendsTool.meta.inputSchema.parse(args)
                result = await budgetGetMacroTrendsTool.handler(validArgs)
                break
            }
            default:
                throw new Error(`Tool ${toolName} not found or unsupported via playgorund.`)
        }

        return { success: true, result }
    } catch (e: unknown) {
        // If it's a Zod error, format it nicely
        if (typeof e === 'object' && e !== null && 'errors' in e && Array.isArray((e as Record<string, unknown>).errors)) {
            const zErr = e as { errors: Array<{ path: string[]; message: string }> }
            const msgs = zErr.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ')
            return { success: false, error: `Validation Error: ${msgs}` }
        }
        return { success: false, error: e instanceof Error ? e.message : String(e) }
    }
}
