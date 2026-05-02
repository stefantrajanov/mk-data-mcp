import { z } from 'zod'

export const uslugiBrowseSchema = z.object({}).strict()

export const uslugiSearchServicesSchema = z
    .object({
        term: z.string().min(1).describe('Search keyword in Macedonian Cyrillic (e.g. возачка, пасош, данок, градба).'),
    })
    .strict()

export const uslugiGetServiceSchema = z
    .object({
        id: z.number().int().positive().describe('Service ID from uslugi_search_services results.'),
    })
    .strict()

export const uslugiListInstitutionsSchema = z.object({}).strict()
