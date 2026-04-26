import { z } from 'zod'

export const searchDatasetsSchema = z
    .object({
        q: z.string().optional().describe('The search query (e.g., "budget").'),
        fq: z.string().optional().describe('Filter query to filter by specific fields (e.g., organization:ministry-of-health).'),
        rows: z.number().int().default(10).describe('Number of results to return (Pagination limit). Default is 10.'),
        start: z.number().int().default(0).describe('Pagination offset.'),
        sort: z.string().optional().describe('Sorting order (e.g., metadata_modified desc).'),
    })
    .strict()

export const getDatasetSchema = z
    .object({
        id: z.string().describe('The ID or name of the dataset.'),
    })
    .strict()

export const queryDatastoreSchema = z
    .object({
        resource_id: z.string().describe('The UUID of the resource.'),
        limit: z.number().int().default(100).describe('Number of rows to return.'),
        offset: z.number().int().default(0).describe('Pagination offset.'),
        q: z.string().optional().describe('Full-text search across all columns.'),
        filters: z.record(z.string(), z.string()).optional().describe('Key-value pairs for exact matching (e.g., {"status": "active"}).'),
        fields: z.array(z.string()).optional().describe('Specific columns to return (e.g., ["id", "amount", "date"]).'),
    })
    .strict()

export const listOrganizationsSchema = z
    .object({
        all_fields: z.boolean().default(false).describe('If true, returns full dictionary objects instead of just names.'),
        include_dataset_count: z.boolean().default(false).describe('Returns the number of datasets per organization.'),
    })
    .strict()
