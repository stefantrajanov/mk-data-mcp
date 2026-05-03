# air.moepp.gov.mk API Documentation

_Prepared for LLM-based MCP tool development_

## 1. Overview

This document outlines the reverse-engineered internal API for the North Macedonian State Automatic Monitoring System for Ambient Air Quality (ДАМСКАВ) portal, available at `https://air.moepp.gov.mk`.

The API exposes a minimal surface area consisting of two core endpoints. All advanced features seen on the frontend (AQI calculation, exceedances, historical filtering) are calculated client-side based on the raw telemetry provided by these two routes.

## 2. Base URL & Authentication

- **Base URL**: `https://air.moepp.gov.mk/api/data`
- **Authentication**: None required.
- **Headers**:
    - `Accept: application/json`
    - `User-Agent`: Mimicking a standard browser is recommended.

## 3. Endpoint Reference

### Endpoint: [GET] /api/data/stations

- **Purpose**: Retrieves the full list of monitoring stations, their geographical coordinates, and operational status.
- **Parameters**: None required.
- **Request Example**:
    ```bash
    curl -X GET "https://air.moepp.gov.mk/api/data/stations" -H "Accept: application/json"
    ```
- **Response**: Returns a JSON array of station metadata (IDs, names, locations, pollutants, and active status).
- **Notes**: Responses are highly cacheable. The MCP server should ideally fetch this once and cache it in memory to resolve station names to IDs.

### Endpoint: [GET] /api/data/measurements/{station_id}

- **Purpose**: Fetches the measurement telemetry for a specific monitoring station.
- **Parameters**:
    - `station_id` (integer, required): The numeric ID of the station (e.g., `/api/data/measurements/1`).
- **Request Example**:
    ```bash
    curl -X GET "https://air.moepp.gov.mk/api/data/measurements/53" -H "Accept: application/json"
    ```
- **Response**: Returns a JSON array of measurement objects for the current day, including pollutants (PM10, PM2.5, NO2, O3, SO2, CO).
- **Notes**: Data is unvalidated raw telemetry.

## 4. MCP Tool Design Hints & Workarounds

Because the API does not natively serve AQI indexes or exceedance reports, your MCP tools must act as a middleware calculation layer.

1. **get_stations_list**
    - **Action**: Fetch `/api/data/stations`.
    - **Output**: JSON array of stations.
    - **Purpose**: Allows the LLM to map a user's natural language location to an exact `station_id`.

2. **get_station_measurements**
    - **Action**: Fetch `/api/data/measurements/{station_id}`.
    - **Inputs**: `station_id` (integer).
    - **Output**: Raw measurement data for the current day.

3. **calculate_current_aqi (Virtual Tool)**
    - **Action**: Fetch `/api/data/measurements/{station_id}`, then calculate the European Air Quality Index (EAQI) locally within the MCP server code.
    - **Inputs**: `station_id` (integer).
    - **Output**: The calculated EAQI band (1-6) and the dominant pollutant.
    - **Rationale**: Since the API doesn't provide an `/aqi` endpoint, your MCP server must apply the EAQI thresholds to the raw pollutant data returned by the measurements endpoint.

4. **find_nearest_station (Meta-tool)**
    - **Action**: Calculate the Haversine distance between user-provided coordinates and the cached output of `/api/data/stations`.
    - **Inputs**: `latitude` (float), `longitude` (float).
    - **Output**: The single closest station ID and its name.
