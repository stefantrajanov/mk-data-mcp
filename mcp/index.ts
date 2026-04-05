import { multiplyTool } from '@/mcp/tools/multiply'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

export function configureMcpServer(server: McpServer) {
    server.registerTool(multiplyTool.name, multiplyTool.meta, multiplyTool.handler)
}
