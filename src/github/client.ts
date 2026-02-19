import { Octokit } from "@octokit/rest";

export interface LinkedIssue {
    owner: string;
    repo: string;
    issueNumber: number;
}

export class GitHubClient {
    private octokit: Octokit;

    constructor(token: string) {
        this.octokit = new Octokit({ auth: token });
    }

    async getIssueLabels(owner: string, repo: string, issueNumber: number): Promise<(string | { name?: string })[]> {
        const { data: issue } = await this.octokit.issues.get({
            owner,
            repo,
            issue_number: issueNumber
        });
        return issue.labels;
    }

    async requestReviewers(owner: string, repo: string, prNumber: number, reviewers: string[]): Promise<void> {
        await this.octokit.pulls.requestReviewers({
            owner,
            repo,
            pull_number: prNumber,
            reviewers,
        });
    }
}
