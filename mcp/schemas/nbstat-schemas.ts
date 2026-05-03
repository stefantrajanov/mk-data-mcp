import { z } from 'zod'

enum Lang {
    EN = 'en',
    MK = 'mk',
}

enum SelectionFilter {
    ITEM = 'item',
    ALL = 'all',
    TOP = 'top',
}

const langSchema = z.nativeEnum(Lang).default(Lang.EN).describe("Language for display labels: 'en' for English (default), 'mk' for Macedonian.")

export const nbstatSelectionSchema = z
    .object({
        code: z.string().describe('Variable code as returned by nbstat_get_metadata (e.g. "Период", "Валута").'),
        filter: z
            .nativeEnum(SelectionFilter)
            .describe('"item" = specific values, "all" = every value for this variable, "top" = latest N periods (recommended for time variables to avoid hardcoding dates).'),
        values: z.array(z.string()).min(1).describe('Values to select. For "item": specific codes from get_metadata. For "all": ["*"]. For "top": ["N"] e.g. ["5"] for latest 5 periods.'),
    })
    .strict()

export const nbstatBrowseSchema = z
    .object({
        path: z
            .string()
            .default('')
            .describe(
                'Slash-separated path to browse. Use empty string for root categories. ' +
                    'Use the `id` field from a previous browse response to drill down. ' +
                    'Example: "Eksterni statistiki" for a category, "Eksterni statistiki/Platen Bilans" for a subcategory.'
            ),
        lang: langSchema,
    })
    .strict()

export const nbstatGetMetadataSchema = z
    .object({
        path: z
            .string()
            .min(1)
            .describe(
                'Full slash-separated path to the .px table, built from `id` fields returned by nbstat_browse. ' +
                    'Do NOT include the ".px" extension — the tool adds it internally. ' +
                    'Example: "Eksterni statistiki/Platen Bilans/Platen bilans godisni/1_AgregiraniPodatociGodisniEN".'
            ),
        lang: langSchema,
    })
    .strict()

export const nbstatQuerySchema = z
    .object({
        path: z.string().min(1).describe('Full slash-separated path to the .px table. Same path used in nbstat_get_metadata.'),
        selections: z
            .array(nbstatSelectionSchema)
            .min(1)
            .describe(
                'Variable selections defining which data to fetch. Get variable codes and available values from ' +
                    'nbstat_get_metadata first. Use filter="top" with values=["N"] to get the latest N periods ' +
                    'without hardcoding dates.'
            ),
        lang: langSchema,
    })
    .strict()
