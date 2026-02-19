"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainReviewerAction = void 0;
const fs = __importStar(require("fs"));
const core_1 = require("@actions/core");
const client_1 = require("./github/client");
const provider_1 = require("./configuration/provider");
const selector_1 = require("./reviewers/selector");
const issue_detector_1 = require("./github/issue-detector");
class DomainReviewerAction {
    client;
    configProvider;
    selector;
    detector;
    constructor(inputs) {
        this.client = new client_1.GitHubClient(inputs.githubToken);
        this.configProvider = new provider_1.ConfigurationProvider(inputs.configurationUrl);
        this.selector = new selector_1.ReviewerSelector(inputs.selectionStrategy);
        this.detector = new issue_detector_1.IssueDetector();
    }
    async run() {
        const repository = process.env.GITHUB_REPOSITORY;
        const eventPath = process.env.GITHUB_EVENT_PATH;
        if (!repository || !eventPath) {
            throw new Error("Missing GITHUB_REPOSITORY or GITHUB_EVENT_PATH");
        }
        const [owner, repo] = repository.split("/");
        const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
        console.log('GITHUB_EVENT_PATH', eventPath, JSON.stringify(event));
        const prNumber = event.pull_request?.number;
        if (!prNumber) {
            (0, core_1.warning)("Not a pull request, skipping.");
            return;
        }
        const prBody = event.pull_request.body;
        const prAuthor = event.pull_request.user.login;
        (0, core_1.info)(`Processing PR #${prNumber} in ${owner}/${repo}`);
        const config = await this.configProvider.fetch();
        const linkedIssues = this.detector.extractLinkedIssues(prBody, owner, repo);
        (0, core_1.info)(`Found ${linkedIssues.length} linked issues.`);
        const domainsToReview = new Set();
        for (const linked of linkedIssues) {
            const labels = await this.client.getIssueLabels(linked.owner, linked.repo, linked.issueNumber);
            const domains = this.detector.extractDomains(labels);
            domains.forEach(d => domainsToReview.add(d));
        }
        if (domainsToReview.size === 0) {
            (0, core_1.info)("No domains found in linked issues labels.");
            return;
        }
        (0, core_1.info)(`Domains found: ${Array.from(domainsToReview).join(", ")}`);
        const reviewersToAdd = new Set();
        for (const domain of domainsToReview) {
            const owners = config.domains[domain];
            if (owners) {
                const selected = this.selector.select(owners);
                selected.forEach(r => reviewersToAdd.add(r));
            }
            else {
                (0, core_1.warning)(`No owners defined for domain: ${domain}`);
            }
        }
        reviewersToAdd.delete(prAuthor);
        if (reviewersToAdd.size === 0) {
            (0, core_1.info)("No reviewers to add.");
            return;
        }
        (0, core_1.info)(`Adding reviewers: ${Array.from(reviewersToAdd).join(", ")}`);
        await this.client.requestReviewers(owner, repo, prNumber, Array.from(reviewersToAdd));
        (0, core_1.info)("Successfully added reviewers.");
    }
}
exports.DomainReviewerAction = DomainReviewerAction;
