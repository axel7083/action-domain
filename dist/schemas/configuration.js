"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationSchema = exports.OwnerSchema = void 0;
const zod_1 = require("zod");
exports.OwnerSchema = zod_1.z.object({ username: zod_1.z.string() });
exports.ConfigurationSchema = zod_1.z.object({
    domains: zod_1.z.record(zod_1.z.string(), zod_1.z.array(exports.OwnerSchema))
});
