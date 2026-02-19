import { getInput } from '@actions/core'
import { InputsSchema, Inputs } from '../schemas/inputs';

export const getInputs = (): Inputs => InputsSchema.parse({
    configurationUrl: getInput('configuration-url', { required: true }),
});