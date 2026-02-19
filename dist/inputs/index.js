"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = void 0;
const core_1 = require("@actions/core");
const inputs_1 = require("../schemas/inputs");
const getInputs = () => inputs_1.InputsSchema.parse({
    configurationUrl: (0, core_1.getInput)('configuration-url', { required: true }),
    githubToken: (0, core_1.getInput)('github-token', { required: true }),
    selectionStrategy: (0, core_1.getInput)('selection-strategy') || 'random',
});
exports.getInputs = getInputs;
