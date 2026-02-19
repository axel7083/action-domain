import { Configuration, ConfigurationSchema } from "../schemas/configuration";

export class ConfigurationProvider {
    constructor(private url: string) {}

    async fetch(): Promise<Configuration> {
        const response = await fetch(this.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch configuration from ${this.url}: ${response.statusText}`);
        }
        const data = await response.json();
        return ConfigurationSchema.parse(data);
    }
}
