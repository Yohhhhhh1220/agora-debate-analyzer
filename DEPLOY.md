# デプロイ手順

このドキュメントでは、ディベートサイトをVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（[vercel.com](https://vercel.com)で無料登録可能）

## デプロイ方法

### 方法1: Vercel CLIを使用（推奨）

#### ステップ1: Vercel CLIのインストール

```bash
npm i -g vercel
```

#### ステップ2: プロジェクトディレクトリでログイン

```bash
vercel login
```

ブラウザが開き、Vercelアカウントでログインします。

#### ステップ3: デプロイの実行

プロジェクトのルートディレクトリ（`package.json`がある場所）で実行：

```bash
vercel
```

初回デプロイ時は以下の質問に答えます：

- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → アカウントを選択
- **Link to existing project?** → `N` (No)
- **What's your project's name?** → プロジェクト名を入力（例: `debate-analysis-site`）
- **In which directory is your code located?** → `./` (Enterキーでデフォルト)
- **Want to override the settings?** → `N` (No)

#### ステップ4: 環境変数の設定（オプション）

OpenAI APIを使用する場合：

```bash
# 環境変数を追加
vercel env add OPENAI_API_KEY
# プロンプトが表示されたら、APIキーを入力

vercel env add OPENAI_MODEL
# プロンプトが表示されたら、モデル名を入力（例: gpt-4o-mini）
```

#### ステップ5: 本番環境にデプロイ

```bash
vercel --prod
```

デプロイが完了すると、URLが表示されます。

---

### 方法2: Vercel Dashboardを使用

#### ステップ1: GitHubにプッシュ

プロジェクトをGitHubリポジトリにプッシュします：

```bash
# Gitリポジトリの初期化（まだの場合）
git init
git add .
git commit -m "Initial commit"

# GitHubにリポジトリを作成し、プッシュ
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

#### ステップ2: Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定を確認：
   - **Framework Preset**: Next.js（自動検出）
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### ステップ3: 環境変数の設定

1. プロジェクトの「Settings」→「Environment Variables」に移動
2. 以下の環境変数を追加（オプション）：
   - `OPENAI_API_KEY`: OpenAI APIキー
   - `OPENAI_MODEL`: 使用するモデル（例: `gpt-4o-mini`）

#### ステップ4: デプロイの実行

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待機（通常1-3分）
3. デプロイ完了後、提供されたURLでアクセス可能

---

## デプロイ後の確認

デプロイが完了したら、以下を確認してください：

1. ✅ サイトが正常に表示される
2. ✅ 分析機能が動作する
3. ✅ 環境変数が正しく設定されている（OpenAI APIを使用する場合）

## 今後の更新

### Vercel CLIを使用する場合

```bash
vercel --prod
```

### GitHub連携を使用する場合

GitHubにプッシュすると、自動的にVercelで再デプロイされます：

```bash
git add .
git commit -m "Update"
git push
```

## トラブルシューティング

### ビルドエラーが発生する場合

ローカルでビルドをテスト：

```bash
npm run build
```

エラーが発生する場合は、エラーメッセージを確認して修正してください。

### 環境変数が反映されない場合

1. Vercelダッシュボードで環境変数を再設定
2. デプロイを再実行
3. 環境変数のスコープ（Production, Preview, Development）を確認

### OpenAI APIエラーが発生する場合

1. APIキーが正しく設定されているか確認
2. APIキーの有効期限を確認
3. 使用量制限に達していないか確認
4. [OpenAI Platform](https://platform.openai.com/) でAPIキーの状態を確認

## カスタムドメインの設定

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Domains」に移動
3. ドメイン名を入力して「Add」をクリック
4. DNS設定を指示に従って更新

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

