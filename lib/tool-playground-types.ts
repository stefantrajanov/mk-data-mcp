export type FieldType = 'string' | 'number' | 'enum'

export interface ToolField {
    name: string
    type: FieldType
    label: string
    description?: string
    placeholder?: string
    options?: string[]
    required?: boolean
    default?: string | number
}

export interface ToolConfig {
    name: string
    title: string
    description: string
    fields: ToolField[]
}
