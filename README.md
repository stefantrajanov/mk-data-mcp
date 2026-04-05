# 🇲🇰 mk-data-mcp

### **Bridging the Gap Between AI Agents and Macedonian Public Data**

The **Macedonian Public Data MCP Server** is a standardized data wrapper for official Macedonian government institutional APIs. It allows AI models (like Claude, GPT, and Gemini) to move beyond their training data by providing **real-time, authoritative access** to public records through the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/).

---

## 🎯 Vision & Mission

The goal of this project is to provide a universal, standardized interface for public Macedonian data. By exposing these datasets as MCP Tools, any AI agent or client can easily query and consume them, empowering:

- **Data Scientists:** To access clean, structured datasets for analysis and visualization.
- **Journalists & Students:** To fact-check and analyze trends in Macedonia.
- **Citizens:** To easily access public information without navigating complex government portals.
- **Public Administration:** To support evidence-based decision-making.

---

## 🚀 Core Functionalities

1.  **Natural Language Querying:** Users can ask questions like _"What was the unemployment rate in the last 10 years?"_ and the AI will use the correct tool to fetch the answer.
2.  **Dataset Discovery:** Search and browse datasets from multiple official sources.
3.  **Data Normalization:** Varied source formats (CSV, XLS, multi-dimensional JSON) are transformed into a unified, flat JSON schema.
4.  **Source Attribution:** Responses always include original source URLs and metadata, ensuring transparency.
5.  **Remote Transport:** Optimised for serverless environments with HTTP/SSE transport.

---

## 📊 Primary Data Sources

The server integrates with established government repositories:

- **[MakStat (State Statistical Office)](https://makstat.stat.gov.mk/):** The authoritative source for population, demographics, and economic statistics.
- **[data.gov.mk (National Open Data Portal)](https://data.gov.mk/):** A decentralized repository for government datasets across health, education, transport, and more.
- **[Future Integrations]:** Planned support for Open Finance, legislative data from Sobraine (Assembly), and municipal portals.

---

## 🏗️ System Architecture

Built on the **Remote MCP Server** paradigm, the project leverages modern web technologies for scalability and performance.

### **Technical Stack:**

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict mode)
- **SDK:** `@modelcontextprotocol/sdk`
- **Transport:** HTTP / Server-Sent Events (SSE)
- **Styling:** Tailwind CSS 4 & Shadcn/UI
- **Deployment:** Optimized for Vercel (Serverless)

### **Request Pipeline:**

1.  **Tool Invocation:** Client triggers a tool (e.g., `get_makstat_demographics`).
2.  **Upstream Request:** Server fetches live data from official government APIs.
3.  **Normalization:** Raw data is processed into a standardized JSON format.
4.  **Response:** Clean results are returned to the AI client.

---

## 🛠️ Available Tools

| Tool Name         | Description                                               | Status         |
| :---------------- | :-------------------------------------------------------- | :------------- |
| `multiply`        | A utility tool used for testing (multiplies two numbers). | ✅ Stable      |
| `get_mak_stat`    | (Planned) Fetch statistical tables from MakStat.          | 🚧 In Progress |
| `search_data_gov` | (Planned) Search datasets on the Open Data Portal.        | 🚧 In Progress |

---

## 🚦 Getting Started

### **Local Development**

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/stefantrajanov/mk-data-mcp.git
    cd mk-data-mcp
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    bun install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    # or
    bun dev
    ```

4.  **Access the MCP endpoint:**
    The server listens on `http://localhost:3000/api/mcp`.

### **Deployment**

The project is designed to be deployed to **Vercel** with zero configuration. It uses the Next.js Edge Runtime for high-performance, stateless execution.

---

## 📡 Connecting to Your AI Client

To use this server in your preferred MCP client (like Claude Desktop or Cursor), point the client to the SSE endpoint:

```json
 "mcpServers": {
    "mk-data-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mk-data-mcp.vercel.app/api/mcp/mcp"]
    }
  },
```

For local testing, use: `http://localhost:3000/api/mcp/mcp`

---

## ✨ Design Principles

The project's UI/UX (for future dashboards/visualizations) follows:

- **Typography:** Inter (Modern sans-serif) for high readability.
- **Aesthetics:** High-contrast slate text, subtle gradients, and reactive micro-animations.
- **Interoperability:** Full compatibility with the official MCP SDK and modern AI interfaces.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
