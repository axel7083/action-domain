import {UserConfigurationSchema} from "../src/schemas/userConfiguration";
import { writeFile } from 'node:fs/promises';

async function main(output: string | undefined) {
    if(!output) throw new Error('missing output file');

    const jsonSchema = UserConfigurationSchema.toJSONSchema();
    return writeFile(output, JSON.stringify(jsonSchema), {
        encoding: 'utf8',
    });
}

main(process.argv[2]).catch((error) => {
    console.error(error);
    process.exit(1);
})