import { ToolConfig, ToolField } from './tool-playground-types'

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

export const sharedDateFields: ToolField[] = [
    { name: 'month_from', type: 'number', label: 'Month From', default: 1, description: 'Starting month (1-12)' },
    { name: 'year_from', type: 'number', label: 'Year From', default: currentYear, description: 'Starting year (e.g. 2000)' },
    { name: 'month_to', type: 'number', label: 'Month To', default: currentMonth, description: 'Ending month (1-12)' },
    { name: 'year_to', type: 'number', label: 'Year To', default: currentYear, description: 'Ending year' },
]

export const sharedPaginationFields: ToolField[] = [
    { name: 'start', type: 'number', label: 'Start', default: 0, description: 'Pagination offset' },
    { name: 'length', type: 'number', label: 'Length', default: 50, description: 'Records per page (1-500)' },
]

export const responseFormatField: ToolField = {
    name: 'response_format',
    type: 'enum',
    label: 'Format',
    default: 'markdown',
    options: ['markdown', 'json'],
    description: 'Format returned by the API',
}

export const TOOLS_CONFIG: ToolConfig[] = [
    {
        name: 'openfinance_search_transactions',
        title: 'Search Transactions',
        description:
            'General-purpose tool to query Open Finance MK. Supports filtering by keyword, payer, recipient, EDBs, and date range. **Note: term MUST be in Macedonian Cyrillic.**\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow API response times.',
        fields: [
            { name: 'term', type: 'string', label: 'Keyword (Cyrillic)', placeholder: 'Образование', description: 'General keyword (Macedonian Cyrillic only)' },
            { name: 'payer', type: 'string', label: 'Payer Name', placeholder: 'Министерство...' },
            { name: 'recipient', type: 'string', label: 'Recipient Name', placeholder: 'Работник...' },
            { name: 'payerEDB', type: 'string', label: 'Payer EDB' },
            { name: 'recipientEDB', type: 'string', label: 'Recipient EDB' },
            ...sharedDateFields,
            ...sharedPaginationFields,
            responseFormatField,
        ],
    },
    {
        name: 'openfinance_get_transactions_by_payer',
        title: 'Get by Payer',
        description: 'Retrieve transactions strictly by a paying entity. Requires either `payer` or `payerEDB`.\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow API responses.',
        fields: [
            { name: 'payer', type: 'string', label: 'Payer Name', placeholder: 'Општина Центар' },
            { name: 'payerEDB', type: 'string', label: 'Payer EDB' },
            ...sharedDateFields,
            ...sharedPaginationFields,
            responseFormatField,
        ],
    },
    {
        name: 'openfinance_get_transactions_by_recipient',
        title: 'Get by Recipient',
        description:
            'Retrieve transactions strictly assigned to a receiving entity. Requires either `recipient` or `recipientEDB`.\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow API responses.',
        fields: [
            { name: 'recipient', type: 'string', label: 'Recipient Name', placeholder: 'Градежни работи' },
            { name: 'recipientEDB', type: 'string', label: 'Recipient EDB' },
            ...sharedDateFields,
            ...sharedPaginationFields,
            responseFormatField,
        ],
    },
    {
        name: 'openfinance_get_transactions_by_keyword',
        title: 'Get by Keyword',
        description:
            'Search by a thematic keyword. **CRITICAL: The keyword MUST be in Macedonian Cyrillic script.** (e.g. Образование)\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow responses.',
        fields: [{ name: 'keyword', type: 'string', label: 'Keyword (Cyrillic)', placeholder: 'Здравство', required: true }, ...sharedDateFields, ...sharedPaginationFields, responseFormatField],
    },
    {
        name: 'openfinance_get_spending_summary',
        title: 'Get Spending Summary',
        description: 'Compute an aggregated spending summary client-side for up to 500 records limits.\n\n⏱️ **PERFORMANCE WARNING**: Wide date ranges cause very slow responses.',
        fields: [
            { name: 'term', type: 'string', label: 'Keyword (Cyrillic)', placeholder: 'Култура' },
            { name: 'payer', type: 'string', label: 'Payer Name' },
            { name: 'recipient', type: 'string', label: 'Recipient Name' },
            ...sharedDateFields,
            { name: 'length', type: 'number', label: 'Length', default: 500, description: 'Max records to fetch & sum (max 500)' },
        ],
    },
    {
        name: 'datagovmk_search_datasets',
        title: 'Data.gov.mk: Search Datasets',
        description: 'Search for datasets on the Macedonian open data portal using keywords or filters.',
        fields: [
            { name: 'q', type: 'string', label: 'Query', placeholder: 'финансии' },
            { name: 'fq', type: 'string', label: 'Filter Query', placeholder: 'organization:ministry-of-health' },
            { name: 'rows', type: 'number', label: 'Rows', default: 10 },
            { name: 'start', type: 'number', label: 'Start', default: 0 },
            { name: 'sort', type: 'string', label: 'Sort', placeholder: 'metadata_modified desc' },
        ],
    },
    {
        name: 'datagovmk_get_dataset',
        title: 'Data.gov.mk: Get Dataset',
        description: 'Retrieve full metadata for a specific dataset by its ID or name.',
        fields: [{ name: 'id', type: 'string', label: 'Dataset ID', required: true, placeholder: 'e.g. budzet-na-opstina-kumanovo-2024' }],
    },
    {
        name: 'datagovmk_query_datastore',
        title: 'Data.gov.mk: Query Datastore',
        description: 'Fetch actual rows from a tabular resource (like a CSV file) that has been ingested into the CKAN Datastore.',
        fields: [
            { name: 'resource_id', type: 'string', label: 'Resource ID', required: true, placeholder: 'e.g. 6d05f884-638e-49b8-a6d1-4e7826391d1a' },
            { name: 'q', type: 'string', label: 'Full-text search' },
            { name: 'limit', type: 'number', label: 'Limit', default: 100 },
            { name: 'offset', type: 'number', label: 'Offset', default: 0 },
        ],
    },
    {
        name: 'datagovmk_list_organizations',
        title: 'Data.gov.mk: List Organizations',
        description: 'List the organizations (ministries, municipalities, etc.) that publish data on the portal.',
        fields: [
            { name: 'all_fields', type: 'enum', label: 'All Fields', default: 'false', options: ['true', 'false'] },
            { name: 'include_dataset_count', type: 'enum', label: 'Include Dataset Count', default: 'false', options: ['true', 'false'] },
        ],
    },
    {
        name: 'makstat_browse',
        title: 'MakStat: Browse Categories',
        description:
            'Navigate the MakStat category hierarchy. Leave path empty to list root categories, then drill down using the `id` fields returned.\n\n⚠️ Even on the English endpoint, `id` values are in Macedonian — always use them verbatim in subsequent calls.',
        fields: [
            {
                name: 'path',
                type: 'string',
                label: 'Path',
                default: '',
                placeholder: 'e.g. Пазар на труд (leave empty for root)',
                description: 'Macedonian path from a previous browse result',
            },
            { name: 'lang', type: 'enum', label: 'Language', default: 'en', options: ['en', 'mk'] },
        ],
    },
    {
        name: 'makstat_get_metadata',
        title: 'MakStat: Get Table Metadata',
        description: 'Get variables and available values for a .px table. Required before querying — provides the Macedonian Cyrillic variable codes needed by makstat_query.',
        fields: [
            {
                name: 'path',
                type: 'string',
                label: 'Table Path',
                required: true,
                placeholder: 'e.g. Пазар на труд/Плати/НаемниВработени',
                description: 'Full path from makstat_browse (no .px extension)',
            },
            { name: 'lang', type: 'enum', label: 'Language', default: 'en', options: ['en', 'mk'] },
        ],
    },
    {
        name: 'budget_get_summary',
        title: 'Budget: Get Summary',
        description: 'Top-level annual budget snapshot — total income, expenditure, deficit, and major income categories. Good first call for any budget year.',
        fields: [{ name: 'year', type: 'number', label: 'Year', default: 2024, description: '2017–2025' }],
    },
    {
        name: 'budget_get_income_breakdown',
        title: 'Budget: Get Income Breakdown',
        description: 'Detailed breakdown of tax income and social contributions by category, with amounts and percentages.',
        fields: [{ name: 'year', type: 'number', label: 'Year', default: 2024, description: '2017–2025' }],
    },
    {
        name: 'budget_get_expenditure_breakdown',
        title: 'Budget: Get Expenditure Breakdown',
        description: 'Expenditure breakdown by economic type (salaries, transfers, capital, etc.) or by functional sector (health, education, defense, etc.).',
        fields: [
            { name: 'year', type: 'number', label: 'Year', default: 2024, description: '2017–2025' },
            { name: 'breakdown', type: 'enum', label: 'Breakdown', default: 'economic', options: ['economic', 'functional'] },
        ],
    },
    {
        name: 'budget_get_institutions',
        title: 'Budget: Get Institutions',
        description: 'Budget allocation and realization per government institution (ministries, agencies, commissions) with utilization percentage.',
        fields: [{ name: 'year', type: 'number', label: 'Year', default: 2024, description: '2017–2025' }],
    },
    {
        name: 'budget_get_macro_trends',
        title: 'Budget: Get Macroeconomic Trends',
        description: 'Full historical macroeconomic time series from 2008: GDP growth, deficit %, public debt, unemployment, inflation, total incomes and expenditures. No parameters needed.',
        fields: [],
    },
    {
        name: 'uslugi_browse',
        title: 'uslugi.gov.mk: Browse Categories',
        description: 'Browse all service categories and subcategories on the Macedonian government e-services portal. Good first call to discover keywords before searching.',
        fields: [],
    },
    {
        name: 'uslugi_search_services',
        title: 'uslugi.gov.mk: Search Services',
        description: 'Search for government services by keyword in Macedonian Cyrillic. Returns matching service names and IDs.',
        fields: [{ name: 'term', type: 'string', label: 'Keyword (Cyrillic)', required: true, placeholder: 'e.g. возачка, пасош, данок' }],
    },
    {
        name: 'uslugi_get_service',
        title: 'uslugi.gov.mk: Get Service Details',
        description: 'Get full details for a service by ID — fees (MKD), deadlines, legal basis, institution contact info.',
        fields: [{ name: 'id', type: 'number', label: 'Service ID', required: true, description: 'ID from uslugi_search_services results' }],
    },
    {
        name: 'uslugi_list_institutions',
        title: 'uslugi.gov.mk: List Institutions',
        description: 'List major government institutions with name, address, phone, email, and coordinates.',
        fields: [],
    },
    {
        name: 'nbstat_browse',
        title: 'NBStat: Browse Categories',
        description: 'Navigate the National Bank statistical database hierarchy. Leave path empty for root, then drill down using returned `id` fields.',
        fields: [
            { name: 'path', type: 'string', label: 'Path', default: '', placeholder: 'e.g. Eksterni statistiki (leave empty for root)' },
            { name: 'lang', type: 'enum', label: 'Language', default: 'en', options: ['en', 'mk'] },
        ],
    },
    {
        name: 'nbstat_get_metadata',
        title: 'NBStat: Get Table Metadata',
        description: 'Get variables and available values for a .px table. Required before querying — provides variable codes needed by nbstat_query.',
        fields: [
            { name: 'path', type: 'string', label: 'Table Path', required: true, placeholder: 'e.g. Eksterni statistiki/Platen Bilans/Platen bilans godisni/1_AgregiraniPodatociGodisniEN' },
            { name: 'lang', type: 'enum', label: 'Language', default: 'en', options: ['en', 'mk'] },
        ],
    },
    {
        name: 'nbstat_query',
        title: 'NBStat: Query Data',
        description: 'Fetch National Bank statistical data with variable selections. Call nbstat_get_metadata first to get variable codes.',
        fields: [
            { name: 'path', type: 'string', label: 'Table Path', required: true, placeholder: 'e.g. Eksterni statistiki/Platen Bilans/Platen bilans godisni/1_AgregiraniPodatociGodisniEN' },
            {
                name: 'selections',
                type: 'string',
                label: 'Selections (JSON array)',
                required: true,
                placeholder: '[{"code":"Период","filter":"top","values":["5"]},{"code":"Компонента","filter":"all","values":["*"]}]',
                description: 'JSON array of variable selections. Get codes from nbstat_get_metadata.',
            },
            { name: 'lang', type: 'enum', label: 'Language', default: 'en', options: ['en', 'mk'] },
        ],
    },
    {
        name: 'makstat_query',
        title: 'MakStat: Query Data',
        description:
            'Fetch statistical data with variable selections. Call makstat_get_metadata first to get the Cyrillic variable codes.\n\nUse `filter: "top"` with `values: ["5"]` to get the latest 5 periods without hardcoding years.',
        fields: [
            {
                name: 'path',
                type: 'string',
                label: 'Table Path',
                required: true,
                placeholder: 'e.g. Пазар на труд/Плати/НаемниВработени',
            },
            {
                name: 'selections',
                type: 'string',
                label: 'Selections (JSON array)',
                required: true,
                placeholder: '[{"code":"Година","filter":"top","values":["5"]},{"code":"Мерка","filter":"all","values":["*"]}]',
                description: 'JSON array of variable selections. Get codes from makstat_get_metadata.',
            },
            { name: 'lang', type: 'enum', label: 'Language', default: 'en', options: ['en', 'mk'] },
        ],
    },
]
