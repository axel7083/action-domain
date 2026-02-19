import { z } from 'zod';

export const OwnerSchema = z.object({ username: z.string() });
export type Owner = z.output<typeof OwnerSchema>;

export const ConfigurationSchema = z.object({
    domains: z.record(z.string(), z.array(OwnerSchema))
});

export type Configuration = z.output<typeof ConfigurationSchema>;