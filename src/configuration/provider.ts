import { UserConfiguration, UserConfigurationSchema } from "../schemas/userConfiguration";

export class ConfigurationProvider {
    constructor(private url: string) {}

    async fetch(): Promise<UserConfiguration> {
        const response = await fetch(this.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch configuration from ${this.url}: ${response.statusText}`);
        }
        const data = await response.json();
        return UserConfigurationSchema.parse(data);
    }
}
