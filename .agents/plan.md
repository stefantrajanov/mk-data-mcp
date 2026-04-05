# 🏗️ Project Context: Macedonian Government Data MCP Server

## 🎯 The Mission

You are acting as an expert TypeScript and Next.js developer specializing in the Model Context Protocol (MCP).
We are building a **remotely hosted MCP Server** that acts as a universal, standardized data wrapper for public Macedonian government institutional APIs.

The goal is to expose this public data as standardized MCP Tools so that any AI agent, LLM, or client (Claude Desktop, Cursor, LangChain, etc.) can easily query and consume it.

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict mode)
- **SDK:** `@modelcontextprotocol/sdk`
- **Deployment:** Vercel (Serverless)
- **Transport Layer:** HTTP / Server-Sent Events (SSE) (We are **NOT** using local `stdio`)
- **Data Retrieval:** Standard HTTP `fetch` requests to existing government APIs (No headless browsers or heavy scraping).

## 📐 Architectural Rules & Constraints

When writing code for this project, you must strictly adhere to the following guidelines:

1. **Remote Transport:** Initialize the `McpServer` using the HTTP/SSE transport paradigm. All MCP traffic will be routed through Next.js Route Handlers (e.g., `app/api/mcp/route.ts`).
2. **Strict Typing:** All data returned from the government APIs must be mapped to strongly typed TypeScript interfaces before being returned to the LLM.
3. **Robust Tool Schemas:** When defining MCP Tools, provide highly descriptive, strict JSON Schemas for the input parameters so the connecting LLM knows exactly how to format its requests (e.g., expecting a 13-digit Macedonian ID number).
4. **Stateless Execution:** Ensure the tool executions are stateless and optimized for Vercel's serverless environment.
5. **Error Handling:** Government APIs can be unstable. Wrap all external `fetch` calls in `try/catch` blocks and return graceful, descriptive error messages to the LLM if an upstream API fails or times out.

## Docs

Always REFERNCE the docs when developing, and always use the latest version of the SDK.

- [MCP Docs](https://modelcontextprotocol.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
