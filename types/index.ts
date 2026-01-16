// Value Stream Stage
export interface Stage {
  id: string;
  name: string;
  order: number;
  description?: string;
}

// Issue/Work Item
export interface WorkItem {
  id: string;
  key: string; // JIRA-123, Issue #456 etc.
  title: string;
  type: WorkType;
  status: string;
  currentStage: string;
  labels: string[];
  assignee?: string;
  team?: string;
  estimateSize?: EstimateSize;
  initiative?: string;
  product?: string;
  createdAt: Date;
  startedAt?: Date; // When work actually started
  completedAt?: Date;
  stageHistory: StageTransition[];
}

// Stage transition history
export interface StageTransition {
  stageId: string;
  stageName: string;
  enteredAt: Date;
  exitedAt?: Date;
  durationMs?: number;
}

// Work types
export type WorkType = 'feature' | 'bug' | 'tech-debt' | 'spike' | 'other';

// Estimate sizes
export type EstimateSize = 'xs' | 's' | 'm' | 'l' | 'xl';

// Value Stream Metrics
export interface ValueStreamMetrics {
  leadTime: number; // in days
  cycleTime: number; // in days
  leadTimeForChanges: number; // in days
  flowEfficiency: number; // percentage (0-100)
  throughput: number; // count
  stageMetrics: StageMetrics[];
}

// Metrics per stage
export interface StageMetrics {
  stageId: string;
  stageName: string;
  averageTimeInStage: number; // in days
  workInProgress: number; // count
  transitionEfficiency: number; // percentage (0-100)
  completedItems: number;
}

// Flow Distribution (by label/category)
export interface FlowDistribution {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

// Flow Contribution (by team/assignee)
export interface FlowContribution {
  contributor: string; // team name or person
  count: number;
  percentage: number;
  color: string;
}

// Filters
export interface DashboardFilters {
  valueStream?: string;
  workTypes: WorkType[];
  subTeams: string[];
  estimateSizes: EstimateSize[];
  issueTypes: string[];
  initiatives: string[];
  products: string[];
  dateRange: DateRange;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// VSM Configuration
export interface VSMConfig {
  id: string;
  name: string;
  stages: Stage[];
  githubMapping?: GitHubStageMapping;
  jiraMapping?: JiraStageMapping;
}

// Stored VSM Configuration (for persistence)
export interface StoredVSMConfig {
  id: string;
  name: string;
  description?: string;
  config: VSMConfig;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// VSM Config Export/Import format
export interface VSMConfigExport {
  version: string;
  name: string;
  description?: string;
  config: VSMConfig;
  createdAt: string;
}

// Mapping configuration
export interface GitHubStageMapping {
  [stageId: string]: {
    statuses?: string[];
    labels?: string[];
  };
}

export interface JiraStageMapping {
  [stageId: string]: {
    statuses: string[];
  };
}

// API Response types
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: string;
  labels: Array<{ name: string }>;
  assignee?: { login: string };
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  merged_at?: string;
  closed_at?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: { name: string };
    status: { name: string };
    labels: string[];
    assignee?: { displayName: string };
    created: string;
    updated: string;
    resolutiondate?: string;
    customfield_team?: string;
    customfield_initiative?: string;
  };
}

// Authentication & Authorization
export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  MEMBER = "member",
  VIEWER = "viewer",
}

export enum Permission {
  READ_DASHBOARD = "dashboard:read",
  WRITE_DASHBOARD = "dashboard:write",
  MANAGE_CONFIG = "config:manage",
  MANAGE_USERS = "users:manage",
  VIEW_ANALYTICS = "analytics:view",
  EXPORT_DATA = "data:export",
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  teams?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: string;
}
