# 📐 System Architecture & Data Flow

## 🌐 MCP Infrastructure

The system follows the **Remote MCP Server** paradigm, optimized for serverless environments (Next.js Edge Runtime or Vercel Functions).

### Request Pipeline

1. **User Input:** Natural language request sent via an AI client.
2. **Tool Invocation:** The client triggers a specific MCP tool (e.g., `get_makstat_demographics`).
3. **Parameter Validation:** The server confirms input parameters (e.g., valid years, municipalities).
4. **Upstream Request:** The server makes a standard HTTP `fetch` to the government API.
5. **Normalization:** The `NormalizationModule` processes raw results into a standard JSON schema.
6. **Response Formatting:** The final, cleaned data is returned to the client as a Markdown/JSON response.

## 📦 Class & Module Structure

- **`MCPServer`:** The central hub managing tool registration and SSE/HTTP transport.
- **`MCPTool` (Abstract):** Base class for all data-fetching tools.
    - `DataGovMKTool`: Specifically handles CKAN API requests to the Open Data Portal.
    - `MakStatTool`: Handles PC-Axis and statistical API calls.
- **`NormalizationModule`:** Core logic for mapping nested, disparate JSON/CSV structures into a flat, queryable format.
- **`ParameterValidator`:** Enforces strict typing and prevents invalid upstream requests.

## 📡 Deployment & Transport

- **Transport:** HTTP with Server-Sent Events (SSE).
- **Backend:** Next.js Route Handlers (`app/api/mcp/route.ts`).
- **State:** Stateless execution, relying on external APIs for live data.
- **Error Handling:** Wrapper for all `fetch` calls with graceful fallback messages.
