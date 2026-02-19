import { z } from 'zod';

export const OwnerSchema = z.object({ username: z.string() });
export type Owner = z.output<typeof OwnerSchema>;

export const UserConfigurationSchema = z.looseObject({
    domains: z.record(z.string(), z.array(OwnerSchema))
});

export type UserConfiguration = z.output<typeof UserConfigurationSchema>;