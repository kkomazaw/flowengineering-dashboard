# Flow Engineering Dashboard 設計書

## 1. 概要

### 1.1 目的
Flow Engineering Dashboard は、アプリケーション開発におけるバリューストリーム（価値の流れ）を可視化し、開発プロセスの効率性とボトルネックを特定するためのダッシュボードです。

### 1.2 主要な価値提供
- **可視性**: 開発プロセス全体の流れをリアルタイムで可視化
- **データ駆動**: GitHub/Jira から取得した実データに基づく分析
- **インタラクティブ**: ドリルダウンによる詳細分析
- **アクション可能**: ボトルネック特定と改善領域の明確化

## 2. システムアーキテクチャ

### 2.1 全体構成

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Next.js App (SSR/CSR)                  │  │
│  │                                                  │  │
│  │  ┌────────────────┐    ┌──────────────────┐    │  │
│  │  │   Components   │◄───┤  Zustand Store   │    │  │
│  │  │   (UI Layer)   │    │ (State Manager)  │    │  │
│  │  └────────┬───────┘    └────────┬─────────┘    │  │
│  │           │                     │              │  │
│  │           ▼                     ▼              │  │
│  │  ┌────────────────────────────────────────┐   │  │
│  │  │      Data Service Layer               │   │  │
│  │  │  ┌──────────┐  ┌───────────────────┐  │   │  │
│  │  │  │ Fetcher  │  │  Data Transformer │  │   │  │
│  │  │  └────┬─────┘  └─────────┬─────────┘  │   │  │
│  │  │       │                  │            │   │  │
│  │  │  ┌────▼──────┐  ┌────────▼────────┐  │   │  │
│  │  │  │  GitHub   │  │  Metrics        │  │   │  │
│  │  │  │  Client   │  │  Calculator     │  │   │  │
│  │  │  └────┬──────┘  └─────────────────┘  │   │  │
│  │  │       │                               │   │  │
│  │  │  ┌────▼──────┐                       │   │  │
│  │  │  │   Jira    │                       │   │  │
│  │  │  │  Client   │                       │   │  │
│  │  │  └───────────┘                       │   │  │
│  │  └────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │          │
                         ▼          ▼
            ┌────────────────┐  ┌────────────────┐
            │  GitHub API    │  │   Jira API     │
            │  (REST)        │  │   (REST)       │
            └────────────────┘  └────────────────┘
```

### 2.2 レイヤー構成

#### 2.2.1 プレゼンテーション層 (Components)
- **責務**: UI の描画とユーザーインタラクションの処理
- **主要コンポーネント**:
  - `ValueStreamDashboard`: ルートコンポーネント
  - `ValueStreamFlow`: バリューストリーム図
  - `MetricsCards`: メトリクスカード群
  - `FlowCharts`: Flow Distribution/Contribution
  - フィルターコンポーネント群
  - モーダルコンポーネント群

#### 2.2.2 状態管理層 (Zustand Store)
- **責務**: グローバル状態の管理と更新
- **管理する状態**:
  - 作業アイテムデータ
  - フィルター設定
  - UI 状態（選択中のステージ、モーダル表示状態等）
  - エラー状態とローディング状態

#### 2.2.3 ビジネスロジック層 (Data Service & Transformers)
- **責務**: データの取得、変換、計算
- **主要モジュール**:
  - `data-service.ts`: データ取得のオーケストレーション
  - `data-transformer.ts`: API レスポンスから内部モデルへの変換
  - `metrics.ts`: 各種メトリクスの計算ロジック

#### 2.2.4 インフラ層 (API Clients)
- **責務**: 外部 API との通信
- **主要モジュール**:
  - `github-client.ts`: GitHub REST API クライアント
  - `jira-client.ts`: Jira REST API クライアント

## 3. データモデル

### 3.1 コアエンティティ

#### 3.1.1 WorkItem (作業アイテム)
```typescript
interface WorkItem {
  id: string;                    // 一意識別子
  title: string;                 // タイトル
  type: string;                  // タイプ (Feature, Bug, Task等)
  status: string;                // 現在のステータス
  currentStage: string;          // 現在のステージ
  assignee?: string;             // 担当者
  team?: string;                 // チーム
  labels: string[];              // ラベル
  estimateSize?: string;         // 見積もりサイズ (S/M/L)
  createdAt: Date;               // 作成日時
  startedAt?: Date;              // 作業開始日時
  completedAt?: Date;            // 完了日時
  stageHistory: StageHistory[];  // ステージ履歴
  source: 'github' | 'jira';     // データソース
  sourceUrl: string;             // 元データへのURL
}
```

#### 3.1.2 StageHistory (ステージ履歴)
```typescript
interface StageHistory {
  stage: string;                 // ステージ名
  enteredAt: Date;               // 入場日時
  exitedAt?: Date;               // 退場日時
  duration?: number;             // 滞留時間（ミリ秒）
}
```

#### 3.1.3 VSMConfig (バリューストリーム設定)
```typescript
interface VSMConfig {
  stages: VSMStage[];            // ステージ定義のリスト
}

interface VSMStage {
  id: string;                    // ステージID
  name: string;                  // ステージ名
  color: string;                 // 表示色
  githubStatuses: string[];      // マッピングするGitHubステータス
  jiraStatuses: string[];        // マッピングするJiraステータス
}
```

### 3.2 メトリクスモデル

#### 3.2.1 VSMMetrics (全体メトリクス)
```typescript
interface VSMMetrics {
  leadTime: number;              // 平均リードタイム (日)
  cycleTime: number;             // 平均サイクルタイム (日)
  flowEfficiency: number;        // フロー効率 (%)
  throughput: number;            // スループット (個/期間)

  stageMetrics: StageMetrics[];  // ステージ別メトリクス
  flowDistribution: FlowDistribution[];  // Flow Distribution
  flowContribution: FlowContribution[];  // Flow Contribution
}
```

#### 3.2.2 StageMetrics (ステージメトリクス)
```typescript
interface StageMetrics {
  stageId: string;               // ステージID
  stageName: string;             // ステージ名
  averageTime: number;           // 平均滞留時間 (日)
  wip: number;                   // 仕掛り量 (WIP)
  throughput: number;            // スループット
  transitionEfficiency: number;  // 遷移効率 (%)
  items: WorkItem[];             // 該当アイテム
}
```

## 4. データフロー

### 4.1 初期データロードフロー

```
User Action: ページアクセス
     ↓
ValueStreamDashboard マウント
     ↓
useEffect: fetchData() 呼び出し
     ↓
Store: setLoading(true)
     ↓
DataService.fetchWorkItems()
     ├→ GitHubClient.getIssues()
     │    └→ GitHub API リクエスト
     │         └→ レスポンス受信
     └→ JiraClient.getIssues()
          └→ Jira API リクエスト
               └→ レスポンス受信
     ↓
DataTransformer.transformToWorkItems()
     ├→ GitHub イシューを WorkItem に変換
     ├→ Jira イシューを WorkItem に変換
     ├→ ステージマッピング適用
     └→ ステージ履歴の構築
     ↓
MetricsCalculator.calculateMetrics()
     ├→ Lead Time 計算
     ├→ Cycle Time 計算
     ├→ Flow Efficiency 計算
     ├→ Throughput 計算
     ├→ ステージ別メトリクス計算
     ├→ Flow Distribution 計算
     └→ Flow Contribution 計算
     ↓
Store: setWorkItems(items)
Store: setMetrics(metrics)
Store: setLoading(false)
     ↓
Components: 再レンダリング
     └→ UI 更新
```

### 4.2 フィルター適用フロー

```
User Action: フィルター変更
     ↓
Store: setFilters(newFilters)
     ↓
Computed: filteredItems = applyFilters(workItems, filters)
     ↓
Computed: filteredMetrics = calculateMetrics(filteredItems)
     ↓
Components: 再レンダリング
     └→ UI 更新（フィルター適用結果を表示）
```

### 4.3 ドリルダウンフロー

```
User Action: ステージクリック
     ↓
Store: setSelectedStage(stageId)
     ↓
StageDetailModal: オープン
     ├→ filteredItems から該当ステージのアイテムを抽出
     └→ アイテムリスト表示
     ↓
User Action: アイテムクリック
     ↓
Store: setSelectedItem(itemId)
     ↓
WorkItemDetailModal: オープン
     ├→ アイテム詳細情報表示
     ├→ Lead Time / Cycle Time 表示
     └→ ステージ履歴タイムライン表示
```

## 5. UI/UX 設計

### 5.1 レイアウト構成

```
┌────────────────────────────────────────────────────────┐
│  Header: タイトル + リフレッシュボタン + 最終更新時刻   │
├────────────────────────────────────────────────────────┤
│  Filters Section                                       │
│  ┌──────────────┐  ┌──────────────────────────────┐  │
│  │ Date Range   │  │ Advanced Filters             │  │
│  │ Picker       │  │ (Work Type, Team, Size)      │  │
│  └──────────────┘  └──────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  Metrics Cards (4列グリッド)                          │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│  │ Lead  │ │ Cycle │ │ Flow  │ │Through│            │
│  │ Time  │ │ Time  │ │Effi.  │ │ put   │            │
│  └───────┘ └───────┘ └───────┘ └───────┘            │
├────────────────────────────────────────────────────────┤
│  Value Stream Flow Diagram                            │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐    │
│  │Disc│─▶│Rdcy│─▶│Bld │─▶│Test│─▶│Rels│─▶│Done│    │
│  │ovry│  │Bklg│  │    │  │    │  │    │  │    │    │
│  └────┘  └────┘  └────┘  └────┘  └────┘  └────┘    │
│  (各ステージ: 平均時間、WIP、遷移効率を表示)         │
├────────────────────────────────────────────────────────┤
│  Charts Section (2列グリッド)                         │
│  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │ Flow Distribution   │  │ Flow Contribution   │    │
│  │ (ラベル別)          │  │ (チーム/担当者別)   │    │
│  │                     │  │                     │    │
│  │  [Bar Chart]        │  │  [Bar Chart]        │    │
│  │                     │  │                     │    │
│  └─────────────────────┘  └─────────────────────┘    │
└────────────────────────────────────────────────────────┘
```

### 5.2 インタラクションデザイン

#### 5.2.1 ステージドリルダウン
- **トリガー**: バリューストリーム図のステージボックスをクリック
- **アクション**: モーダルでステージ内のアイテム一覧を表示
- **情報**: アイテムID、タイトル、タイプ、担当者、滞留時間

#### 5.2.2 アイテム詳細
- **トリガー**: ステージ詳細モーダル内のアイテムをクリック
- **アクション**: アイテム詳細モーダルを表示
- **情報**:
  - 基本情報（タイトル、タイプ、担当者、チーム、ラベル等）
  - メトリクス（Lead Time、Cycle Time）
  - ステージ履歴タイムライン

#### 5.2.3 フィルタリング
- **日付範囲フィルター**: カレンダーピッカーで期間指定
- **高度なフィルター**:
  - Work Type: マルチセレクト (Feature, Bug, Task等)
  - Team: マルチセレクト
  - Estimate Size: マルチセレクト (S, M, L)
- **適用**: リアルタイムでメトリクスとビジュアライゼーションを更新

### 5.3 カラースキーム

- **ステージカラー**:
  - Discovery: `bg-purple-100 border-purple-300`
  - Ready Backlog: `bg-blue-100 border-blue-300`
  - Build: `bg-yellow-100 border-yellow-300`
  - Test: `bg-orange-100 border-orange-300`
  - Release: `bg-green-100 border-green-300`
  - Done: `bg-gray-100 border-gray-300`

- **メトリクスカラー**:
  - プライマリメトリクス: `text-3xl font-bold text-gray-900`
  - セカンダリメトリクス: `text-sm text-gray-600`

- **インタラクション**:
  - ホバー: `hover:shadow-lg transition-shadow`
  - クリック可能: `cursor-pointer`

## 6. API 統合設計

### 6.1 GitHub API 統合

#### 6.1.1 認証
- **方式**: Personal Access Token (PAT)
- **環境変数**: `NEXT_PUBLIC_GITHUB_TOKEN`

#### 6.1.2 エンドポイント
```
GET /repos/{owner}/{repo}/issues
  - パラメータ:
    - state: all
    - per_page: 100
    - page: 1..N
  - レスポンス: Issue[]
```

#### 6.1.3 レート制限
- **制限**: 5000 requests/hour (認証済み)
- **対策**:
  - キャッシュ機構（今後実装予定）
  - リフレッシュ頻度の制御

### 6.2 Jira API 統合

#### 6.2.1 認証
- **方式**: Basic Auth (Email + API Token)
- **環境変数**:
  - `NEXT_PUBLIC_JIRA_URL`
  - `NEXT_PUBLIC_JIRA_EMAIL`
  - `NEXT_PUBLIC_JIRA_API_TOKEN`

#### 6.2.2 エンドポイント
```
GET /rest/api/3/search
  - パラメータ:
    - jql: project={projectKey}
    - maxResults: 100
    - startAt: 0..N
    - expand: changelog
  - レスポンス: SearchResults
```

#### 6.2.3 変更履歴の活用
- **changelog** を使用してステータス遷移履歴を取得
- ステージ履歴の構築に利用

### 6.3 エラーハンドリング

```typescript
try {
  const data = await apiClient.fetch();
  return data;
} catch (error) {
  if (error.response?.status === 401) {
    // 認証エラー
    store.setError('認証に失敗しました。APIトークンを確認してください。');
  } else if (error.response?.status === 403) {
    // 権限エラー
    store.setError('アクセス権限がありません。');
  } else if (error.response?.status === 404) {
    // リソース不存在
    store.setError('リポジトリまたはプロジェクトが見つかりません。');
  } else {
    // その他のエラー
    store.setError('データの取得に失敗しました。');
  }
  throw error;
}
```

## 7. 状態管理設計

### 7.1 Zustand Store 構造

```typescript
interface DashboardStore {
  // Data
  workItems: WorkItem[];
  metrics: VSMMetrics | null;
  vsmConfig: VSMConfig;

  // Filters
  filters: {
    dateRange: { start: Date; end: Date };
    workTypes: string[];
    teams: string[];
    estimateSizes: string[];
  };

  // UI State
  selectedStage: string | null;
  selectedItem: WorkItem | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  setWorkItems: (items: WorkItem[]) => void;
  setMetrics: (metrics: VSMMetrics) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setSelectedStage: (stageId: string | null) => void;
  setSelectedItem: (item: WorkItem | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Computed (Selectors)
  getFilteredItems: () => WorkItem[];
  getFilteredMetrics: () => VSMMetrics;
  getStageItems: (stageId: string) => WorkItem[];
}
```

### 7.2 Computed Values

フィルター適用後のデータは、都度計算する方式を採用:

```typescript
const getFilteredItems = () => {
  const { workItems, filters } = get();

  return workItems.filter(item => {
    // 日付範囲フィルター
    const inDateRange = isWithinInterval(item.createdAt, {
      start: filters.dateRange.start,
      end: filters.dateRange.end,
    });

    // Work Type フィルター
    const matchesWorkType = filters.workTypes.length === 0 ||
      filters.workTypes.includes(item.type);

    // Team フィルター
    const matchesTeam = filters.teams.length === 0 ||
      (item.team && filters.teams.includes(item.team));

    // Estimate Size フィルター
    const matchesSize = filters.estimateSizes.length === 0 ||
      (item.estimateSize && filters.estimateSizes.includes(item.estimateSize));

    return inDateRange && matchesWorkType && matchesTeam && matchesSize;
  });
};
```

## 8. メトリクス計算ロジック

### 8.1 Lead Time (リードタイム)

**定義**: アイテムが作成されてから完了するまでの時間

```typescript
function calculateLeadTime(item: WorkItem): number | null {
  if (!item.completedAt) return null;
  return differenceInDays(item.completedAt, item.createdAt);
}

function calculateAverageLeadTime(items: WorkItem[]): number {
  const completedItems = items.filter(i => i.completedAt);
  const leadTimes = completedItems.map(calculateLeadTime).filter(t => t !== null);

  if (leadTimes.length === 0) return 0;
  return leadTimes.reduce((sum, t) => sum + t, 0) / leadTimes.length;
}
```

### 8.2 Cycle Time (サイクルタイム)

**定義**: アイテムの作業が開始されてから完了するまでの時間

```typescript
function calculateCycleTime(item: WorkItem): number | null {
  if (!item.completedAt || !item.startedAt) return null;
  return differenceInDays(item.completedAt, item.startedAt);
}

function calculateAverageCycleTime(items: WorkItem[]): number {
  const completedItems = items.filter(i => i.completedAt && i.startedAt);
  const cycleTimes = completedItems.map(calculateCycleTime).filter(t => t !== null);

  if (cycleTimes.length === 0) return 0;
  return cycleTimes.reduce((sum, t) => sum + t, 0) / cycleTimes.length;
}
```

### 8.3 Flow Efficiency (フロー効率)

**定義**: アクティブ作業時間 / 総サイクルタイム

```typescript
function calculateFlowEfficiency(items: WorkItem[], vsmConfig: VSMConfig): number {
  const activeStages = ['Build', 'Test']; // アクティブ作業ステージ

  let totalActiveTime = 0;
  let totalCycleTime = 0;

  items.forEach(item => {
    const cycleTime = calculateCycleTime(item);
    if (!cycleTime) return;

    totalCycleTime += cycleTime;

    const activeTime = item.stageHistory
      .filter(h => activeStages.includes(h.stage) && h.duration)
      .reduce((sum, h) => sum + (h.duration || 0), 0);

    totalActiveTime += activeTime;
  });

  if (totalCycleTime === 0) return 0;
  return (totalActiveTime / totalCycleTime) * 100;
}
```

### 8.4 Throughput (スループット)

**定義**: 期間内に完了したアイテム数

```typescript
function calculateThroughput(items: WorkItem[], startDate: Date, endDate: Date): number {
  return items.filter(item =>
    item.completedAt &&
    isWithinInterval(item.completedAt, { start: startDate, end: endDate })
  ).length;
}
```

### 8.5 ステージメトリクス

```typescript
function calculateStageMetrics(
  items: WorkItem[],
  stage: VSMStage
): StageMetrics {
  const stageItems = items.filter(i =>
    i.stageHistory.some(h => h.stage === stage.id)
  );

  const currentWIP = items.filter(i => i.currentStage === stage.id).length;

  const stageDurations = stageItems
    .flatMap(i => i.stageHistory.filter(h => h.stage === stage.id))
    .map(h => h.duration)
    .filter(d => d !== undefined);

  const averageTime = stageDurations.length > 0
    ? stageDurations.reduce((sum, d) => sum + d, 0) / stageDurations.length
    : 0;

  // 遷移効率: 次のステージに進んだアイテムの割合
  const transitionedItems = stageItems.filter(item => {
    const stageIndex = item.stageHistory.findIndex(h => h.stage === stage.id);
    return stageIndex >= 0 && stageIndex < item.stageHistory.length - 1;
  });

  const transitionEfficiency = stageItems.length > 0
    ? (transitionedItems.length / stageItems.length) * 100
    : 100;

  return {
    stageId: stage.id,
    stageName: stage.name,
    averageTime: averageTime / (1000 * 60 * 60 * 24), // ミリ秒 → 日
    wip: currentWIP,
    throughput: transitionedItems.length,
    transitionEfficiency,
    items: stageItems,
  };
}
```

## 9. 今後の拡張性

### 9.1 Phase 3: カスタマイズ機能

#### 9.1.1 UI でのステージ定義カスタマイズ
- ステージ設定画面の追加
- ドラッグ&ドロップでステージの順序変更
- ステージの追加/削除/編集
- GitHub/Jira ステータスマッピングの GUI 設定

#### 9.1.2 設定のエクスポート/インポート
```typescript
interface VSMConfigExport {
  version: string;
  name: string;
  description?: string;
  config: VSMConfig;
  createdAt: Date;
}

// エクスポート
function exportConfig(config: VSMConfig): string {
  const exportData: VSMConfigExport = {
    version: '1.0.0',
    name: 'Custom VSM Config',
    config,
    createdAt: new Date(),
  };
  return JSON.stringify(exportData, null, 2);
}

// インポート
function importConfig(jsonString: string): VSMConfig {
  const importData: VSMConfigExport = JSON.parse(jsonString);
  // バリデーション
  validateConfig(importData.config);
  return importData.config;
}
```

### 9.2 Phase 4: 認証・権限

#### 9.2.1 SSO 認証連携
- NextAuth.js を使用した認証基盤
- Google, GitHub, Okta プロバイダーのサポート
- セッション管理

#### 9.2.2 ロールベースアクセス制御 (RBAC)
```typescript
enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'delete')[];
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    { resource: 'vsm-config', actions: ['read', 'write', 'delete'] },
    { resource: 'data', actions: ['read', 'write'] },
    { resource: 'users', actions: ['read', 'write', 'delete'] },
  ],
  [Role.MANAGER]: [
    { resource: 'vsm-config', actions: ['read', 'write'] },
    { resource: 'data', actions: ['read', 'write'] },
    { resource: 'users', actions: ['read'] },
  ],
  [Role.MEMBER]: [
    { resource: 'vsm-config', actions: ['read'] },
    { resource: 'data', actions: ['read', 'write'] },
  ],
  [Role.VIEWER]: [
    { resource: 'vsm-config', actions: ['read'] },
    { resource: 'data', actions: ['read'] },
  ],
};
```

### 9.3 Phase 5: 高度な分析

#### 9.3.1 トレンド分析
- 時系列グラフでメトリクスの推移を可視化
- 週次/月次のトレンド分析
- Chart.js または Recharts の導入

#### 9.3.2 ボトルネック自動検出
```typescript
interface BottleneckDetection {
  stageId: string;
  stageName: string;
  severity: 'high' | 'medium' | 'low';
  indicators: {
    highWIP: boolean;           // WIPが多い
    longAverageTime: boolean;   // 平均時間が長い
    lowTransitionRate: boolean; // 遷移率が低い
  };
  suggestions: string[];
}

function detectBottlenecks(metrics: VSMMetrics): BottleneckDetection[] {
  // ステージ別メトリクスを分析
  // WIP、平均時間、遷移効率からボトルネックを検出
}
```

#### 9.3.3 予測分析
- 機械学習モデルを使用した完了予測日の算出
- Monte Carlo シミュレーションによる確率的予測

## 10. パフォーマンス最適化

### 10.1 現在の最適化
- Zustand による効率的な状態管理
- React の useMemo/useCallback による再計算の抑制

### 10.2 今後の最適化計画
- **データキャッシュ**: SWR または React Query の導入
- **仮想スクロール**: 大量アイテムの効率的なレンダリング
- **増分ロード**: ページネーションまたは無限スクロール
- **Web Worker**: メトリクス計算の並列化

## 11. セキュリティ考慮事項

### 11.1 現在の対策
- 環境変数による認証情報の管理
- HTTPS 通信の使用

### 11.2 今後の強化
- API キーの暗号化保存
- CORS 設定の厳格化
- CSP (Content Security Policy) の導入
- レート制限の実装

## 12. テスト戦略

### 12.1 ユニットテスト
- メトリクス計算ロジックのテスト (Jest)
- データ変換ロジックのテスト
- ユーティリティ関数のテスト

### 12.2 統合テスト
- API クライアントのテスト (Mock Service Worker)
- データフローの end-to-end テスト

### 12.3 E2E テスト
- Playwright または Cypress によるブラウザテスト
- 主要ユーザーフローのテスト

## 13. デプロイメント

### 13.1 Vercel デプロイ
- Git プッシュによる自動デプロイ
- プレビュー環境の自動生成
- 環境変数の管理

### 13.2 CI/CD パイプライン
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## 14. まとめ

このダッシュボードは、バリューストリームマッピングの概念をソフトウェア開発プロセスに適用し、データ駆動型の継続的改善を支援します。モジュラーなアーキテクチャと拡張性を重視した設計により、将来的な機能追加にも柔軟に対応できます。
