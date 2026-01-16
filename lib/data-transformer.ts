import {
  WorkItem,
  GitHubIssue,
  JiraIssue,
  WorkType,
  StageTransition,
  VSMConfig,
} from "@/types";

export function transformGitHubIssue(
  issue: GitHubIssue,
  config: VSMConfig
): WorkItem {
  const labels = issue.labels.map((l) => l.name);
  const currentStage = mapGitHubStatusToStage(issue.state, labels, config);

  return {
    id: `gh-${issue.id}`,
    key: `#${issue.number}`,
    title: issue.title,
    type: inferWorkType(labels),
    status: issue.state,
    currentStage: currentStage,
    labels: labels,
    assignee: issue.assignee?.login,
    createdAt: new Date(issue.created_at),
    completedAt: issue.closed_at ? new Date(issue.closed_at) : undefined,
    stageHistory: buildStageHistoryFromGitHub(issue, config),
  };
}

export function transformJiraIssue(
  issue: JiraIssue,
  config: VSMConfig
): WorkItem {
  const currentStage = mapJiraStatusToStage(
    issue.fields.status.name,
    config
  );

  return {
    id: `jira-${issue.id}`,
    key: issue.key,
    title: issue.fields.summary,
    type: inferWorkTypeFromJira(issue.fields.issuetype.name),
    status: issue.fields.status.name,
    currentStage: currentStage,
    labels: issue.fields.labels,
    assignee: issue.fields.assignee?.displayName,
    team: issue.fields.customfield_team,
    initiative: issue.fields.customfield_initiative,
    createdAt: new Date(issue.fields.created),
    completedAt: issue.fields.resolutiondate
      ? new Date(issue.fields.resolutiondate)
      : undefined,
    stageHistory: [], // Will be populated from changelog
  };
}

function mapGitHubStatusToStage(
  state: string,
  labels: string[],
  config: VSMConfig
): string {
  if (!config.githubMapping) {
    return state === "closed" ? "done" : "in-progress";
  }

  for (const [stageId, mapping] of Object.entries(config.githubMapping)) {
    if (mapping.statuses?.includes(state)) {
      return stageId;
    }

    if (mapping.labels) {
      const hasMatchingLabel = mapping.labels.some((label) =>
        labels.includes(label)
      );
      if (hasMatchingLabel) {
        return stageId;
      }
    }
  }

  return "discovery";
}

function mapJiraStatusToStage(status: string, config: VSMConfig): string {
  if (!config.jiraMapping) {
    return "discovery";
  }

  for (const [stageId, mapping] of Object.entries(config.jiraMapping)) {
    if (mapping.statuses.includes(status)) {
      return stageId;
    }
  }

  return "discovery";
}

function inferWorkType(labels: string[]): WorkType {
  const labelStr = labels.join(" ").toLowerCase();

  if (labelStr.includes("bug") || labelStr.includes("fix")) {
    return "bug";
  }
  if (labelStr.includes("tech") || labelStr.includes("debt")) {
    return "tech-debt";
  }
  if (labelStr.includes("spike") || labelStr.includes("research")) {
    return "spike";
  }
  if (
    labelStr.includes("feature") ||
    labelStr.includes("enhancement") ||
    labelStr.includes("new")
  ) {
    return "feature";
  }

  return "other";
}

function inferWorkTypeFromJira(issueType: string): WorkType {
  const type = issueType.toLowerCase();

  if (type.includes("bug")) return "bug";
  if (type.includes("tech") || type.includes("debt")) return "tech-debt";
  if (type.includes("spike")) return "spike";
  if (type.includes("story") || type.includes("feature")) return "feature";

  return "other";
}

function buildStageHistoryFromGitHub(
  issue: GitHubIssue,
  config: VSMConfig
): StageTransition[] {
  const history: StageTransition[] = [];
  const createdStage = config.stages[0];

  history.push({
    stageId: createdStage.id,
    stageName: createdStage.name,
    enteredAt: new Date(issue.created_at),
    exitedAt: issue.closed_at ? new Date(issue.closed_at) : undefined,
  });

  if (issue.closed_at) {
    const doneStage = config.stages[config.stages.length - 1];
    history.push({
      stageId: doneStage.id,
      stageName: doneStage.name,
      enteredAt: new Date(issue.closed_at),
    });
  }

  return history;
}

export function getDefaultVSMConfig(): VSMConfig {
  return {
    id: "default",
    name: "Default Value Stream",
    stages: [
      { id: "discovery", name: "Discovery", order: 0 },
      { id: "ready-backlog", name: "Ready Backlog", order: 1 },
      { id: "build", name: "Build", order: 2 },
      { id: "test", name: "Test", order: 3 },
      { id: "release", name: "Release", order: 4 },
      { id: "done", name: "Done", order: 5 },
    ],
    githubMapping: {
      discovery: { statuses: ["open"], labels: ["discovery", "backlog"] },
      build: { labels: ["in-progress", "development"] },
      test: { labels: ["testing", "review"] },
      done: { statuses: ["closed"] },
    },
    jiraMapping: {
      discovery: { statuses: ["To Do", "Backlog"] },
      "ready-backlog": { statuses: ["Ready"] },
      build: { statuses: ["In Progress", "Development"] },
      test: { statuses: ["Testing", "Review", "QA"] },
      release: { statuses: ["Ready for Release", "Staging"] },
      done: { statuses: ["Done", "Closed", "Resolved"] },
    },
  };
}
