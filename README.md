# Flow Engineering Dashboard

バリューストリームマッピング（VSM）ダッシュボード - アプリケーション開発における価値の流れを可視化

## 概要

このダッシュボードは、GitHub と Jira からデータを取得し、開発プロセスのバリューストリームを可視化します。

### 主要機能

**Phase 1 - 基本機能 ✅ 完了**
- ✅ バリューストリーム図: 開発プロセスの各ステージ（Discovery → Ready Backlog → Build → Test → Release → Done）を可視化
- ✅ 主要メトリクス:
  - Lead Time（全体のリードタイム）
  - Cycle Time（作業開始から完了まで）
  - Flow Efficiency（フロー効率）
  - Throughput（スループット）
- ✅ Flow Distribution: ラベル別の作業分類
- ✅ Flow Contribution: チーム/担当者別の貢献度
- ✅ 日付範囲フィルター: 期間を指定してデータを絞り込み

**Phase 2 - 分析・インタラクティブ機能 ✅ 完了**
- ✅ ステージ別ドリルダウン: ステージをクリックして該当アイテム一覧を表示
- ✅ 個別イシュー詳細: 各イシューの詳細情報とステージ履歴をモーダル表示
- ✅ 高度なフィルター: Work Type、Team、Estimate Sizeで絞り込み
- ✅ データリフレッシュ: 手動更新ボタンと最終更新時刻表示
- ✅ エラーハンドリング: エラー表示バナーとローディングスケルトン
- ✅ GitHub/Jira API統合基盤: データサービス層とZustand状態管理

**Phase 3 - カスタマイズ機能 ✅ 完了**
- ✅ ステージ定義カスタマイズ: UI上でステージの追加・編集・削除
- ✅ ドラッグ&ドロップ: ステージの順序変更
- ✅ GitHub/Jiraマッピング設定: ステータスとラベルのマッピング設定
- ✅ 設定プリセット管理: 複数の設定を保存・切り替え
- ✅ エクスポート/インポート: JSON/YAML形式での設定の共有
- ✅ LocalStorage永続化: ブラウザへの設定保存

**Phase 4 - 認証・権限 ✅ 完了**
- ✅ NextAuth.js統合: 複数認証プロバイダー対応
- ✅ ロールベースアクセス制御（RBAC）: Admin、Manager、Member、Viewerの4段階
- ✅ 権限管理システム: 6種類の権限（読取、書込、設定管理、ユーザー管理等）
- ✅ 保護されたルート: ミドルウェアによる自動リダイレクト
- ✅ セッション管理: JWT戦略によるセキュアな認証
- ✅ OAuth対応: GitHub/Google認証の準備完了

**Phase 5 - 高度な分析 ✅ 完了**
- ✅ トレンド分析: 週次/月次でのメトリクス推移の可視化
- ✅ インタラクティブチャート: Lead Time、Cycle Time、Throughput、Flow Efficiencyのトレンド表示
- ✅ ボトルネック自動検出: WIP、平均時間、遷移効率に基づく検出
- ✅ 重要度スコアリング: ボトルネックの深刻度評価（High/Medium/Low）
- ✅ アクション可能な提案: ボトルネック解消のための具体的な改善提案
- ✅ Monte Carloシミュレーション: 予測分析のための基盤
- ✅ 期間選択: 1ヶ月、3ヶ月、6ヶ月、1年の分析期間

**Phase 6 - ユーザー管理 ✅ 完了**
- ✅ ユーザー管理UI: ユーザーの作成・編集・削除画面
- ✅ ユーザー一覧・検索: 名前、メール、ロール、チームでフィルタリング
- ✅ ロール変更: Admin、Manager、Member、Viewerの権限変更
- ✅ チーム割り当て: ユーザーへの複数チーム割り当て
- ✅ 権限ガイド: ロール別の権限マトリックス表示
- ✅ CRUD API: RESTful APIによるユーザー管理操作

## 技術スタック

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5
- **Data Sources**: GitHub REST API, Jira REST API
- **State Management**: Zustand
- **Data Visualization**: カスタムコンポーネント（Tailwind CSS）+ Recharts
- **Drag & Drop**: @dnd-kit
- **Date Handling**: date-fns
- **Storage**: LocalStorage

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env.local` を作成し、必要な情報を設定します：

```bash
cp .env.example .env.local
```

#### GitHub API 設定

```env
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
NEXT_PUBLIC_GITHUB_ORG=your_org_or_username
NEXT_PUBLIC_GITHUB_REPO=your_repo_name
```

#### Jira API 設定

```env
NEXT_PUBLIC_JIRA_URL=https://your-domain.atlassian.net
NEXT_PUBLIC_JIRA_EMAIL=your_email@example.com
NEXT_PUBLIC_JIRA_API_TOKEN=your_jira_api_token
NEXT_PUBLIC_JIRA_PROJECT_KEY=YOUR_PROJECT
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてダッシュボードを確認できます。

## プロジェクト構造

```
flowengineering-dashboard/
├── app/                    # Next.js App Router
│   ├── admin/
│   │   └── users/
│   │       └── page.tsx   # ユーザー管理ページ
│   ├── analytics/
│   │   └── page.tsx       # アナリティクスページ
│   ├── api/
│   │   ├── auth/          # NextAuth APIルート
│   │   └── users/         # ユーザー管理API
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx   # サインインページ
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── admin/             # 管理者用コンポーネント
│   │   ├── UserManagementTable.tsx
│   │   ├── CreateUserModal.tsx
│   │   ├── EditUserModal.tsx
│   │   └── RolePermissionsGuide.tsx
│   ├── analytics/         # アナリティクス用コンポーネント
│   │   ├── TrendChart.tsx
│   │   └── BottleneckAlert.tsx
│   ├── auth/              # 認証用コンポーネント
│   │   ├── UserMenu.tsx
│   │   └── SessionProvider.tsx
│   ├── ValueStreamDashboard.tsx  # メインダッシュボード
│   ├── ValueStreamFlow.tsx       # バリューストリーム図
│   ├── MetricsCards.tsx          # メトリクスカード
│   ├── FlowCharts.tsx            # Flow Distribution/Contribution
│   ├── DateRangeFilter.tsx       # 日付フィルター
│   ├── AdvancedFilters.tsx       # 高度なフィルター
│   ├── StageDetailModal.tsx      # ステージ詳細モーダル
│   ├── WorkItemDetailModal.tsx   # イシュー詳細モーダル
│   ├── RefreshButton.tsx         # データ更新ボタン
│   ├── ErrorBanner.tsx           # エラー表示バナー
│   └── LoadingSkeleton.tsx       # ローディングスケルトン
├── lib/                   # ビジネスロジック
│   ├── auth/              # 認証関連
│   │   ├── auth.config.ts # NextAuth設定
│   │   ├── auth.ts        # NextAuthエクスポート
│   │   └── rbac.ts        # ロールベースアクセス制御
│   ├── github-client.ts   # GitHub API クライアント
│   ├── jira-client.ts     # Jira API クライアント
│   ├── data-service.ts    # データサービス層
│   ├── data-transformer.ts # データ変換ロジック
│   ├── metrics.ts         # メトリクス計算
│   ├── time-series.ts     # 時系列分析
│   ├── bottleneck-detection.ts # ボトルネック検出
│   └── monte-carlo.ts     # Monte Carloシミュレーション
├── store/                 # 状態管理
│   ├── dashboard-store.ts # ダッシュボード状態
│   └── user-management-store.ts # ユーザー管理状態
├── types/                 # TypeScript型定義
│   └── index.ts
├── docs/                  # ドキュメント
│   ├── DESIGN.md          # 設計書
│   ├── DEVELOPMENT_PLAN.md # 開発計画
│   └── vsm-vision.png     # ビジョン画像
├── middleware.ts          # Next.js ミドルウェア（認証保護）
└── CLAUDE.md             # プロジェクト指示書
```

## カスタマイズ

### ステージ定義のカスタマイズ

`lib/data-transformer.ts` の `getDefaultVSMConfig()` を編集して、独自のステージ定義を設定できます。

### GitHub/Jira マッピング

各ステージにGitHub/Jiraのステータスをマッピングする設定も `getDefaultVSMConfig()` で変更可能です。

## デプロイ

### Vercel へのデプロイ

```bash
npm run build
```

Vercel にプッシュするだけで自動的にデプロイされます。

## アーキテクチャ

### データフロー

1. **データ取得**: `lib/data-service.ts`
   - GitHub API / Jira API からデータを取得
   - 環境変数から認証情報を読み込み

2. **データ変換**: `lib/data-transformer.ts`
   - API レスポンスを内部データモデル（WorkItem）に変換
   - ステージマッピング設定に基づいてステータスをステージに紐付け

3. **メトリクス計算**: `lib/metrics.ts`
   - Lead Time, Cycle Time, Flow Efficiency, Throughput を計算
   - ステージ別メトリクス、Flow Distribution/Contributionを算出

4. **状態管理**: `store/dashboard-store.ts`
   - Zustand によるグローバル状態管理
   - フィルター状態、選択状態、エラー状態などを管理

5. **UI表示**: `components/**`
   - React コンポーネントでデータを可視化
   - インタラクティブなドリルダウンとフィルタリング

### 主要コンポーネント

- **ValueStreamFlow**: バリューストリーム図の可視化
  - 各ステージの平均滞留時間、WIP、遷移効率を表示
  - クリックでステージ詳細モーダルを表示

- **StageDetailModal**: ステージ内のアイテム一覧
  - フィルター適用後のアイテムをリスト表示
  - 各アイテムをクリックで詳細モーダルへ

- **WorkItemDetailModal**: 個別アイテムの詳細情報
  - Lead Time, Cycle Time の詳細表示
  - ステージ履歴のタイムライン表示

- **AdvancedFilters**: 多軸フィルタリング
  - Work Type, Team, Estimate Size による絞り込み
  - アクティブフィルター数の表示

## 使い方

### 初回アクセス

1. アプリケーションを起動すると、自動的にサインインページにリダイレクトされます
2. デモ用の認証情報でログイン:
   - **Admin**: admin@example.com / admin123
   - **Manager**: manager@example.com / manager123
   - **Member**: member@example.com / member123
   - **Viewer**: viewer@example.com / viewer123

### ロール別権限

- **Admin**: すべての機能にアクセス可能（ユーザー管理含む）
- **Manager**: 設定管理とアナリティクスにアクセス可能
- **Member**: ダッシュボードの閲覧・編集が可能
- **Viewer**: 読取専用アクセス

### ユーザー管理（Admin専用）

Adminロールでログインすると、ユーザーメニューから「User Management」にアクセスできます。

主な機能:
- ユーザーの作成・編集・削除
- ロールの変更
- チームの割り当て
- ユーザー検索とフィルタリング
- 権限マトリックスの表示

## 今後の拡張予定

### データベース統合
- [ ] PostgreSQL/MySQL等のデータベース接続
- [ ] ユーザー情報の永続化
- [ ] チーム情報の管理

### 追加機能
- [ ] カスタムメトリクスの追加
- [ ] A/Bテスト比較機能
- [ ] 予測完了日の表示（Monte Carlo活用）
- [ ] レポート生成・エクスポート
- [ ] Slack/Teams通知連携
- [ ] チーム別データアクセス制限
- [ ] 実際のGitHub/Jira APIとの連携

## ライセンス

MIT
