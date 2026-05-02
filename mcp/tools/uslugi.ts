import { z } from 'zod'
import { uslugiBrowseSchema, uslugiSearchServicesSchema, uslugiGetServiceSchema, uslugiListInstitutionsSchema } from '@/mcp/schemas/uslugi-schemas'

const API_BASE_URL = process.env.USLUGI_API_BASE_URL || 'https://uslugi.gov.mk'
const CHARACTER_LIMIT = 25_000

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

async function uslugiPost(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
    const url = `${API_BASE_URL}/${path}`
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)
    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) throw new Error('Service returned no data (unpublished or unavailable).')
    return response.json()
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function handleError(error: unknown): string {
    if (error instanceof Error) return `Error: ${error.message}`
    return `Error: Unexpected error — ${String(error)}`
}

function applyCharacterLimit(text: string): string {
    if (text.length <= CHARACTER_LIMIT) return text
    return text.slice(0, CHARACTER_LIMIT) + '\n\n> ⚠️ Response truncated due to size limit.'
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&ldquo;|&rdquo;/g, '"')
        .replace(/&bdquo;/g, '„')
        .replace(/&amp;/g, '&')
        .replace(/\s{2,}/g, ' ')
        .trim()
}

// ===========================================================================
// TOOL 1 — uslugi_browse
// ===========================================================================

type UslugiBrowseInput = z.infer<typeof uslugiBrowseSchema>

export const uslugiBrowseTool = {
    name: 'uslugi_browse',
    meta: {
        title: 'Browse Government Service Categories',
        description: `Browse all service categories and subcategories on the Macedonian government e-services portal (uslugi.gov.mk).

Returns two lists:
- Top-level categories (e.g. Лични документи и исправи, Здравство, Даноци и јавни давачки) with their IDs
- All subcategories (e.g. Возачки дозволи, Патни исправи, Пензии) with their IDs

Use this as the first call to understand what service areas are covered before searching. Take category/subcategory names from these results and pass them as keywords to uslugi_search_services.

All text labels are in Macedonian Cyrillic.`,
        inputSchema: uslugiBrowseSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (_params: UslugiBrowseInput) => {
        try {
            const [categories, subcategories] = await Promise.all([uslugiPost('Core/LoadCategories'), uslugiPost('Core/GetSubCategories')])
            const result = { categories, subcategories }
            return { content: [{ type: 'text' as const, text: applyCharacterLimit(JSON.stringify(result, null, 2)) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 2 — uslugi_search_services
// ===========================================================================

type UslugiSearchServicesInput = z.infer<typeof uslugiSearchServicesSchema>

export const uslugiSearchServicesTool = {
    name: 'uslugi_search_services',
    meta: {
        title: 'Search Government Services',
        description: `Search for government services on uslugi.gov.mk by keyword.

Returns a list of matching services with their ID and name. Use the IDs with uslugi_get_service to retrieve full details (fees, required documents, deadlines, legal basis).

The keyword must be in Macedonian Cyrillic. Examples:
- возачка → driving licence services
- пасош → passport services
- данок → tax services
- пензија → pension services
- градба → construction permits

Call uslugi_browse first if you need to discover relevant keywords.`,
        inputSchema: uslugiSearchServicesSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: UslugiSearchServicesInput) => {
        try {
            const result = await uslugiPost('Services/GetAllPublishedServicesForTerm', { term: params.term })
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 3 — uslugi_get_service
// ===========================================================================

type UslugiGetServiceInput = z.infer<typeof uslugiGetServiceSchema>

export const uslugiGetServiceTool = {
    name: 'uslugi_get_service',
    meta: {
        title: 'Get Government Service Details',
        description: `Get full details for a specific government service by its ID (from uslugi_search_services).

Returns:
- Service name and description
- Responsible institution (name, address, phone, email, website)
- Contact information for the service
- Fees and payment details (amounts in MKD, regular vs urgent procedure)
- Procedural deadlines (days between each stage)
- Legal basis (laws and official gazette references)
- Subcategory classification

Use this after uslugi_search_services to answer questions like "what does a passport cost", "how long does VAT registration take", or "what laws govern this procedure".

Note: a small number of service IDs may return an error if the service is unpublished.`,
        inputSchema: uslugiGetServiceSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (params: UslugiGetServiceInput) => {
        try {
            const result = (await uslugiPost('Services/GetServiceDetails', { id: params.id })) as Record<string, unknown>
            if (typeof result.AdministrativeProcedureServiceDescription === 'string') {
                result.AdministrativeProcedureServiceDescription = stripHtml(result.AdministrativeProcedureServiceDescription)
            }
            if (typeof result.AdministrativeProcedureServiceIntro === 'string') {
                result.AdministrativeProcedureServiceIntro = stripHtml(result.AdministrativeProcedureServiceIntro)
            }
            return { content: [{ type: 'text' as const, text: applyCharacterLimit(JSON.stringify(result, null, 2)) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}

// ===========================================================================
// TOOL 4 — uslugi_list_institutions
// ===========================================================================

type UslugiListInstitutionsInput = z.infer<typeof uslugiListInstitutionsSchema>

export const uslugiListInstitutionsTool = {
    name: 'uslugi_list_institutions',
    meta: {
        title: 'List Government Institutions',
        description: `List the major government institutions that provide services on uslugi.gov.mk.

Returns each institution with:
- Name and ID
- Address and municipality
- Phone and email
- Geographic coordinates (longitude/latitude)
- Whether it is a group (umbrella) institution

Use this to find contact details or locate the office responsible for a service area.`,
        inputSchema: uslugiListInstitutionsSchema,
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    handler: async (_params: UslugiListInstitutionsInput) => {
        try {
            const result = await uslugiPost('Institutions/GetInstitutionsAndGroupsForPublicSite')
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
        } catch (error) {
            return { content: [{ type: 'text' as const, text: handleError(error) }] }
        }
    },
}
