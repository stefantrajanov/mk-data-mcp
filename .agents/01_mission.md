# 🎯 Mission & Scope: Macedonian Data MCP

## 🌟 The Vision

The **Macedonian Public Data MCP Server** is a bridge between advanced AI agents and official Macedonian government datasets. It allows AI models to move beyond their training data by providing **real-time, authoritative access** to public records through a standardized protocol.

## 🚀 Core Functionality

1. **Natural Language Querying:** Users ask questions like _"What was the unemployment rate in the last 10 years?"_
2. **AI Tool Selection:** The LLM identifies the correct MCP tool (e.g., MakStat or Open Data Portal).
3. **Data Fetching:** The server calls official APIs (`data.gov.mk`, `MakStat`).
4. **Normalization:** Raw API responses are transformed into clean, structured JSON.
5. **Informed Answers:** The AI generates an answer based on the retrieved facts, citing the official source.

## 👥 Target Users

- **Data Scientists:** Accessing clean datasets for research and visualization.
- **Public Administration:** Supporting evidence-based decision-making.
- **Journalists & Students:** Fact-checking and analyzing trends in Macedonia.
- **Citizens:** Easily accessing public information without navigating complex government portals.

## 📍 Primary Domains

- **Demographics:** Population, migration, and household statistics via MakStat.
- **Economy:** Inflation, GDP, and trade data.
- **Open Data:** Datasets from various ministries via the National Open Data Portal.
