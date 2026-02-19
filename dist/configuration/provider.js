"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationProvider = void 0;
const configuration_1 = require("../schemas/configuration");
class ConfigurationProvider {
    url;
    constructor(url) {
        this.url = url;
    }
    async fetch() {
        const response = await fetch(this.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch configuration from ${this.url}: ${response.statusText}`);
        }
        const data = await response.json();
        return configuration_1.ConfigurationSchema.parse(data);
    }
}
exports.ConfigurationProvider = ConfigurationProvider;
