# ✅ Key Features & Requirements

## 🛠️ Functional Requirements (High Priority)

- **Dataset Discovery:** Search and browse datasets from `data.gov.mk` and `MakStat`.
- **Query Processing:** Convert natural language requests into structured API parameters.
- **Data Normalization:** Transform varied source formats into a unified JSON structure.
- **MCP Tool Integration:** Expose data retrieval functions as standardized Model Context Protocol tools.
- **Source Attribution:** Always include the original source URL and metadata in the final response.

## ⚙️ Non-Functional Requirements

- **Performance:** Sub-second response times for search and basic data retrieval.
- **Scalability:** Modular architecture to easily add new sources (e.g., Open Finance, Assembly data).
- **Stability:** Robust error handling for unreliable government APIs (timeouts, 404s).
- **Interoperability:** Full compatibility with the official MCP SDK and clients like Claude/Cursor.
- **Data Accuracy:** Ensure the server always pulls from official, live endpoints.

## 🚦 Implementation Priorities

1. **[High]** MakStat statistical tables (Demographics/Economy).
2. **[High]** data.gov.mk CKAN API integration.
3. **[Medium]** Metadata extraction (Update dates, source ownership).
4. **[Low]** Advanced filtering (Geolocation, municipality-specific queries).
