"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewerSelector = void 0;
class ReviewerSelector {
    strategy;
    constructor(strategy) {
        this.strategy = strategy;
    }
    select(owners) {
        if (owners.length === 0)
            return [];
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
exports.ReviewerSelector = ReviewerSelector;
