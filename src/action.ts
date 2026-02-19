import { readFile } from 'node:fs/promises';
import { info, warning } from '@actions/core';
import { Inputs } from "./schemas/inputs";
import {GitHubClient, LinkedIssue} from "./github/client";
import { ConfigurationProvider } from "./configuration/provider";
import { ReviewerSelector } from "./reviewers/selector";
import { IssueDetector } from "./github/issue-detector";
import {EventPayload, EventPayloadSchema} from "./schemas/event-payload";

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
        const eventPath = process.env.GITHUB_EVENT_PATH;

        if (!eventPath) {
            throw new Error("Missing GITHUB_REPOSITORY or GITHUB_EVENT_PATH");
        }

        const raw = await readFile(eventPath, 'utf8');
        const event: EventPayload = EventPayloadSchema.parse(JSON.parse(raw));

        const prNumber = event.pull_request.number;
        if (!prNumber) {
            warning("Not a pull request, skipping.");
            return;
        }

        const [owner, repo] = event.repository.full_name.split("/");

        const linkedIssues: Array<LinkedIssue> = [];
        if(event.pull_request.issue_url) {
            const url = new URL(event.pull_request.issue_url);
            const [owner2, repo2, issueNumber2] = url.pathname.split('/');
            linkedIssues.push({
                owner: owner2,
                repo: repo2,
                issueNumber: parseInt(issueNumber2),
            });
        }

        const prBody = await this.client.getPullRequestBody(owner, repo, prNumber);
        const prAuthor = event.sender.login;

        info(`Processing PR #${prNumber} in ${owner}/${repo}`);

        const config = await this.configProvider.fetch();

        linkedIssues.push(...this.detector.extractLinkedIssues(prBody, owner, repo));

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
            const owners = config.domains[domain].filter(o => o.username !== prAuthor);
            if (owners) {
                const selected = this.selector.select(owners);
                selected.forEach(r => reviewersToAdd.add(r));
            } else {
                warning(`No owners defined for domain: ${domain}`);
            }
        }

        if (reviewersToAdd.size === 0) {
            info("No reviewers to add.");
            return;
        }

        info(`Adding reviewers: ${Array.from(reviewersToAdd).join(", ")}`);
        await this.client.requestReviewers(owner, repo, prNumber, Array.from(reviewersToAdd));

        info("Successfully added reviewers.");
    }
}
