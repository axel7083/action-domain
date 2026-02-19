"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueDetector = void 0;
class IssueDetector {
    static DOMAIN_REGEX = /^domains\/(.+)\/approved$/;
    static PART_OF_REGEX = /Part of (https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+))/g;
    static CLOSES_REGEX = /(?:Closes|Fixes|Resolves) #(\d+)/gi;
    extractLinkedIssues(prBody, defaultOwner, defaultRepo) {
        const linkedIssues = [];
        if (prBody) {
            let match;
            // 1. Part of <url>
            while ((match = IssueDetector.PART_OF_REGEX.exec(prBody)) !== null) {
                linkedIssues.push({
                    owner: match[2],
                    repo: match[3],
                    issueNumber: parseInt(match[4], 10),
                });
            }
            // Reset regex state
            IssueDetector.PART_OF_REGEX.lastIndex = 0;
            // 2. Closes #123
            while ((match = IssueDetector.CLOSES_REGEX.exec(prBody)) !== null) {
                linkedIssues.push({
                    owner: defaultOwner,
                    repo: defaultRepo,
                    issueNumber: parseInt(match[1], 10),
                });
            }
            // Reset regex state
            IssueDetector.CLOSES_REGEX.lastIndex = 0;
        }
        return linkedIssues;
    }
    extractDomains(labels) {
        const domains = [];
        for (const label of labels) {
            const labelName = typeof label === 'string' ? label : label.name;
            if (labelName) {
                const match = labelName.match(IssueDetector.DOMAIN_REGEX);
                if (match) {
                    domains.push(match[1]);
                }
            }
        }
        return domains;
    }
}
exports.IssueDetector = IssueDetector;
