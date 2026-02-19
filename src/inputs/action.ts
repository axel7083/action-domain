import { getInput } from '@actions/core'
import { InputsSchema, Inputs } from '../schemas/inputs';

export const getActionInputs = (): Inputs => InputsSchema.parse({
    configurationUrl: getInput('configuration-url', { required: true }),
    githubToken: getInput('github-token', { required: true }),
    selectionStrategy: getInput('selection-strategy') || 'random',
});