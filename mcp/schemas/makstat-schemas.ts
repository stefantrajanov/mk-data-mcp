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

export const selectionSchema = z
    .object({
        code: z.string().describe('Variable code in Macedonian Cyrillic, as returned by makstat_get_metadata (e.g. "Година", "Мерка").'),
        filter: z
            .nativeEnum(SelectionFilter)
            .describe('"item" = specific values, "all" = every value for this variable, "top" = latest N periods (recommended for time variables to avoid hardcoding years).'),
        values: z.array(z.string()).min(1).describe('Values to select. For "item": specific codes from get_metadata. For "all": ["*"]. For "top": ["N"] e.g. ["5"] for latest 5 periods.'),
    })
    .strict()

export const makstatBrowseSchema = z
    .object({
        path: z
            .string()
            .default('')
            .describe(
                'Slash-separated Macedonian path to browse. Use empty string for root categories. ' +
                    'Use the `id` field from a previous browse response to drill down. ' +
                    'Example: "Пазар на труд" for a category, "Пазар на труд/Плати" for a subcategory.'
            ),
        lang: langSchema,
    })
    .strict()

export const makstatGetMetadataSchema = z
    .object({
        path: z
            .string()
            .min(1)
            .describe(
                'Full slash-separated path to the .px table, built from `id` fields returned by makstat_browse. ' +
                    'Do NOT include the ".px" extension — the tool adds it internally. ' +
                    'Example: "Пазар на труд/Плати/НаемниВработени".'
            ),
        lang: langSchema,
    })
    .strict()

export const makstatQuerySchema = z
    .object({
        path: z.string().min(1).describe('Full slash-separated path to the .px table. Same path used in makstat_get_metadata.'),
        selections: z
            .array(selectionSchema)
            .min(1)
            .describe(
                'Variable selections defining which data to fetch. Get variable codes and available values from ' +
                    'makstat_get_metadata first. Use filter="top" with values=["N"] to get the latest N periods ' +
                    'without hardcoding years.'
            ),
        lang: langSchema,
    })
    .strict()
