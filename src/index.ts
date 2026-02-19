import { getActionInputs } from "./inputs/action";
import { setFailed } from '@actions/core';
import { DomainReviewerAction } from "./action";
import {getRunnerPayload} from "./inputs/runner-payload";

async function main() {
    const inputs = getActionInputs();
    const event = await getRunnerPayload();
    return new DomainReviewerAction(inputs).run(event);
}

main().catch(error => {
    console.error(error);
    setFailed(error);
});