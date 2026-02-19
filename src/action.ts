import { info, warning } from '@actions/core';
import { Inputs } from "./schemas/inputs";
import {GitHubClient, LinkedIssue} from "./github/client";
import { ConfigurationProvider } from "./configuration/provider";
import { ReviewerSelector } from "./reviewers/selector";
import { IssueDetector } from "./github/issue-detector";
import {EventPayload} from "./schemas/event-payload";
import {UserConfiguration} from "./schemas/userConfiguration";

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

    async run(event: EventPayload): Promise<void> {
        switch (event.action) {
            default:
                info(`received event ${event.action}`);
        }

        const prNumber = event.pull_request.number;
        const { owner, repo } = event.repository.full_name;

        const prBody = await this.client.getPullRequestBody(owner, repo, prNumber);

        info(`Processing PR #${prNumber} in ${owner}/${repo}`);

        const config: UserConfiguration = await this.configProvider.fetch();

        const linkedIssues: Array<LinkedIssue> = this.detector.extractLinkedIssues(prBody, owner, repo)

        info(`Found ${linkedIssues.length} linked issues.`);

        const domainsToReview = new Set<string>();
        for (const linked of linkedIssues) {
            info(`checking issue owner=${linked.owner} repo=${linked.repo} number=${linked.issueNumber}`)
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
            const owners = config.domains[domain].filter(o => o.username !== event.sender.login);
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
