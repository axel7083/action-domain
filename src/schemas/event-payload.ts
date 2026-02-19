import { z } from 'zod';

export const EventPayloadSchema = z.object({
    'pull_request': z.object({
        '_links': z.object({
            'self': z.object({
                'href': z.string()
            })
        }),
        'issue_url': z.string().optional(),
        'draft': z.boolean(),
        'merged': z.boolean(),
        'number': z.number()
    }),
    'repository': z.object({
        'full_name': z.string(),
        'name': z.string(),
    }),
    'sender': z.object({
        'login': z.string()
    })
});

export type EventPayload = z.output<typeof EventPayloadSchema>;