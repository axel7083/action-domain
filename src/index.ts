import { getInputs } from "./inputs";
import { setFailed } from '@actions/core'

async function main() {
    const inputs = getInputs();
}

main().catch(error => {
    console.error(error)
    setFailed(error)
})