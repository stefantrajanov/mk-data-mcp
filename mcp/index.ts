import { multiplyTool } from '@/mcp/tools/multiply'
import { openfinanceSearchTransactionsTool, openfinanceGetByPayerTool, openfinanceGetByRecipientTool, openfinanceGetByKeywordTool, openfinanceGetSpendingSummaryTool } from '@/mcp/tools/openfinance'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export function configureMcpServer(server: McpServer) {
    server.registerTool(multiplyTool.name, multiplyTool.meta, multiplyTool.handler)

    // Open Finance MK tools
    server.registerTool(openfinanceSearchTransactionsTool.name, openfinanceSearchTransactionsTool.meta, openfinanceSearchTransactionsTool.handler)
    server.registerTool(openfinanceGetByPayerTool.name, openfinanceGetByPayerTool.meta, openfinanceGetByPayerTool.handler)
    server.registerTool(openfinanceGetByRecipientTool.name, openfinanceGetByRecipientTool.meta, openfinanceGetByRecipientTool.handler)
    server.registerTool(openfinanceGetByKeywordTool.name, openfinanceGetByKeywordTool.meta, openfinanceGetByKeywordTool.handler)
    server.registerTool(openfinanceGetSpendingSummaryTool.name, openfinanceGetSpendingSummaryTool.meta, openfinanceGetSpendingSummaryTool.handler)
}
