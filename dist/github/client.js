"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubClient = void 0;
const rest_1 = require("@octokit/rest");
class GitHubClient {
    octokit;
    constructor(token) {
        this.octokit = new rest_1.Octokit({ auth: token });
    }
    async getIssueLabels(owner, repo, issueNumber) {
        const { data: issue } = await this.octokit.issues.get({
            owner,
            repo,
            issue_number: issueNumber
        });
        return issue.labels;
    }
    async requestReviewers(owner, repo, prNumber, reviewers) {
        await this.octokit.pulls.requestReviewers({
            owner,
            repo,
            pull_number: prNumber,
            reviewers,
        });
    }
}
exports.GitHubClient = GitHubClient;
