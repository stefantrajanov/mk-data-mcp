import { openfinanceSearchTransactionsTool, openfinanceGetByPayerTool, openfinanceGetByRecipientTool, openfinanceGetByKeywordTool, openfinanceGetSpendingSummaryTool } from '@/mcp/tools/openfinance'
import { datagovmkSearchDatasetsTool, datagovmkGetDatasetTool, datagovmkQueryDatastoreTool, datagovmkListOrganizationsTool } from '@/mcp/tools/data-gov'
import { makstatBrowseTool, makstatGetMetadataTool, makstatQueryTool } from '@/mcp/tools/makstat'
import { budgetGetSummaryTool, budgetGetIncomeBreakdownTool, budgetGetExpenditureBreakdownTool, budgetGetInstitutionsTool, budgetGetMacroTrendsTool } from '@/mcp/tools/budget'
import { uslugiBrowseTool, uslugiSearchServicesTool, uslugiGetServiceTool, uslugiListInstitutionsTool } from '@/mcp/tools/uslugi'
import { nbstatBrowseTool, nbstatGetMetadataTool, nbstatQueryTool } from '@/mcp/tools/nbstat'
import { getAirQualityStationsTool, getStationMeasurementsTool, calculateCurrentAqiTool, findNearestStationTool } from '@/mcp/tools/air-moepp'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export function configureMcpServer(server: McpServer) {
    // Open Finance MK tools
    server.registerTool(openfinanceSearchTransactionsTool.name, openfinanceSearchTransactionsTool.meta, openfinanceSearchTransactionsTool.handler)
    server.registerTool(openfinanceGetByPayerTool.name, openfinanceGetByPayerTool.meta, openfinanceGetByPayerTool.handler)
    server.registerTool(openfinanceGetByRecipientTool.name, openfinanceGetByRecipientTool.meta, openfinanceGetByRecipientTool.handler)
    server.registerTool(openfinanceGetByKeywordTool.name, openfinanceGetByKeywordTool.meta, openfinanceGetByKeywordTool.handler)
    server.registerTool(openfinanceGetSpendingSummaryTool.name, openfinanceGetSpendingSummaryTool.meta, openfinanceGetSpendingSummaryTool.handler)

    // Data.gov.mk tools
    server.registerTool(datagovmkSearchDatasetsTool.name, datagovmkSearchDatasetsTool.meta, datagovmkSearchDatasetsTool.handler)
    server.registerTool(datagovmkGetDatasetTool.name, datagovmkGetDatasetTool.meta, datagovmkGetDatasetTool.handler)
    server.registerTool(datagovmkQueryDatastoreTool.name, datagovmkQueryDatastoreTool.meta, datagovmkQueryDatastoreTool.handler)
    server.registerTool(datagovmkListOrganizationsTool.name, datagovmkListOrganizationsTool.meta, datagovmkListOrganizationsTool.handler)

    // MakStat tools
    server.registerTool(makstatBrowseTool.name, makstatBrowseTool.meta, makstatBrowseTool.handler)
    server.registerTool(makstatGetMetadataTool.name, makstatGetMetadataTool.meta, makstatGetMetadataTool.handler)
    server.registerTool(makstatQueryTool.name, makstatQueryTool.meta, makstatQueryTool.handler)

    // Budget Finance MK tools
    server.registerTool(budgetGetSummaryTool.name, budgetGetSummaryTool.meta, budgetGetSummaryTool.handler)
    server.registerTool(budgetGetIncomeBreakdownTool.name, budgetGetIncomeBreakdownTool.meta, budgetGetIncomeBreakdownTool.handler)
    server.registerTool(budgetGetExpenditureBreakdownTool.name, budgetGetExpenditureBreakdownTool.meta, budgetGetExpenditureBreakdownTool.handler)
    server.registerTool(budgetGetInstitutionsTool.name, budgetGetInstitutionsTool.meta, budgetGetInstitutionsTool.handler)
    server.registerTool(budgetGetMacroTrendsTool.name, budgetGetMacroTrendsTool.meta, budgetGetMacroTrendsTool.handler)

    // uslugi.gov.mk tools
    server.registerTool(uslugiBrowseTool.name, uslugiBrowseTool.meta, uslugiBrowseTool.handler)
    server.registerTool(uslugiSearchServicesTool.name, uslugiSearchServicesTool.meta, uslugiSearchServicesTool.handler)
    server.registerTool(uslugiGetServiceTool.name, uslugiGetServiceTool.meta, uslugiGetServiceTool.handler)
    server.registerTool(uslugiListInstitutionsTool.name, uslugiListInstitutionsTool.meta, uslugiListInstitutionsTool.handler)

    // NBStat (National Bank of North Macedonia) tools
    server.registerTool(nbstatBrowseTool.name, nbstatBrowseTool.meta, nbstatBrowseTool.handler)
    server.registerTool(nbstatGetMetadataTool.name, nbstatGetMetadataTool.meta, nbstatGetMetadataTool.handler)
    server.registerTool(nbstatQueryTool.name, nbstatQueryTool.meta, nbstatQueryTool.handler)

    // Air Quality (MOEPP) tools
    server.registerTool(getAirQualityStationsTool.name, getAirQualityStationsTool.meta, getAirQualityStationsTool.handler)
    server.registerTool(getStationMeasurementsTool.name, getStationMeasurementsTool.meta, getStationMeasurementsTool.handler)
    server.registerTool(calculateCurrentAqiTool.name, calculateCurrentAqiTool.meta, calculateCurrentAqiTool.handler)
    server.registerTool(findNearestStationTool.name, findNearestStationTool.meta, findNearestStationTool.handler)
}
