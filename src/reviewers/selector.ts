import { Owner } from "../schemas/configuration";
import { Inputs } from "../schemas/inputs";

export class ReviewerSelector {
    constructor(private strategy: Inputs['selectionStrategy']) {}

    select(owners: Owner[]): string[] {
        if (owners.length === 0) return [];

        switch (this.strategy) {
            case 'all':
                return owners.map(o => o.username);
            case 'first':
                return [owners[0].username];
            case 'random':
            default:
                const randomIndex = Math.floor(Math.random() * owners.length);
                return [owners[randomIndex].username];
        }
    }
}
