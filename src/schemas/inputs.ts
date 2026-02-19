import { z } from 'zod';

export const InputsSchema = z.object({
    'configurationUrl': z.url(),
});

export type Inputs = z.output<typeof InputsSchema>;