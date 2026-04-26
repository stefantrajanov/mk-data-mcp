import { openfinanceSearchTransactionsTool, openfinanceGetByPayerTool, openfinanceGetByRecipientTool, openfinanceGetByKeywordTool, openfinanceGetSpendingSummaryTool } from '@/mcp/tools/openfinance'
import { datagovmkSearchDatasetsTool, datagovmkGetDatasetTool, datagovmkQueryDatastoreTool, datagovmkListOrganizationsTool } from '@/mcp/tools/data-gov'
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
}
