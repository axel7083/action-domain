import { z } from 'zod';

export const InputsSchema = z.object({
    'configurationUrl': z.url(),
    'githubToken': z.string(),
    'selectionStrategy': z.enum(['all', 'random', 'first']).default('random'),
});

export type Inputs = z.output<typeof InputsSchema>;