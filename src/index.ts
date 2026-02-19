import { getInputs } from "./inputs";
import { setFailed } from '@actions/core';
import { DomainReviewerAction } from "./action";

async function main() {
    const inputs = getInputs();
    const action = new DomainReviewerAction(inputs);
    await action.run();
}

main().catch(error => {
    console.error(error);
    setFailed(error);
});