'use server'

import { openfinanceSearchTransactionsTool, openfinanceGetByPayerTool, openfinanceGetByRecipientTool, openfinanceGetByKeywordTool, openfinanceGetSpendingSummaryTool } from '@/mcp/tools/openfinance'
import { datagovmkSearchDatasetsTool, datagovmkGetDatasetTool, datagovmkQueryDatastoreTool, datagovmkListOrganizationsTool } from '@/mcp/tools/data-gov'
import { makstatBrowseTool, makstatGetMetadataTool, makstatQueryTool } from '@/mcp/tools/makstat'
import { budgetGetSummaryTool, budgetGetIncomeBreakdownTool, budgetGetExpenditureBreakdownTool, budgetGetInstitutionsTool, budgetGetMacroTrendsTool } from '@/mcp/tools/budget'
import { uslugiBrowseTool, uslugiSearchServicesTool, uslugiGetServiceTool, uslugiListInstitutionsTool } from '@/mcp/tools/uslugi'
import { nbstatBrowseTool, nbstatGetMetadataTool, nbstatQueryTool } from '@/mcp/tools/nbstat'
import { getAirQualityStationsTool, getStationMeasurementsTool, calculateCurrentAqiTool, findNearestStationTool } from '@/mcp/tools/air-moepp'

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
            if ((toolName === makstatQueryTool.name || toolName === nbstatQueryTool.name) && typeof args === 'object' && args !== null) {
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
            case uslugiBrowseTool.name: {
                const validArgs = uslugiBrowseTool.meta.inputSchema.parse(args)
                result = await uslugiBrowseTool.handler(validArgs)
                break
            }
            case uslugiSearchServicesTool.name: {
                const validArgs = uslugiSearchServicesTool.meta.inputSchema.parse(args)
                result = await uslugiSearchServicesTool.handler(validArgs)
                break
            }
            case uslugiGetServiceTool.name: {
                const validArgs = uslugiGetServiceTool.meta.inputSchema.parse(args)
                result = await uslugiGetServiceTool.handler(validArgs)
                break
            }
            case uslugiListInstitutionsTool.name: {
                const validArgs = uslugiListInstitutionsTool.meta.inputSchema.parse(args)
                result = await uslugiListInstitutionsTool.handler(validArgs)
                break
            }
            case nbstatBrowseTool.name: {
                const validArgs = nbstatBrowseTool.meta.inputSchema.parse(args)
                result = await nbstatBrowseTool.handler(validArgs)
                break
            }
            case nbstatGetMetadataTool.name: {
                const validArgs = nbstatGetMetadataTool.meta.inputSchema.parse(args)
                result = await nbstatGetMetadataTool.handler(validArgs)
                break
            }
            case nbstatQueryTool.name: {
                const validArgs = nbstatQueryTool.meta.inputSchema.parse(args)
                result = await nbstatQueryTool.handler(validArgs)
                break
            }
            case getAirQualityStationsTool.name: {
                const validArgs = getAirQualityStationsTool.meta.inputSchema.parse(args)
                result = await getAirQualityStationsTool.handler()
                break
            }
            case getStationMeasurementsTool.name: {
                const validArgs = getStationMeasurementsTool.meta.inputSchema.parse(args)
                result = await getStationMeasurementsTool.handler(validArgs)
                break
            }
            case calculateCurrentAqiTool.name: {
                const validArgs = calculateCurrentAqiTool.meta.inputSchema.parse(args)
                result = await calculateCurrentAqiTool.handler(validArgs)
                break
            }
            case findNearestStationTool.name: {
                const validArgs = findNearestStationTool.meta.inputSchema.parse(args)
                result = await findNearestStationTool.handler(validArgs)
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
