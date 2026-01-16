import { GitHubIssue, GitHubPullRequest } from "@/types";

export class GitHubClient {
  private token: string;
  private baseUrl = "https://api.github.com";

  constructor(token: string) {
    this.token = token;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getIssues(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "all",
    since?: Date
  ): Promise<GitHubIssue[]> {
    let endpoint = `/repos/${owner}/${repo}/issues?state=${state}&per_page=100`;

    if (since) {
      endpoint += `&since=${since.toISOString()}`;
    }

    return this.fetch<GitHubIssue[]>(endpoint);
  }

  async getPullRequests(
    owner: string,
    repo: string,
    state: "open" | "closed" | "all" = "all"
  ): Promise<GitHubPullRequest[]> {
    const endpoint = `/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`;
    return this.fetch<GitHubPullRequest[]>(endpoint);
  }

  async getIssueEvents(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<any[]> {
    const endpoint = `/repos/${owner}/${repo}/issues/${issueNumber}/events`;
    return this.fetch<any[]>(endpoint);
  }

  async getIssueTimeline(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<any[]> {
    const endpoint = `/repos/${owner}/${repo}/issues/${issueNumber}/timeline`;
    return this.fetch<any[]>(endpoint);
  }
}

export function createGitHubClient(token?: string): GitHubClient | null {
  const apiToken = token || process.env.NEXT_PUBLIC_GITHUB_TOKEN;

  if (!apiToken) {
    console.warn("GitHub token not provided");
    return null;
  }

  return new GitHubClient(apiToken);
}
