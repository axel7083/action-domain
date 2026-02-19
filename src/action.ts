import * as fs from 'fs';
import { info, warning } from '@actions/core';
import { Inputs } from "./schemas/inputs";
import { GitHubClient } from "./github/client";
import { ConfigurationProvider } from "./configuration/provider";
import { ReviewerSelector } from "./reviewers/selector";
import { IssueDetector } from "./github/issue-detector";

export class DomainReviewerAction {
    private client: GitHubClient;
    private configProvider: ConfigurationProvider;
    private selector: ReviewerSelector;
    private detector: IssueDetector;

    constructor(inputs: Inputs) {
        this.client = new GitHubClient(inputs.githubToken);
        this.configProvider = new ConfigurationProvider(inputs.configurationUrl);
        this.selector = new ReviewerSelector(inputs.selectionStrategy);
        this.detector = new IssueDetector();
    }

    async run(): Promise<void> {
        const repository = process.env.GITHUB_REPOSITORY;
        const eventPath = process.env.GITHUB_EVENT_PATH;

        if (!repository || !eventPath) {
            throw new Error("Missing GITHUB_REPOSITORY or GITHUB_EVENT_PATH");
        }

        const [owner, repo] = repository.split("/");
        const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
        console.log('GITHUB_EVENT_PATH', eventPath, JSON.stringify(event))

        const prNumber = event.pull_request?.number;

        if (!prNumber) {
            warning("Not a pull request, skipping.");
            return;
        }

        const prBody = event.pull_request.body;
        const prAuthor = event.pull_request.user.login;

        info(`Processing PR #${prNumber} in ${owner}/${repo}`);

        const config = await this.configProvider.fetch();
        const linkedIssues = this.detector.extractLinkedIssues(prBody, owner, repo);
        info(`Found ${linkedIssues.length} linked issues.`);

        const domainsToReview = new Set<string>();
        for (const linked of linkedIssues) {
            const labels = await this.client.getIssueLabels(linked.owner, linked.repo, linked.issueNumber);
            const domains = this.detector.extractDomains(labels);
            domains.forEach(d => domainsToReview.add(d));
        }

        if (domainsToReview.size === 0) {
            info("No domains found in linked issues labels.");
            return;
        }

        info(`Domains found: ${Array.from(domainsToReview).join(", ")}`);

        const reviewersToAdd = new Set<string>();
        for (const domain of domainsToReview) {
            const owners = config.domains[domain];
            if (owners) {
                const selected = this.selector.select(owners);
                selected.forEach(r => reviewersToAdd.add(r));
            } else {
                warning(`No owners defined for domain: ${domain}`);
            }
        }

        reviewersToAdd.delete(prAuthor);

        if (reviewersToAdd.size === 0) {
            info("No reviewers to add.");
            return;
        }

        info(`Adding reviewers: ${Array.from(reviewersToAdd).join(", ")}`);
        await this.client.requestReviewers(owner, repo, prNumber, Array.from(reviewersToAdd));

        info("Successfully added reviewers.");
    }
}
