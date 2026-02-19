import { z } from 'zod';

export const EventPayloadSchema = z.object({
    'action': z.string(),
    'pull_request': z.object({
        '_links': z.object({
            'self': z.object({
                'href': z.string()
            })
        }),
        'draft': z.boolean(),
        'merged': z.boolean(),
        'number': z.number()
    }),
    'repository': z.object({
        'full_name': z.string().transform((fullName) => {
            const [owner, repo] = fullName.split('/');
            return { owner, repo };
        }),
        'name': z.string(),
    }),
    'sender': z.object({
        'login': z.string()
    })
});

export type EventPayload = z.output<typeof EventPayloadSchema>;