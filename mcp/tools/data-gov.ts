import { getDatasetSchema, listOrganizationsSchema, queryDatastoreSchema, searchDatasetsSchema } from '@/mcp/schemas/data-gov-schemas'
import { z } from 'zod'

const API_BASE_URL = process.env.DATA_GOV_API_BASE_URL || ''

async function ckanRequest(endpoint: string, payload: Record<string, unknown> = {}) {
    const url = `${API_BASE_URL}/${endpoint}`
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (!data.success) {
            const errorMsg = data.error?.message || 'Unknown CKAN error'
            if (response.status === 401 || response.status === 403 || errorMsg.toLowerCase().includes('access denied')) {
                throw new Error('Access not permitted at this moment')
            }
            throw new Error(`API Error: ${errorMsg}`)
        }

        return data.result
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error(`Network error connecting to data.gov.mk: ${String(error)}`)
    }
}

function handleError(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return `Error: Unexpected error — ${String(error)}`
}

export const datagovmkSearchDatasetsTool = {
    name: 'datagovmk_search_datasets',
    meta: {
        title: 'Search Datasets',
        description: 'Search data.gov.mk datasets by keyword.',
        inputSchema: searchDatasetsSchema,
        annotations: { readOnlyHint: true, openWorldHint: true },
    },
    handler: async (params: z.infer<typeof searchDatasetsSchema>) => {
        try {
            const result = await ckanRequest('package_search', params)
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

export const datagovmkGetDatasetTool = {
    name: 'datagovmk_get_dataset',
    meta: {
        title: 'Get Dataset Metadata',
        description: 'Get full metadata for a specific dataset, including resource IDs.',
        inputSchema: getDatasetSchema,
        annotations: { readOnlyHint: true, openWorldHint: true },
    },
    handler: async (params: z.infer<typeof getDatasetSchema>) => {
        try {
            const result = await ckanRequest('package_show', params)
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

export const datagovmkQueryDatastoreTool = {
    name: 'datagovmk_query_datastore',
    meta: {
        title: 'Query Datastore',
        description: 'Query actual row data from a tabular resource (CSV).',
        inputSchema: queryDatastoreSchema,
        annotations: { readOnlyHint: true, openWorldHint: true },
    },
    handler: async (params: z.infer<typeof queryDatastoreSchema>) => {
        try {
            const result = await ckanRequest('datastore_search', params)
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

export const datagovmkListOrganizationsTool = {
    name: 'datagovmk_list_organizations',
    meta: {
        title: 'List Organizations',
        description: 'List organizations that own datasets on data.gov.mk.',
        inputSchema: listOrganizationsSchema,
        annotations: { readOnlyHint: true, openWorldHint: true },
    },
    handler: async (params: z.infer<typeof listOrganizationsSchema>) => {
        try {
            const result = await ckanRequest('organization_list', params)
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}
