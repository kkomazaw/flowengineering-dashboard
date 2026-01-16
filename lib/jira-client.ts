import { JiraIssue } from "@/types";

export class JiraClient {
  private baseUrl: string;
  private email: string;
  private apiToken: string;

  constructor(baseUrl: string, email: string, apiToken: string) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.apiToken = apiToken;
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString("base64")}`;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/rest/api/3${endpoint}`, {
      headers: {
        Authorization: this.getAuthHeader(),
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Jira API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchIssues(jql: string, maxResults = 100): Promise<JiraIssue[]> {
    const endpoint = `/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}`;
    const response = await this.fetch<{ issues: JiraIssue[] }>(endpoint);
    return response.issues;
  }

  async getIssuesByProject(
    projectKey: string,
    updatedSince?: Date
  ): Promise<JiraIssue[]> {
    let jql = `project = ${projectKey}`;

    if (updatedSince) {
      const dateStr = updatedSince.toISOString().split("T")[0];
      jql += ` AND updated >= "${dateStr}"`;
    }

    return this.searchIssues(jql);
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    const endpoint = `/issue/${issueKey}`;
    return this.fetch<JiraIssue>(endpoint);
  }

  async getIssueChangelog(issueKey: string): Promise<any> {
    const endpoint = `/issue/${issueKey}/changelog`;
    return this.fetch<any>(endpoint);
  }
}

export function createJiraClient(
  baseUrl?: string,
  email?: string,
  apiToken?: string
): JiraClient | null {
  const jiraUrl = baseUrl || process.env.NEXT_PUBLIC_JIRA_URL;
  const jiraEmail = email || process.env.NEXT_PUBLIC_JIRA_EMAIL;
  const jiraToken = apiToken || process.env.NEXT_PUBLIC_JIRA_API_TOKEN;

  if (!jiraUrl || !jiraEmail || !jiraToken) {
    console.warn("Jira credentials not fully provided");
    return null;
  }

  return new JiraClient(jiraUrl, jiraEmail, jiraToken);
}
