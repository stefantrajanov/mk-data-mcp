'use server'

import { multiplyTool } from '@/mcp/tools/multiply'
import { openfinanceSearchTransactionsTool, openfinanceGetByPayerTool, openfinanceGetByRecipientTool, openfinanceGetByKeywordTool, openfinanceGetSpendingSummaryTool } from '@/mcp/tools/openfinance'

export async function executeTool(toolName: string, argsStr: string) {
    try {
        let args: unknown = {}
        if (argsStr) {
            args = JSON.parse(argsStr)
        }

        let result
        switch (toolName) {
            case multiplyTool.name: {
                const validArgs = multiplyTool.meta.inputSchema.parse(args)
                result = await multiplyTool.handler(validArgs)
                break
            }
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
