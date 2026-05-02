import { openfinanceSearchTransactionsTool, openfinanceGetByPayerTool, openfinanceGetByRecipientTool, openfinanceGetByKeywordTool, openfinanceGetSpendingSummaryTool } from '@/mcp/tools/openfinance'
import { datagovmkSearchDatasetsTool, datagovmkGetDatasetTool, datagovmkQueryDatastoreTool, datagovmkListOrganizationsTool } from '@/mcp/tools/data-gov'
import { makstatBrowseTool, makstatGetMetadataTool, makstatQueryTool } from '@/mcp/tools/makstat'
import { budgetGetSummaryTool, budgetGetIncomeBreakdownTool, budgetGetExpenditureBreakdownTool, budgetGetInstitutionsTool, budgetGetMacroTrendsTool } from '@/mcp/tools/budget'
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
}
