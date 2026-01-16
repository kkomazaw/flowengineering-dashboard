import { WorkItem, GitHubIssue, JiraIssue, VSMConfig } from "@/types";
import { createGitHubClient } from "./github-client";
import { createJiraClient } from "./jira-client";
import { transformGitHubIssue, transformJiraIssue } from "./data-transformer";

export interface DataSourceConfig {
  github?: {
    enabled: boolean;
    owner: string;
    repo: string;
    token?: string;
  };
  jira?: {
    enabled: boolean;
    projectKey: string;
    url?: string;
    email?: string;
    apiToken?: string;
  };
}

export class DataService {
  private config: DataSourceConfig;
  private vsmConfig: VSMConfig;

  constructor(config: DataSourceConfig, vsmConfig: VSMConfig) {
    this.config = config;
    this.vsmConfig = vsmConfig;
  }

  async fetchAllWorkItems(since?: Date): Promise<WorkItem[]> {
    const workItems: WorkItem[] = [];

    // Fetch from GitHub
    if (this.config.github?.enabled) {
      try {
        const githubItems = await this.fetchGitHubIssues(since);
        workItems.push(...githubItems);
      } catch (error) {
        console.error("Failed to fetch GitHub issues:", error);
        throw new Error(
          `GitHub API error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Fetch from Jira
    if (this.config.jira?.enabled) {
      try {
        const jiraItems = await this.fetchJiraIssues(since);
        workItems.push(...jiraItems);
      } catch (error) {
        console.error("Failed to fetch Jira issues:", error);
        throw new Error(
          `Jira API error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return workItems;
  }

  private async fetchGitHubIssues(since?: Date): Promise<WorkItem[]> {
    if (!this.config.github?.enabled) return [];

    const client = createGitHubClient(this.config.github.token);
    if (!client) {
      throw new Error("GitHub client initialization failed");
    }

    const { owner, repo } = this.config.github;
    const issues = await client.getIssues(owner, repo, "all", since);

    return issues.map((issue) => transformGitHubIssue(issue, this.vsmConfig));
  }

  private async fetchJiraIssues(since?: Date): Promise<WorkItem[]> {
    if (!this.config.jira?.enabled) return [];

    const client = createJiraClient(
      this.config.jira.url,
      this.config.jira.email,
      this.config.jira.apiToken
    );

    if (!client) {
      throw new Error("Jira client initialization failed");
    }

    const issues = await client.getIssuesByProject(
      this.config.jira.projectKey,
      since
    );

    // Fetch changelog for each issue to build stage history
    const workItems: WorkItem[] = [];
    for (const issue of issues) {
      const workItem = transformJiraIssue(issue, this.vsmConfig);

      // Fetch changelog to build accurate stage history
      try {
        const changelog = await client.getIssueChangelog(issue.key);
        workItem.stageHistory = this.buildStageHistoryFromChangelog(
          changelog,
          issue
        );
      } catch (error) {
        console.warn(`Failed to fetch changelog for ${issue.key}:`, error);
      }

      workItems.push(workItem);
    }

    return workItems;
  }

  private buildStageHistoryFromChangelog(changelog: any, issue: JiraIssue) {
    const history: any[] = [];

    if (!changelog.values) return history;

    let currentStageStart = new Date(issue.fields.created);

    for (const change of changelog.values) {
      const statusChanges = change.items.filter(
        (item: any) => item.field === "status"
      );

      for (const statusChange of statusChanges) {
        const changeDate = new Date(change.created);
        const fromStatus = statusChange.fromString;
        const toStatus = statusChange.toString;

        // Find stage for the status
        const stage = this.findStageForStatus(toStatus);

        if (stage) {
          history.push({
            stageId: stage.id,
            stageName: stage.name,
            enteredAt: changeDate,
            exitedAt: undefined,
            durationMs: changeDate.getTime() - currentStageStart.getTime(),
          });

          currentStageStart = changeDate;
        }
      }
    }

    return history;
  }

  private findStageForStatus(status: string): { id: string; name: string } | null {
    if (!this.vsmConfig.jiraMapping) return null;

    for (const [stageId, mapping] of Object.entries(this.vsmConfig.jiraMapping)) {
      if (mapping.statuses.includes(status)) {
        const stage = this.vsmConfig.stages.find((s) => s.id === stageId);
        return stage ? { id: stage.id, name: stage.name } : null;
      }
    }

    return null;
  }
}

export function createDataService(
  config: DataSourceConfig,
  vsmConfig: VSMConfig
): DataService {
  return new DataService(config, vsmConfig);
}

export function getDataSourceConfigFromEnv(): DataSourceConfig {
  return {
    github: {
      enabled: !!process.env.NEXT_PUBLIC_GITHUB_TOKEN,
      owner: process.env.NEXT_PUBLIC_GITHUB_ORG || "",
      repo: process.env.NEXT_PUBLIC_GITHUB_REPO || "",
      token: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
    },
    jira: {
      enabled:
        !!process.env.NEXT_PUBLIC_JIRA_URL &&
        !!process.env.NEXT_PUBLIC_JIRA_EMAIL &&
        !!process.env.NEXT_PUBLIC_JIRA_API_TOKEN,
      projectKey: process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY || "",
      url: process.env.NEXT_PUBLIC_JIRA_URL,
      email: process.env.NEXT_PUBLIC_JIRA_EMAIL,
      apiToken: process.env.NEXT_PUBLIC_JIRA_API_TOKEN,
    },
  };
}
