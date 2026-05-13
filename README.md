# 🇲🇰 mk-data-mcp

### **Bridging the Gap Between AI Agents and North Macedonian Public Data**

The **North Macedonian Public Data MCP Server** is an authoritative, standardized Model Context Protocol (MCP) server that provides AI agents (Claude, GPT, Gemini, etc.) with real-time access to official North Macedonian government institutional APIs and public records.

By exposing complex, diverse institutional datasets (CKAN, JSON-stat2, PXWeb, DataTables, raw telemetry) as unified, type-safe **MCP Tools**, this server empowers LLMs to query economic indicators, national statistics, public spending, open datasets, state budgets, administrative services, and air quality metrics using pure natural language.

---

## 🎯 Supported Public Platforms & Domains

The server seamlessly integrates with **7 major national systems**:

1. **[MakStat (State Statistical Office)](https://makstat.stat.gov.mk/)**  
   Demographics, labor markets, macroeconomics, and census data powered by the PXWeb/JSON-stat2 engine.
2. **[NBStat (National Bank of North Macedonia)](https://nbstat.nbrm.mk/)**  
   Monetary aggregates, financial accounts, balance of payments, external debt, and interest rates.
3. **[Open Finance (Ministry of Finance)](https://open.finance.gov.mk/)**  
   Comprehensive real-time public treasury transactions, government spending, and vendor payments.
4. **[Open Budget (Ministry of Finance)](https://budget.finance.gov.mk/)**  
   Annual state budget summaries, income/expenditure breakdowns, institution utilization, and multi-year macroeconomic trends.
5. **[data.gov.mk (National Open Data Portal)](https://data.gov.mk/)**  
   CKAN-backed decentralized repository of open government datasets, packages, resources, and tabular datastores.
6. **[uslugi.gov.mk (National E-Services Portal)](https://uslugi.gov.mk/)**  
   Published administrative procedures, document requirements, institutional fees, statutory deadlines, and legal basis mappings.
7. **[Air Quality Telemetry (MOEPP)](https://air.moepp.gov.mk/)**  
   Live hourly ambient air quality sensor telemetry (PM10, PM2.5, NO2, O3, SO2, CO), station discovery, and client-side European Air Quality Index (EAQI) calculation.

---

## 🛠️ Complete Suite of Available Tools

Currently, the server exposes **27 highly optimized MCP tools** across all supported domains:

### 📊 MakStat (State Statistical Office)

| Tool Name              | Description                                                                                              | Status    |
| :--------------------- | :------------------------------------------------------------------------------------------------------- | :-------- |
| `makstat_browse`       | Navigate the category hierarchy to find queryable statistical tables (`.px` datasets).                   | ✅ Stable |
| `makstat_get_metadata` | Retrieve the schema, variables, and Macedonian Cyrillic codes for a target table.                        | ✅ Stable |
| `makstat_query`        | Query statistical data with specific variable selections and automatically flatten JSON-stat2 responses. | ✅ Stable |

### 🏦 NBStat (National Bank)

| Tool Name             | Description                                                                               | Status    |
| :-------------------- | :---------------------------------------------------------------------------------------- | :-------- |
| `nbstat_browse`       | Navigate external, financial, and monetary statistical databases and subcategories.       | ✅ Stable |
| `nbstat_get_metadata` | Get schema definitions, dimensions, and available selection codes for financial datasets. | ✅ Stable |
| `nbstat_query`        | Fetch structured financial time series data with dynamic dimension flattening.            | ✅ Stable |

### 💰 Open Finance

| Tool Name                                   | Description                                                                                     | Status    |
| :------------------------------------------ | :---------------------------------------------------------------------------------------------- | :-------- |
| `openfinance_search_transactions`           | Deep multi-field search across treasury transactions with pagination and date ranges.           | ✅ Stable |
| `openfinance_get_transactions_by_payer`     | Retrieve all public transactions made by a specific government payer or tax ID (EDB).           | ✅ Stable |
| `openfinance_get_transactions_by_recipient` | Fetch government payments received by a targeted individual, vendor, or contractor.             | ✅ Stable |
| `openfinance_get_transactions_by_keyword`   | Thematic Cyrillic keyword queries mapped to targeted public sector spending.                    | ✅ Stable |
| `openfinance_get_spending_summary`          | Compute client-side aggregated financial summaries and overall totals over transaction subsets. | ✅ Stable |

### 📈 Open Budget

| Tool Name                          | Description                                                                         | Status    |
| :--------------------------------- | :---------------------------------------------------------------------------------- | :-------- |
| `budget_get_summary`               | High-level macro review of annual income, expenditures, and net surplus/deficit.    | ✅ Stable |
| `budget_get_income_breakdown`      | Granular composition of state tax revenue streams and social contributions.         | ✅ Stable |
| `budget_get_expenditure_breakdown` | Categorical spending analyzed from economic or functional government sector angles. | ✅ Stable |
| `budget_get_institutions`          | Comprehensive budget allocation vs. actual realization tracking per state entity.   | ✅ Stable |
| `budget_get_macro_trends`          | Complete long-term macroeconomic indicator series spanning 2008 to present.         | ✅ Stable |

### 📂 Open Data Portal (data.gov.mk)

| Tool Name                      | Description                                                                 | Status    |
| :----------------------------- | :-------------------------------------------------------------------------- | :-------- |
| `datagovmk_search_datasets`    | Full-text query against published government metadata packages.             | ✅ Stable |
| `datagovmk_get_dataset`        | Retrieve rich descriptive metadata and concrete file resource IDs.          | ✅ Stable |
| `datagovmk_query_datastore`    | Extract structured SQL-like row segments directly from tabular files (CSV). | ✅ Stable |
| `datagovmk_list_organizations` | Inspect all ministries, bodies, and commissions maintaining datasets.       | ✅ Stable |

### 🏛️ E-Services Portal (uslugi.gov.mk)

| Tool Name                  | Description                                                                               | Status    |
| :------------------------- | :---------------------------------------------------------------------------------------- | :-------- |
| `uslugi_browse`            | Traverse primary service categories and targeted procedural subcategories.                | ✅ Stable |
| `uslugi_search_services`   | Fast keyword lookup for published citizen and enterprise administrative services.         | ✅ Stable |
| `uslugi_get_service`       | Deep dive into procedural stages, fee tiers, contact endpoints, and gazetted legal bases. | ✅ Stable |
| `uslugi_list_institutions` | Locate service providers geographically alongside full institutional contact directories. | ✅ Stable |

### 🌍 Air Quality Monitoring (MOEPP)

| Tool Name                  | Description                                                                                  | Status    |
| :------------------------- | :------------------------------------------------------------------------------------------- | :-------- |
| `get_air_quality_stations` | List physical telemetry stations, operational flags, and geographic anchors.                 | ✅ Stable |
| `get_station_measurements` | Real-time ambient concentration readings across primary regulated pollutants.                | ✅ Stable |
| `calculate_current_aqi`    | On-the-fly local evaluation of European Air Quality Index (EAQI) bands and dominant factors. | ✅ Stable |
| `find_nearest_station`     | Geospatial resolution of the closest active sensor hub using Haversine formulas.             | ✅ Stable |

---

## 🚦 Getting Started

### **Prerequisites & Installation**

Per project conventions, **`bun`** is the standard package manager and runtime standard.

1. **Clone the repository:**

    ```bash
    git clone https://github.com/stefantrajanov/mk-data-mcp.git
    cd mk-data-mcp
    ```

2. **Install dependencies:**

    ```bash
    bun install
    ```

3. **Configure Environment Variables:**
   Create a `.env` or `.env.local` file (optional, endpoints default to production paths if omitted):

    ```env
    MAKSTAT_API_BASE_URL=https://makstat.stat.gov.mk/api/v1
    NBSTAT_API_BASE_URL=https://nbstat.nbrm.mk/api/v1
    OPEN_FINANCE_API_BASE_URL=https://open.finance.gov.mk/api/v1/datatables
    BUDGET_API_BASE_URL=https://budget.finance.gov.mk/api/v1
    DATA_GOV_API_BASE_URL=https://data.gov.mk/api/3/action
    USLUGI_API_BASE_URL=https://uslugi.gov.mk
    AIR_GOV_API_BASE_URL=https://air.moepp.gov.mk/api
    ```

4. **Launch Local Server:**
    ```bash
    bun dev
    ```
    The local transport handles MCP requests via SSE routing at `http://localhost:3000/api/mcp`.

---

## 📡 Client Connection Configuration

Integrate the live server inside top-tier agent platforms using standard Remote SSE parameters:

### **Claude Desktop / Cursor Settings**

```json
{
    "mcpServers": {
        "mk-data-mcp": {
            "command": "npx",
            "args": ["-y", "mcp-remote", "https://mk-data-mcp.vercel.app/api/mcp"]
        }
    }
}
```

_(For testing locally, map the target URL to `http://localhost:3000/api/mcp`)_

---

## 🏗️ Architectural Foundations

- **Transport Architecture:** Operates over lightweight serverless HTTP Server-Sent Events (SSE) interfaces natively decoupled from heavy local child-process executions.
- **Normalization Pipeline:** Dynamically strips multi-dimensional structures (such as `json-stat2` block arrays) into predictable JSON rows perfectly conditioned for LLM context processing without breaking token ceilings.
- **Type Safety & Validation:** Built using pure Next.js 16 (App Router), `@modelcontextprotocol/sdk`, and rigorous `Zod` validation layers ensuring schema adherence prior to making downstream public network calls.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for complete details.
