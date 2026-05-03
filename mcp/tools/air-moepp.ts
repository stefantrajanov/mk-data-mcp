import { findNearestStationSchema, getAirQualityStationsSchema, getAqiSchema, getStationMeasurementsSchema } from '@/mcp/schemas/air-moepp'
import { z } from 'zod'

const API_BASE_URL = process.env.AIR_GOV_API_BASE_URL || ''

export interface Station {
    id: number
    code: string
    name: string
    longitude: number
    latitude: number
    isActive: boolean
    created: string
    regionID: number
    city: string
    typeOfStation: string
    areaType: string
    address: string
    altituda: number
    pollutants: string
    cityEN: string
    addressEN: string
    areaTypeEN: string
    typeOfStationEN: string
    nameEN: string
}

export interface Measurement {
    stationID: number
    stationName: string
    fromTime: string
    toTime: string
    cO_Value: number | null
    nO2_Value: number | null
    o3_Value: number | null
    pM25_Value: number | null
    pM10_Value: number | null
    sO2_Value: number | null
}

// ---------------------------------------------------------------------------
// HTTP & Caching helpers
// ---------------------------------------------------------------------------

let stationsCache: Station[] | null = null
let stationsCacheTime = 0
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

async function fetchStations(): Promise<Station[]> {
    if (stationsCache && Date.now() - stationsCacheTime < CACHE_TTL) {
        return stationsCache
    }
    const response = await fetch(`${API_BASE_URL}/stations`, {
        headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; MCP-Agent/1.0)',
        },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
    stationsCache = await response.json()
    stationsCacheTime = Date.now()
    return stationsCache || []
}

async function fetchMeasurements(stationId: number): Promise<Measurement[]> {
    const response = await fetch(`${API_BASE_URL}/measurements/${stationId}`, {
        headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; MCP-Agent/1.0)',
        },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
    return response.json()
}

function handleError(error: unknown): string {
    if (error instanceof Error) return `Error: ${error.message}`
    return `Error: Unexpected error — ${String(error)}`
}

// ---------------------------------------------------------------------------
// AQI Calculation & Helpers
// ---------------------------------------------------------------------------

// Standard EAQI thresholds
const THRESHOLDS = {
    PM10: [20, 40, 50, 100, 150],
    PM25: [10, 20, 25, 50, 75],
    NO2: [40, 90, 120, 230, 340],
    O3: [50, 100, 130, 240, 380],
    SO2: [50, 100, 200, 350, 500],
}

const BANDS = [
    { value: 1, category: 'Good', recommendation: 'Air quality is satisfactory; no risk.' },
    { value: 2, category: 'Fair', recommendation: 'Enjoy your usual outdoor activities.' },
    { value: 3, category: 'Moderate', recommendation: 'Consider reducing intense outdoor activities.' },
    { value: 4, category: 'Poor', recommendation: 'Reduce intense outdoor activities.' },
    { value: 5, category: 'Very Poor', recommendation: 'Avoid intense outdoor activities.' },
    { value: 6, category: 'Extremely Poor', recommendation: 'Avoid all outdoor physical activity.' },
]

function getPollutantBand(pollutant: keyof typeof THRESHOLDS, value: number | null) {
    if (value === null || value === undefined) return 0
    const thresholds = THRESHOLDS[pollutant]
    for (let i = 0; i < thresholds.length; i++) {
        if (value <= thresholds[i]) return i + 1
    }
    return 6 // > max threshold
}

function calculateEAQI(measurement: Measurement) {
    const indices = [
        { pollutant: 'PM10', band: getPollutantBand('PM10', measurement.pM10_Value) },
        { pollutant: 'PM2.5', band: getPollutantBand('PM25', measurement.pM25_Value) },
        { pollutant: 'NO2', band: getPollutantBand('NO2', measurement.nO2_Value) },
        { pollutant: 'O3', band: getPollutantBand('O3', measurement.o3_Value) },
        { pollutant: 'SO2', band: getPollutantBand('SO2', measurement.sO2_Value) },
    ]

    const validIndices = indices.filter((i) => i.band > 0)
    if (validIndices.length === 0) return null

    // Find the max band
    validIndices.sort((a, b) => b.band - a.band)
    const worst = validIndices[0]

    return {
        ...BANDS[worst.band - 1],
        dominantPollutant: worst.pollutant,
    }
}

// ---------------------------------------------------------------------------
// Haversine Distance Helper
// ---------------------------------------------------------------------------
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

// ===========================================================================
// TOOL 1 — get_air_quality_stations
// ===========================================================================

export const getAirQualityStationsTool = {
    name: 'get_air_quality_stations',
    meta: {
        title: 'Get Air Quality Stations',
        description: 'Retrieves the full list of monitoring stations, their geographical coordinates, and operational status.',
        inputSchema: getAirQualityStationsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async () => {
        try {
            const stations = await fetchStations()
            return { content: [{ type: 'text' as const, text: JSON.stringify(stations, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 2 — get_station_measurements
// ===========================================================================

export const getStationMeasurementsTool = {
    name: 'get_station_measurements',
    meta: {
        title: 'Get Station Measurements',
        description: 'Fetches the hourly measurement telemetry (PM10, PM2.5, NO2, O3, SO2, CO) for the current day for a specific monitoring station.',
        inputSchema: getStationMeasurementsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: z.infer<typeof getStationMeasurementsSchema>) => {
        try {
            const measurements = await fetchMeasurements(params.station_id)
            if (!measurements || measurements.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No measurements found for this station today.' }] }
            }
            // Add helpful contextual string
            const result = {
                note: 'Data is unvalidated raw telemetry. Units are µg/m³ (except CO which is mg/m³). null values mean Data Missing/Sensor Offline.',
                measurements: measurements,
            }
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 3 — calculate_current_aqi
// ===========================================================================

export const calculateCurrentAqiTool = {
    name: 'calculate_current_aqi',
    meta: {
        title: 'Calculate Current AQI',
        description: 'Calculates the European Air Quality Index (EAQI) for a station based on its most recent hourly readings.',
        inputSchema: getAqiSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: z.infer<typeof getAqiSchema>) => {
        try {
            const measurements = await fetchMeasurements(params.station_id)
            if (!measurements || measurements.length === 0) {
                return { content: [{ type: 'text' as const, text: 'No measurements available to calculate AQI.' }] }
            }

            // Get the most recent measurement
            // Sorting by toTime descending to ensure we have the latest
            measurements.sort((a, b) => new Date(b.toTime).getTime() - new Date(a.toTime).getTime())
            const latest = measurements[0]

            const aqi = calculateEAQI(latest)
            if (!aqi) {
                return { content: [{ type: 'text' as const, text: 'No valid pollutant data available to calculate AQI. Sensors may be offline.' }] }
            }

            const result = {
                stationName: latest.stationName,
                timestamp: latest.toTime,
                aqi: aqi,
                rawReadings: {
                    PM10: latest.pM10_Value,
                    PM2_5: latest.pM25_Value,
                    NO2: latest.nO2_Value,
                    O3: latest.o3_Value,
                    SO2: latest.sO2_Value,
                    CO: latest.cO_Value,
                },
            }
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 4 — find_nearest_station
// ===========================================================================

export const findNearestStationTool = {
    name: 'find_nearest_station',
    meta: {
        title: 'Find Nearest Station',
        description: 'Finds the single closest active monitoring station to a specific geographic coordinate (latitude, longitude).',
        inputSchema: findNearestStationSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: z.infer<typeof findNearestStationSchema>) => {
        try {
            const stations = await fetchStations()
            let nearest: Station | null = null
            let minDistance = Infinity

            for (const station of stations) {
                if (!station.isActive || !station.latitude || !station.longitude) continue

                const dist = getDistanceFromLatLonInKm(params.latitude, params.longitude, station.latitude, station.longitude)

                if (dist < minDistance) {
                    minDistance = dist
                    nearest = station
                }
            }

            if (!nearest) {
                return { content: [{ type: 'text' as const, text: 'No active stations found.' }] }
            }

            const result = {
                station: nearest,
                distanceKm: parseFloat(minDistance.toFixed(2)),
            }

            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}
