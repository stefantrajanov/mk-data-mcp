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
]
