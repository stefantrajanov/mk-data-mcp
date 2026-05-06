import { executeTool } from '@/app/actions/executeTool'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    let body: { tool?: string; params?: Record<string, unknown> } = {}
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const toolName = String(body.tool ?? '')
    const params = body.params ?? {}

    if (!toolName) {
        return NextResponse.json({ error: 'Missing tool name' }, { status: 400 })
    }

    const start = Date.now()
    const result = await executeTool(toolName, JSON.stringify(params))
    const elapsed = Date.now() - start

    return NextResponse.json({
        tool: toolName,
        params,
        source: 'mk-data-mcp',
        timestamp: new Date().toISOString(),
        elapsed_ms: elapsed,
        result,
    })
}
