# Flow Engineering Dashboard 開発計画書

## 1. 開発概要

### 1.1 プロジェクトゴール
GitHub と Jira からデータを取得し、アプリケーション開発のバリューストリームを可視化する、インタラクティブなダッシュボードを構築する。

### 1.2 現在の状況
- ✅ **Phase 1**: 基本機能（完了）
- ✅ **Phase 2**: 分析・インタラクティブ機能（完了）
- 🔄 **Phase 3**: カスタマイズ機能（計画中）
- 📋 **Phase 4**: 認証・権限（計画中）
- 📋 **Phase 5**: 高度な分析（計画中）

### 1.3 技術スタック
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Visualization**: カスタムコンポーネント + Chart.js (Phase 5)
- **API**: GitHub REST API, Jira REST API
- **Testing**: Jest, React Testing Library, Playwright
- **CI/CD**: GitHub Actions, Vercel

## 2. Phase 1: 基本機能（完了）

### 2.1 実装済み機能
- [x] プロジェクト初期セットアップ
- [x] バリューストリーム図コンポーネント
- [x] メトリクスカード（Lead Time, Cycle Time, Flow Efficiency, Throughput）
- [x] Flow Distribution チャート
- [x] Flow Contribution チャート
- [x] 日付範囲フィルター
- [x] 基本的なデータ取得とメトリクス計算

### 2.2 成果物
- `components/ValueStreamDashboard.tsx`
- `components/ValueStreamFlow.tsx`
- `components/MetricsCards.tsx`
- `components/FlowCharts.tsx`
- `components/DateRangeFilter.tsx`
- `lib/metrics.ts`
- `types/index.ts`

## 3. Phase 2: 分析・インタラクティブ機能（完了）

### 3.1 実装済み機能
- [x] ステージ別ドリルダウン機能
- [x] 個別イシュー詳細表示
- [x] 高度なフィルター（Work Type, Team, Estimate Size）
- [x] データリフレッシュ機能
- [x] エラーハンドリングとローディング状態
- [x] GitHub/Jira API 統合基盤
- [x] Zustand による状態管理

### 3.2 成果物
- `components/StageDetailModal.tsx`
- `components/WorkItemDetailModal.tsx`
- `components/AdvancedFilters.tsx`
- `components/RefreshButton.tsx`
- `components/ErrorBanner.tsx`
- `components/LoadingSkeleton.tsx`
- `lib/github-client.ts`
- `lib/jira-client.ts`
- `lib/data-service.ts`
- `lib/data-transformer.ts`
- `store/dashboard-store.ts`

## 4. Phase 3: カスタマイズ機能

### 4.1 目標
ユーザーが独自のバリューストリーム定義を作成・管理できるようにする。

### 4.2 タスク一覧

#### 4.2.1 VSM 設定管理機能
- [ ] **Task 3.1.1**: VSM 設定データモデルの拡張
  - 現在の `VSMConfig` を永続化可能な形式に拡張
  - バリデーションスキーマの定義
  - デフォルト設定とカスタム設定の分離

- [ ] **Task 3.1.2**: 設定保存・読込機能の実装
  - LocalStorage への設定保存
  - 設定の読み込みと適用
  - 設定リストの管理（複数プリセット対応）

#### 4.2.2 ステージ定義カスタマイズ UI
- [ ] **Task 3.2.1**: 設定画面のルート追加
  - `/settings` ページの作成
  - 設定画面へのナビゲーション

- [ ] **Task 3.2.2**: ステージエディターコンポーネント
  - ステージ一覧表示
  - ステージ追加/編集/削除 UI
  - ステージプロパティ編集フォーム
    - ステージ名
    - カラー選択
    - GitHub ステータスマッピング
    - Jira ステータスマッピング

- [ ] **Task 3.2.3**: ドラッグ&ドロップでステージ順序変更
  - `@dnd-kit/core` または `react-beautiful-dnd` の導入
  - ドラッグ可能なステージリストの実装
  - 順序変更の永続化

#### 4.2.3 設定のエクスポート/インポート
- [ ] **Task 3.3.1**: エクスポート機能
  - JSON/YAML 形式でのエクスポート
  - ファイルダウンロード機能
  - エクスポートデータのバージョニング

- [ ] **Task 3.3.2**: インポート機能
  - ファイルアップロード UI
  - JSON/YAML パーサー
  - インポートデータのバリデーション
  - エラーハンドリングとユーザーフィードバック

- [ ] **Task 3.3.3**: プリセット管理
  - プリセットの保存・命名
  - プリセット一覧表示
  - プリセットの切り替え
  - プリセットの削除

#### 4.2.4 カスタムメトリクス
- [ ] **Task 3.4.1**: カスタムメトリクス定義機能
  - メトリクス定義スキーマの設計
  - 計算式エディター（簡易版）
  - サポートする集計関数の定義

- [ ] **Task 3.4.2**: カスタムメトリクス表示
  - メトリクスカードへのカスタムメトリクス統合
  - 動的メトリクス計算エンジン

### 4.3 技術的考慮事項

#### 4.3.1 データ永続化
```typescript
// LocalStorage ベースの実装
interface StoredVSMConfig {
  id: string;
  name: string;
  description?: string;
  config: VSMConfig;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class VSMConfigStorage {
  private static STORAGE_KEY = 'vsm_configs';

  static save(config: StoredVSMConfig): void {
    const configs = this.loadAll();
    const index = configs.findIndex(c => c.id === config.id);

    if (index >= 0) {
      configs[index] = { ...config, updatedAt: new Date() };
    } else {
      configs.push(config);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
  }

  static loadAll(): StoredVSMConfig[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getDefault(): StoredVSMConfig | null {
    const configs = this.loadAll();
    return configs.find(c => c.isDefault) || null;
  }
}
```

#### 4.3.2 バリデーション
```typescript
import { z } from 'zod';

const VSMStageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().regex(/^(bg|border)-/),
  githubStatuses: z.array(z.string()),
  jiraStatuses: z.array(z.string()),
});

const VSMConfigSchema = z.object({
  stages: z.array(VSMStageSchema).min(1),
});

function validateConfig(config: unknown): VSMConfig {
  return VSMConfigSchema.parse(config);
}
```

### 4.4 成果物
- `app/settings/page.tsx`
- `components/settings/StageEditor.tsx`
- `components/settings/StageList.tsx`
- `components/settings/ConfigImportExport.tsx`
- `components/settings/PresetManager.tsx`
- `lib/config-storage.ts`
- `lib/config-validation.ts`

### 4.5 テスト計画
- ステージ追加/編集/削除のユニットテスト
- ドラッグ&ドロップの E2E テスト
- エクスポート/インポートの統合テスト
- バリデーションロジックのユニットテスト

## 5. Phase 4: 認証・権限

### 5.1 目標
セキュアな認証とロールベースのアクセス制御を実装する。

### 5.2 タスク一覧

#### 5.2.1 認証基盤
- [ ] **Task 4.1.1**: NextAuth.js のセットアップ
  - NextAuth.js のインストールと設定
  - `/api/auth/[...nextauth]/route.ts` の作成
  - セッション管理の設定

- [ ] **Task 4.1.2**: Google OAuth プロバイダー設定
  - Google Cloud Console でのアプリケーション登録
  - OAuth クライアント ID/Secret の取得
  - NextAuth.js への Google プロバイダー追加

- [ ] **Task 4.1.3**: GitHub OAuth プロバイダー設定
  - GitHub OAuth App の作成
  - NextAuth.js への GitHub プロバイダー追加

- [ ] **Task 4.1.4**: Okta SAML/OIDC プロバイダー設定
  - Okta アプリケーション設定
  - NextAuth.js への Okta プロバイダー追加

#### 5.2.2 ユーザー管理
- [ ] **Task 4.2.1**: ユーザーデータモデル
  - User スキーマの定義
  - データベース選定（Supabase, PlanetScale, Vercel Postgres 等）
  - Prisma ORM のセットアップ

- [ ] **Task 4.2.2**: ユーザープロファイル画面
  - プロファイル表示コンポーネント
  - プロファイル編集機能
  - アバター画像アップロード

#### 5.2.3 ロールベースアクセス制御 (RBAC)
- [ ] **Task 4.3.1**: ロール・権限モデルの実装
  - Role と Permission の定義
  - ロールと権限の関連付け
  - データベーススキーマの作成

- [ ] **Task 4.3.2**: 権限チェックミドルウェア
  - サーバーサイド権限チェック
  - API ルートの保護
  - クライアントサイド権限チェック

- [ ] **Task 4.3.3**: UI での権限制御
  - 条件付きレンダリング（権限に応じた UI 表示/非表示）
  - 読み取り専用モード
  - 管理者専用機能の隔離

#### 5.2.4 チーム別データアクセス制限
- [ ] **Task 4.4.1**: チーム管理機能
  - チーム作成/編集/削除
  - チームメンバー管理
  - チームへのリポジトリ/プロジェクト割り当て

- [ ] **Task 4.4.2**: データフィルタリング
  - ユーザーの所属チームに基づくデータフィルター
  - マルチテナント対応のデータアクセス層

### 5.3 技術的考慮事項

#### 5.3.1 認証フロー
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### 5.3.2 RBAC 実装
```typescript
// lib/rbac.ts
enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

enum Permission {
  READ_DASHBOARD = 'dashboard:read',
  WRITE_DASHBOARD = 'dashboard:write',
  MANAGE_CONFIG = 'config:manage',
  MANAGE_USERS = 'users:manage',
}

const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.READ_DASHBOARD,
    Permission.WRITE_DASHBOARD,
    Permission.MANAGE_CONFIG,
    Permission.MANAGE_USERS,
  ],
  [Role.MANAGER]: [
    Permission.READ_DASHBOARD,
    Permission.WRITE_DASHBOARD,
    Permission.MANAGE_CONFIG,
  ],
  [Role.MEMBER]: [
    Permission.READ_DASHBOARD,
    Permission.WRITE_DASHBOARD,
  ],
  [Role.VIEWER]: [
    Permission.READ_DASHBOARD,
  ],
};

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return rolePermissions[userRole]?.includes(permission) ?? false;
}

// Middleware での使用例
export function requirePermission(permission: Permission) {
  return async (req: Request) => {
    const session = await getServerSession(authOptions);

    if (!session || !hasPermission(session.user.role, permission)) {
      return new Response('Forbidden', { status: 403 });
    }
  };
}
```

### 5.4 成果物
- `app/api/auth/[...nextauth]/route.ts`
- `app/profile/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/teams/page.tsx`
- `lib/rbac.ts`
- `lib/prisma.ts`
- `prisma/schema.prisma`
- `components/auth/LoginButton.tsx`
- `components/auth/UserMenu.tsx`
- `middleware.ts`

### 5.5 テスト計画
- 認証フローの E2E テスト
- 権限チェックロジックのユニットテスト
- 各ロールでのアクセス制御の統合テスト
- セッション管理のテスト

## 6. Phase 5: 高度な分析

### 6.1 目標
トレンド分析、ボトルネック検出、予測分析などの高度な分析機能を提供する。

### 6.2 タスク一覧

#### 6.2.1 トレンド分析
- [ ] **Task 5.1.1**: Chart.js または Recharts の導入
  - ライブラリの選定とインストール
  - 基本的なチャートコンポーネントの作成

- [ ] **Task 5.1.2**: 時系列データ集計機能
  - 週次/月次でのメトリクス集計
  - タイムバケット生成ユーティリティ
  - 時系列データの格納構造

- [ ] **Task 5.1.3**: トレンドチャートコンポーネント
  - Lead Time トレンドチャート
  - Cycle Time トレンドチャート
  - Throughput トレンドチャート
  - Flow Efficiency トレンドチャート

- [ ] **Task 5.1.4**: トレンド分析ダッシュボード
  - `/analytics/trends` ページの作成
  - 複数メトリクスの同時表示
  - 期間選択機能（1ヶ月、3ヶ月、6ヶ月、1年）

#### 6.2.2 ボトルネック自動検出
- [ ] **Task 5.2.1**: ボトルネック検出アルゴリズムの実装
  - WIP 閾値チェック
  - 平均滞留時間の統計的分析
  - 遷移効率の低下検出

- [ ] **Task 5.2.2**: ボトルネックアラートコンポーネント
  - ダッシュボードへのアラート表示
  - 重要度別のビジュアル表示
  - 改善提案の表示

- [ ] **Task 5.2.3**: ボトルネック詳細分析画面
  - 検出されたボトルネックの詳細表示
  - 根本原因の可視化
  - 履歴追跡

#### 6.2.3 予測分析
- [ ] **Task 5.3.1**: Monte Carlo シミュレーション実装
  - 過去データからの分布推定
  - シミュレーション実行エンジン
  - 確率的予測の計算

- [ ] **Task 5.3.2**: 完了予測機能
  - 個別アイテムの完了予測日
  - 信頼区間の計算（50%, 85%, 95%）
  - 予測精度の評価

- [ ] **Task 5.3.3**: 予測チャートコンポーネント
  - 確率分布チャート
  - 信頼区間の可視化
  - 予測 vs 実績の比較

#### 6.2.4 A/B テスト比較機能
- [ ] **Task 5.4.1**: 比較対象の選択 UI
  - 期間比較（前月 vs 今月等）
  - チーム比較
  - プロセス変更前後の比較

- [ ] **Task 5.4.2**: 比較分析エンジン
  - メトリクスの差分計算
  - 統計的有意性検定
  - 改善率の算出

- [ ] **Task 5.4.3**: 比較結果表示コンポーネント
  - サイドバイサイド比較表示
  - 差分のハイライト
  - グラフでの比較可視化

### 6.3 技術的考慮事項

#### 6.3.1 時系列データ集計
```typescript
// lib/time-series.ts
import { startOfWeek, startOfMonth, format, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

interface TimeSeriesDataPoint {
  date: Date;
  leadTime: number;
  cycleTime: number;
  throughput: number;
  flowEfficiency: number;
}

export function aggregateByWeek(
  items: WorkItem[],
  startDate: Date,
  endDate: Date
): TimeSeriesDataPoint[] {
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate });

  return weeks.map(weekStart => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekItems = items.filter(item =>
      item.completedAt &&
      item.completedAt >= weekStart &&
      item.completedAt < weekEnd
    );

    return {
      date: weekStart,
      leadTime: calculateAverageLeadTime(weekItems),
      cycleTime: calculateAverageCycleTime(weekItems),
      throughput: weekItems.length,
      flowEfficiency: calculateFlowEfficiency(weekItems),
    };
  });
}
```

#### 6.3.2 ボトルネック検出
```typescript
// lib/bottleneck-detection.ts
interface BottleneckDetection {
  stageId: string;
  stageName: string;
  severity: 'high' | 'medium' | 'low';
  score: number;
  indicators: {
    highWIP: boolean;
    longAverageTime: boolean;
    lowTransitionRate: boolean;
  };
  suggestions: string[];
}

export function detectBottlenecks(
  metrics: VSMMetrics,
  config: VSMConfig
): BottleneckDetection[] {
  const detections: BottleneckDetection[] = [];

  metrics.stageMetrics.forEach(stageMetric => {
    const indicators = {
      highWIP: stageMetric.wip > 10, // 閾値は設定可能に
      longAverageTime: stageMetric.averageTime > 5, // 閾値は設定可能に
      lowTransitionRate: stageMetric.transitionEfficiency < 70, // 閾値は設定可能に
    };

    const activeIndicators = Object.values(indicators).filter(Boolean).length;

    if (activeIndicators > 0) {
      const score = activeIndicators * 100 / 3;
      const severity = score > 66 ? 'high' : score > 33 ? 'medium' : 'low';

      const suggestions: string[] = [];
      if (indicators.highWIP) {
        suggestions.push('WIP制限を設けて、仕掛り作業を削減してください');
      }
      if (indicators.longAverageTime) {
        suggestions.push('タスクを小さく分割することを検討してください');
      }
      if (indicators.lowTransitionRate) {
        suggestions.push('次のステージへの遷移を妨げる要因を調査してください');
      }

      detections.push({
        stageId: stageMetric.stageId,
        stageName: stageMetric.stageName,
        severity,
        score,
        indicators,
        suggestions,
      });
    }
  });

  return detections.sort((a, b) => b.score - a.score);
}
```

#### 6.3.3 Monte Carlo シミュレーション
```typescript
// lib/monte-carlo.ts
interface SimulationResult {
  percentile50: number;
  percentile85: number;
  percentile95: number;
  mean: number;
  distribution: number[];
}

export function monteCarloSimulation(
  historicalCycleTimes: number[],
  iterations: number = 10000
): SimulationResult {
  const distribution: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const randomIndex = Math.floor(Math.random() * historicalCycleTimes.length);
    distribution.push(historicalCycleTimes[randomIndex]);
  }

  const sorted = distribution.sort((a, b) => a - b);

  return {
    percentile50: sorted[Math.floor(iterations * 0.5)],
    percentile85: sorted[Math.floor(iterations * 0.85)],
    percentile95: sorted[Math.floor(iterations * 0.95)],
    mean: distribution.reduce((sum, val) => sum + val, 0) / iterations,
    distribution: sorted,
  };
}

export function predictCompletionDate(
  item: WorkItem,
  historicalData: WorkItem[]
): { date: Date; confidence: number } {
  const similarItems = historicalData.filter(h =>
    h.type === item.type &&
    h.estimateSize === item.estimateSize
  );

  const cycleTimes = similarItems
    .map(calculateCycleTime)
    .filter(ct => ct !== null) as number[];

  if (cycleTimes.length < 5) {
    return {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // デフォルト7日後
      confidence: 0.3,
    };
  }

  const simulation = monteCarloSimulation(cycleTimes);
  const predictedDays = simulation.percentile85;

  const completionDate = new Date(item.startedAt || Date.now());
  completionDate.setDate(completionDate.getDate() + predictedDays);

  return {
    date: completionDate,
    confidence: Math.min(cycleTimes.length / 20, 1), // データ量に応じた信頼度
  };
}
```

### 6.4 成果物
- `app/analytics/trends/page.tsx`
- `app/analytics/bottlenecks/page.tsx`
- `app/analytics/predictions/page.tsx`
- `components/analytics/TrendChart.tsx`
- `components/analytics/BottleneckAlert.tsx`
- `components/analytics/PredictionChart.tsx`
- `components/analytics/ComparisonView.tsx`
- `lib/time-series.ts`
- `lib/bottleneck-detection.ts`
- `lib/monte-carlo.ts`
- `lib/statistical-analysis.ts`

### 6.5 テスト計画
- 時系列集計ロジックのユニットテスト
- ボトルネック検出アルゴリズムのユニットテスト
- Monte Carlo シミュレーションの精度検証
- チャートコンポーネントのビジュアルリグレッションテスト

## 7. 横断的タスク

### 7.1 パフォーマンス最適化

#### 7.1.1 データキャッシュ
- [ ] **Task 7.1.1**: SWR または React Query の導入
  - ライブラリの選定とインストール
  - データフェッチングフックの実装
  - キャッシュ戦略の設定

- [ ] **Task 7.1.2**: インクリメンタルデータ更新
  - 差分取得のロジック実装
  - 最終更新日時のトラッキング
  - データマージ処理

#### 7.1.2 レンダリング最適化
- [ ] **Task 7.2.1**: 仮想スクロールの実装
  - `react-window` または `react-virtualized` の導入
  - 大量アイテムリストの最適化

- [ ] **Task 7.2.2**: メモ化の強化
  - コンポーネントの React.memo 適用
  - useMemo/useCallback の適切な使用
  - Re-render の分析と最適化

#### 7.1.3 Web Worker 活用
- [ ] **Task 7.3.1**: メトリクス計算の Web Worker 化
  - Worker スクリプトの作成
  - メインスレッドとの通信実装
  - 計算結果の非同期受信

### 7.2 テスト自動化

#### 7.2.1 ユニットテスト
- [ ] **Task 7.4.1**: テストセットアップ
  - Jest と React Testing Library の設定
  - テストユーティリティの作成
  - モックデータの準備

- [ ] **Task 7.4.2**: コアロジックのテスト
  - メトリクス計算のテスト
  - データ変換のテスト
  - フィルタリングロジックのテスト
  - バリデーションのテスト

#### 7.2.2 統合テスト
- [ ] **Task 7.5.1**: API クライアントのテスト
  - Mock Service Worker (MSW) のセットアップ
  - GitHub API クライアントのテスト
  - Jira API クライアントのテスト

- [ ] **Task 7.5.2**: データフローのテスト
  - データ取得から表示までの統合テスト
  - フィルター適用のテスト
  - エラーハンドリングのテスト

#### 7.2.3 E2E テスト
- [ ] **Task 7.6.1**: Playwright のセットアップ
  - Playwright のインストールと設定
  - テストシナリオの定義

- [ ] **Task 7.6.2**: 主要フローのテスト
  - ダッシュボード初期表示のテスト
  - フィルター操作のテスト
  - ドリルダウンのテスト
  - 設定変更のテスト（Phase 3）

### 7.3 ドキュメンテーション

#### 7.3.1 コードドキュメント
- [ ] **Task 7.7.1**: JSDoc コメントの追加
  - 主要関数への JSDoc 追加
  - 型定義へのコメント追加

- [ ] **Task 7.7.2**: Storybook の導入
  - Storybook のセットアップ
  - 主要コンポーネントのストーリー作成
  - インタラクティブなコンポーネントカタログ

#### 7.3.2 ユーザードキュメント
- [ ] **Task 7.8.1**: ユーザーガイドの作成
  - 基本的な使い方ガイド
  - フィルター機能の説明
  - カスタマイズ方法（Phase 3）

- [ ] **Task 7.8.2**: API ドキュメントの作成
  - GitHub/Jira API 設定ガイド
  - 環境変数リファレンス
  - トラブルシューティングガイド

### 7.4 CI/CD パイプライン

#### 7.4.1 GitHub Actions
- [ ] **Task 7.9.1**: CI パイプラインの構築
  - Lint チェック
  - 型チェック
  - ユニットテスト実行
  - ビルド確認

- [ ] **Task 7.9.2**: CD パイプラインの構築
  - Vercel への自動デプロイ
  - プレビューデプロイメント
  - 本番デプロイメント

#### 7.4.2 品質ゲート
- [ ] **Task 7.10.1**: コードカバレッジ
  - カバレッジレポートの生成
  - 最低カバレッジ閾値の設定（80%）

- [ ] **Task 7.10.2**: コード品質チェック
  - ESLint ルールの厳格化
  - Prettier による自動フォーマット
  - Husky による pre-commit フック

## 8. セキュリティ強化

### 8.1 セキュリティタスク
- [ ] **Task 8.1.1**: 環境変数の暗号化
  - クライアント露出の最小化
  - サーバーサイド API 経由でのデータ取得

- [ ] **Task 8.2.1**: CORS 設定
  - 適切な CORS ポリシーの設定
  - Origin の検証

- [ ] **Task 8.3.1**: CSP の導入
  - Content Security Policy ヘッダーの設定
  - インラインスクリプトの削減

- [ ] **Task 8.4.1**: レート制限
  - API リクエストのレート制限実装
  - クライアントサイドのスロットリング

- [ ] **Task 8.5.1**: 依存関係のセキュリティ
  - Dependabot の有効化
  - 定期的な依存関係更新
  - 脆弱性スキャン

## 9. デプロイメント計画

### 9.1 環境構成

#### 9.1.1 環境の種類
- **開発環境 (Development)**: ローカル開発環境
- **プレビュー環境 (Preview)**: PR ごとの自動デプロイ
- **ステージング環境 (Staging)**: 本番前の検証環境
- **本番環境 (Production)**: エンドユーザー向け環境

#### 9.1.2 環境変数管理
```bash
# .env.local (ローカル開発)
NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxx
NEXT_PUBLIC_GITHUB_ORG=your-org
NEXT_PUBLIC_GITHUB_REPO=your-repo
NEXT_PUBLIC_JIRA_URL=https://your-domain.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=your@email.com
NEXT_PUBLIC_JIRA_API_TOKEN=xxx
NEXT_PUBLIC_JIRA_PROJECT_KEY=PROJ

# Phase 4 で追加
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GITHUB_ID=xxx
GITHUB_SECRET=xxx
DATABASE_URL=postgresql://xxx
```

### 9.2 デプロイ手順

#### 9.2.1 Vercel へのデプロイ
1. Vercel アカウント作成
2. GitHub リポジトリ連携
3. プロジェクトインポート
4. 環境変数の設定
5. 自動デプロイの確認

#### 9.2.2 カスタムドメイン設定
- DNS 設定
- SSL 証明書の自動取得
- ドメイン検証

### 9.3 監視・運用

#### 9.3.1 モニタリング
- [ ] **Task 9.1.1**: Vercel Analytics の有効化
- [ ] **Task 9.1.2**: エラートラッキング（Sentry 等）
- [ ] **Task 9.1.3**: パフォーマンスモニタリング

#### 9.3.2 ログ管理
- [ ] **Task 9.2.1**: 構造化ログの実装
- [ ] **Task 9.2.2**: ログレベルの適切な設定
- [ ] **Task 9.2.3**: ログ保持ポリシーの決定

## 10. マイルストーン

### 10.1 Phase 3 マイルストーン
- **M3.1**: VSM 設定管理機能の完成
- **M3.2**: ステージ定義カスタマイズ UI の完成
- **M3.3**: エクスポート/インポート機能の完成
- **M3.4**: Phase 3 統合テスト完了

### 10.2 Phase 4 マイルストーン
- **M4.1**: 認証基盤の完成
- **M4.2**: ユーザー管理機能の完成
- **M4.3**: RBAC の完成
- **M4.4**: Phase 4 統合テスト完了

### 10.3 Phase 5 マイルストーン
- **M5.1**: トレンド分析機能の完成
- **M5.2**: ボトルネック検出機能の完成
- **M5.3**: 予測分析機能の完成
- **M5.4**: A/B テスト比較機能の完成
- **M5.5**: Phase 5 統合テスト完了

## 11. リスク管理

### 11.1 技術的リスク

| リスク | 影響度 | 発生確率 | 軽減策 |
|--------|--------|----------|--------|
| GitHub/Jira API レート制限 | 高 | 中 | キャッシュ機構の実装、バックオフ戦略 |
| 大量データでのパフォーマンス低下 | 高 | 中 | 仮想スクロール、ページネーション実装 |
| 認証プロバイダーの障害 | 中 | 低 | 複数プロバイダーのサポート |
| データベース選定の遅延 | 中 | 中 | 早期の技術検証と選定 |
| サードパーティライブラリの脆弱性 | 中 | 中 | 定期的な依存関係更新、セキュリティスキャン |

### 11.2 スケジュールリスク

| リスク | 影響度 | 発生確率 | 軽減策 |
|--------|--------|----------|--------|
| 要件変更による手戻り | 高 | 中 | アジャイル開発、頻繁なデモ |
| 技術的難易度の見積もり誤り | 中 | 中 | 技術スパイクの実施 |
| テスト工数の不足 | 中 | 高 | テスト駆動開発、自動化の徹底 |

## 12. 成功基準

### 12.1 機能的成功基準
- [ ] すべての計画機能が実装されている
- [ ] ユーザーが独自の VSM 定義を作成・管理できる
- [ ] 認証とアクセス制御が正しく機能する
- [ ] 高度な分析機能が実用的な洞察を提供する

### 12.2 技術的成功基準
- [ ] ユニットテストカバレッジ 80% 以上
- [ ] E2E テストで主要フローをカバー
- [ ] Lighthouse スコア 90 以上（Performance, Accessibility, Best Practices, SEO）
- [ ] 1000 件のアイテムを 3 秒以内に表示

### 12.3 ユーザー体験成功基準
- [ ] 初回ロード時間 3 秒以内
- [ ] フィルター適用の応答時間 500ms 以内
- [ ] モバイルデバイスでも快適に動作
- [ ] アクセシビリティ基準 (WCAG 2.1 AA) に準拠

## 13. 次のステップ

### 13.1 直近のアクション（Phase 3 開始）
1. VSM 設定データモデルの詳細設計
2. LocalStorage ベースの永続化戦略の実装
3. 設定画面のワイヤーフレーム作成
4. ドラッグ&ドロップライブラリの技術検証

### 13.2 継続的改善
- ユーザーフィードバックの収集
- メトリクスの継続的な監視
- パフォーマンスの定期的な評価
- セキュリティアップデートの適用

## 14. 参考資料

### 14.1 技術ドキュメント
- Next.js 公式ドキュメント: https://nextjs.org/docs
- Zustand ドキュメント: https://docs.pmnd.rs/zustand
- GitHub REST API: https://docs.github.com/en/rest
- Jira REST API: https://developer.atlassian.com/cloud/jira/platform/rest/v3/

### 14.2 バリューストリームマッピング
- "Value Stream Mapping" by Karen Martin
- "This Is Lean" by Niklas Modig and Pär Åhlström
- DevOps Research and Assessment (DORA) メトリクス

### 14.3 開発プラクティス
- "Clean Code" by Robert C. Martin
- React ベストプラクティス
- TypeScript ベストプラクティス
