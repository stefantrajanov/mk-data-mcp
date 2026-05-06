'use client'

import { useEffect, useState } from 'react'

const MCP_CONFIG = `{
  "mcpServers": {
    "mk-data-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mk-data-mcp.vercel.app/api/mcp"]
    }
  }
}`

export const MCP_URL = 'https://mk-data-mcp.vercel.app/api/mcp'
export const MCP_CONFIG_TEXT = MCP_CONFIG

export function useCopy(timeout = 1800) {
    const [copied, setCopied] = useState(false)
    useEffect(() => {
        if (!copied) return
        const id = setTimeout(() => setCopied(false), timeout)
        return () => clearTimeout(id)
    }, [copied, timeout])
    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
        } catch {}
    }
    return { copied, copy }
}
