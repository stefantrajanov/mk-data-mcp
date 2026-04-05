import { configureMcpServer } from '@/mcp'
import { createMcpHandler } from 'mcp-handler'

const handler = createMcpHandler(configureMcpServer, {}, { basePath: '/api/mcp', verboseLogs: true })

export const dynamic = 'force-dynamic'
export { handler as DELETE, handler as GET, handler as OPTIONS, handler as POST }
