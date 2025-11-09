# AIディベート分析サイト

ディベートの正確性と論理性をAIがリアルタイムに判定・可視化するWebアプリケーションです。

## 機能

- **リアルタイム分析**: ディベート内容を入力すると、AIが即座に分析を実行
- **多角的評価**: 正確性、論理性、一貫性、証拠の質を個別に評価（各0-100点）
- **推移可視化**: 分析結果を時系列グラフで表示し、改善の推移を確認
- **AIフィードバック**: 各分析に対して具体的な改善提案を提供
- **データ管理**: 分析履歴の確認とデータのクリア機能

## 評価項目

1. **正確性 (Accuracy)**: 事実の正確さ、情報の信頼性
2. **論理性 (Logic)**: 論理的な構成、推論の妥当性
3. **一貫性 (Coherence)**: 主張の一貫性、矛盾の有無
4. **証拠の質 (Evidence)**: 提示された証拠やデータの質
5. **総合評価 (Overall)**: 上記4項目の平均値

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **グラフ可視化**: Recharts
- **バックエンド**: Next.js API Routes
- **AI分析**: OpenAI API (オプション) または簡易分析ロジック

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定（オプション）

より高精度な分析を行うために、OpenAI APIを統合することができます。

#### OpenAI APIキーの取得方法

1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. アカウントを作成またはログイン
3. [API Keys](https://platform.openai.com/api-keys) ページに移動
4. 「Create new secret key」をクリックしてAPIキーを生成
5. 生成されたキーをコピー（**このキーは一度しか表示されません**）

#### 環境変数の設定

プロジェクトのルートディレクトリ（`package.json`がある場所）に `.env.local` ファイルを作成し、以下の内容を記述：

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
```

**推奨モデル:**
- `gpt-4o-mini`: コスト効率が良く、高速（推奨・デフォルト）
- `gpt-4o`: より高精度だがコストが高い
- `gpt-3.5-turbo`: 旧モデル、最も安価

**注意事項:**
- `.env.local` ファイルは `.gitignore` に含まれているため、Gitにコミットされません
- APIキーは絶対に他人に共有しないでください
- OpenAI APIキーが設定されていない場合でも、簡易版の分析ロジックが動作します
- API使用には料金が発生します（詳細は[OpenAI Pricing](https://openai.com/pricing)を参照）

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 使用方法

1. **ディベート内容の入力**: テキストエリアにディベート内容を入力します
2. **分析の実行**: 「分析を実行」ボタンをクリックします
3. **結果の確認**: 
   - 右側のパネルに最新の分析結果が表示されます
   - 各評価項目のスコアとフィードバックを確認できます
4. **推移の確認**: 
   - 下部のグラフで複数回の分析結果の推移を確認できます
   - 各評価項目の時系列変化を視覚的に把握できます
5. **データの管理**: 
   - グラフ上部に分析回数が表示されます
   - 「データをクリア」ボタンで全データを削除できます

## プロジェクト構造

```
ディベートサイト/
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   └── route.ts          # 分析APIエンドポイント
│   │   └── stream-analyze/
│   │       └── route.ts          # ストリーミング分析API（オプション）
│   ├── globals.css                # グローバルスタイル
│   ├── layout.tsx                 # ルートレイアウト
│   └── page.tsx                   # メインページ
├── components/
│   ├── DebateInput.tsx            # ディベート入力コンポーネント
│   ├── AnalysisResults.tsx        # 分析結果表示コンポーネント
│   └── AnalysisChart.tsx          # 推移グラフコンポーネント
├── types/
│   └── analysis.ts                # 型定義
└── package.json
```

## カスタマイズ

### 分析ロジックの調整

`app/api/analyze/route.ts` の `analyzeDebateSimple` 関数を編集することで、簡易版の分析ロジックをカスタマイズできます。

### UIのカスタマイズ

Tailwind CSSを使用しているため、`tailwind.config.js` を編集することで、色やスタイルを簡単にカスタマイズできます。

## ライセンス

MIT

