# 📊 Primary Data Sources

## 🏢 data.gov.mk (National Open Data Portal)

A decentralized repository for government datasets from across Macedonia.

### Technical Details

- **API Engine:** [CKAN](https://ckan.org/).
- **Access Protocol:** JSON-RPC / REST via CKAN's Action API (`package_search`, `resource_show`).
- **Data Formats:** Mostly CSV and XLS; the MCP server converts these to standard JSON.
- **Key Categories:** Health, Education, Transport, Environment.

## 📈 MakStat (State Statistical Office)

The authoritative source for Macedonian population and economic statistics.

### Technical Details

- **Query Method:** JSON POST requests with nested `selection` and `filter` objects.
- **Output:** Multi-dimensional JSON/CSV; requires complex flattening and normalization.
- **Key Indicators:** Population by municipality, unemployment, inflation, and salary indices.

## 🔜 Future Integrations

- **Open Finance:** Budgetary transactions and treasury data.
- **Sobraie (Assembly):** Legislative proposals and meeting minutes.
- **Municipal Portals:** Local government data from larger cities like Skopje.
