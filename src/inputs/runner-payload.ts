import {EventPayload, EventPayloadSchema} from "../schemas/event-payload";
import {readFile} from "node:fs/promises";

export const getRunnerPayload = async (): Promise<EventPayload> => {
    const eventPath = process.env.GITHUB_EVENT_PATH;

    if (!eventPath) {
        throw new Error("Missing GITHUB_REPOSITORY or GITHUB_EVENT_PATH");
    }
    const raw = await readFile(eventPath, 'utf8');
    return EventPayloadSchema.parse(JSON.parse(raw));
}