"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inputs_1 = require("./inputs");
const core_1 = require("@actions/core");
const action_1 = require("./action");
async function main() {
    const inputs = (0, inputs_1.getInputs)();
    const action = new action_1.DomainReviewerAction(inputs);
    await action.run();
}
main().catch(error => {
    console.error(error);
    (0, core_1.setFailed)(error);
});
