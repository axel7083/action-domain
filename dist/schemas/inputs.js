"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputsSchema = void 0;
const zod_1 = require("zod");
exports.InputsSchema = zod_1.z.object({
    'configurationUrl': zod_1.z.url(),
    'githubToken': zod_1.z.string(),
    'selectionStrategy': zod_1.z.enum(['all', 'random', 'first']).default('random'),
});
