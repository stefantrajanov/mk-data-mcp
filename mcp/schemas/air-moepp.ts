import { z } from 'zod'

export const getAirQualityStationsSchema = z.object({})

export const getStationMeasurementsSchema = z.object({
    station_id: z.number().int().describe('The numeric ID of the monitoring station. Fetch this from get_air_quality_stations first.'),
})

export const getAqiSchema = z.object({
    station_id: z.number().int().describe('The numeric ID of the monitoring station.'),
})

export const findNearestStationSchema = z.object({
    latitude: z.number().describe('WGS-84 latitude (e.g. 41.9954)'),
    longitude: z.number().describe('WGS-84 longitude (e.g. 21.4254)'),
})
