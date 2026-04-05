import { z } from 'zod'

export const multiplyTool = {
    name: 'multiply',
    meta: {
        title: 'Multiply',
        description: 'Multiply two numbers together and return the result.',
        inputSchema: z.object({
            a: z.number().describe('The first number'),
            b: z.number().describe('The second number'),
        }),
    },
    handler: async ({ a, b }: { a: number; b: number }) => ({
        content: [{ type: 'text' as const, text: `${a} × ${b} = ${a * b}` }],
    }),
}
