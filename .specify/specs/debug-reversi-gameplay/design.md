# Design Document: debug-reversi-gameplay

## 概要

このドキュメントは、Claude Codeがdev3000を活用してリバーシゲームのデバッグ作業を自律的に実施するための行動指針と作業手順を定めたものです。デバッグシステムを実装するのではなく、Claude Code自身が探索的デバッグを行い、問題を発見・解決していくプロセスを規定します。

## デバッグ作業の基本方針

### 1. 探索的デバッグアプローチ

私（Claude Code）は以下の原則に従ってデバッグ作業を進めます：

- **事実ベースの判断**: 推測ではなく、dev3000から取得した実際のログ、エラーメッセージ、スクリーンショットに基づいて判断する
- **段階的な検証**: 一度に多くを変更せず、小さな変更を加えて検証を繰り返す
- **記録の徹底**: 全ての仮説と検証結果をtasks.mdに記録し、知識を蓄積する
- **柔軟な対応**: 予期しない問題に対して、多角的な視点から仮説を立てる

### 2. 正常系の完遂目標

リバーシゲームの正常系フローを以下のステップで完遂させます：

1. ゲーム開始画面へのアクセス
2. プレーヤー（私）とAIプレーヤーの交互プレイ
3. 盤面が全て埋まるまでゲーム続行
4. 勝敗判定と結果表示
5. ゲームリセットの動作確認

## dev3000の活用方法

### 1. 初期セットアップと監視開始

```bash
# dev3000が起動済みの前提
# Timeline Dashboardへアクセス: http://localhost:3684/logs
```

私は以下のMCPツールを活用します：

- `mcp__dev3000__fix_my_app`: エラーの自動検出と優先順位付け
- `mcp__dev3000__execute_browser_action`: ブラウザ操作の実行
- `mcp__dev3000__nextjs-dev_nextjs_runtime`: Next.jsランタイム情報の取得

### 2. ゲーム状態の監視

**継続的な監視項目**：

- コンソールログのエラーメッセージ
- ネットワークリクエストの失敗
- WebAssembly（ai.wasm）関連のエラー
- UIの表示崩れや不整合

**監視の実行方法**：

```typescript
// 私が実行する監視コマンドの例
mcp__dev3000__fix_my_app({
  mode: 'snapshot',
  focusArea: 'all',
  timeRangeMinutes: 10,
});
```

### 3. ブラウザ操作の実行

ゲームプレイを進める際の操作方法：

```typescript
// リバーシの石を置く操作
mcp__dev3000__execute_browser_action({
  action: 'click',
  params: { x: 450, y: 300 }, // 盤面の座標
});

// スクリーンショット取得
mcp__dev3000__execute_browser_action({
  action: 'screenshot',
});
```

## エラー発見時の行動フロー

### 1. エラーの分類と記録

エラーを発見した際の即座の対応：

1. **エラー情報の収集**
   - エラーメッセージの全文を記録
   - スタックトレースを確認
   - 発生時のゲーム状態をスクリーンショットで記録

2. **エラーの分類**
   - コンソールエラー（JavaScript実行エラー）
   - ネットワークエラー（API通信失敗）
   - WASM関連エラー（AI計算エラー）
   - ゲーム状態エラー（不正な盤面状態）
   - UI表示エラー（レンダリング問題）

### 2. 関連コードの調査

エラーに関連するコードを特定：

```bash
# エラーメッセージから関連ファイルを検索
grep -r "エラーメッセージの一部" .

# 特定のコンポーネントを調査
read src/components/GameBoard.tsx

# AI関連の場合はWASM解析資料を確認
read .kiro/specs/line-reversi-miniapp/wasm-source-analysis/
```

### 3. 仮説の立案

**Opusモデルに切り替えて複雑な分析を実施**：

私は以下の観点から仮説を立てます：

1. **直接的な原因**: エラーメッセージが示す直接的な問題
2. **タイミング問題**: 非同期処理の競合状態
3. **状態管理**: Reactの状態管理の不整合
4. **AI統合**: WebAssemblyとのインターフェース問題
5. **環境要因**: ブラウザ固有の問題やセキュリティ制限

## 仮説検証の進め方

### 1. 検証計画の作成

各仮説に対して具体的な検証手順を定義：

```markdown
## 仮説: [仮説の内容]

### 検証手順:

1. [具体的なアクション1]
2. [具体的なアクション2]
3. [期待される結果]

### 成功基準:

- [ ] エラーが再現しない
- [ ] ゲームが正常に進行する
- [ ] UIが正しく表示される
```

### 2. 検証の実行

**Sonnetモデルに切り替えて効率的に実行**：

1. **最小限の変更で検証**
   - 一度に1つの仮説のみ検証
   - 変更は最小限に留める
   - 各変更後に動作確認

2. **検証用コードの実装**

   ```javascript
   // デバッグログの追加例
   console.log('[DEBUG] Game state before move:', gameState);

   // エラーハンドリングの追加例
   try {
     await makeMove(position);
   } catch (error) {
     console.error('[ERROR] Move failed:', error);
     // フォールバック処理
   }
   ```

3. **ブラウザでの動作確認**

   ```typescript
   // 修正後の動作確認
   mcp__dev3000__execute_browser_action({
     action: 'navigate',
     params: { url: 'http://localhost:3000' },
   });

   // ゲームプレイを再現
   // エラーが発生した操作を繰り返す
   ```

### 3. 結果の記録

検証結果をtasks.mdに記録：

```markdown
## Task: [仮説の検証]

### Status: ✅ Completed

### 検証結果:

- **仮説**: [内容]
- **結果**: [確認済み/却下/要追加調査]
- **根拠**: [観察された挙動]
- **次のステップ**: [必要な追加作業]
```

## タスク管理とコミット作成

### 1. tasks.mdの管理

私は以下の構造でタスクを管理します：

```markdown
# Tasks

## 🔍 発見されたエラー

- [ ] Error 1: [エラー内容]
- [ ] Error 2: [エラー内容]

## 🧪 検証中の仮説

- [ ] Hypothesis 1: [仮説内容]
  - 検証手順: ...
  - 現在のステータス: ...

## ✅ 完了した修正

- [x] Fix 1: [修正内容]
  - 結果: [要約]
```

### 2. コミット作成の基準

各仮説検証の完了時にコミットを作成：

```bash
# コミットメッセージの形式
fix(game): [修正内容の簡潔な説明]

エラー: [遭遇したエラー]
原因: [特定した原因]
修正: [実施した修正]
結果: [動作確認結果]
```

## モデル切り替えの基準

### Opus使用場面（複雑な分析）

- 複数のエラーが絡み合っている場合
- スタックトレースが複雑で原因特定が困難な場合
- WebAssemblyとJavaScriptの境界での問題
- 新しい種類のエラーに遭遇した場合

### Sonnet使用場面（実行タスク）

- コードの修正実装
- ファイル操作（読み取り、編集、作成）
- ブラウザ操作の実行
- 簡単な動作確認

## 具体的な作業フロー例

### 例: AIが石を置けないエラーの対処

```typescript
// 1. エラーの検出
mcp__dev3000__fix_my_app({ mode: 'snapshot' });
// → "AI player failed to make move" エラーを検出

// 2. 関連コードの調査
Read('src/hooks/useAIPlayer.ts');
Read('.kiro/specs/line-reversi-miniapp/wasm-source-analysis/interface-spec.md');

// 3. 仮説立案（Opusモデル）
// 「WebAssemblyへの引数が不正な形式」という仮説

// 4. 検証実装（Sonnetモデル）
Edit('src/hooks/useAIPlayer.ts', {
  old: 'const result = await ai.getMove(board)',
  new: "console.log('[DEBUG] Board state:', board);\nconst result = await ai.getMove(board)",
});

// 5. 動作確認
mcp__dev3000__execute_browser_action({
  action: 'navigate',
  params: { url: 'http://localhost:3000' },
});

// 6. 結果記録
Edit('tasks.md', {
  /* 検証結果を追加 */
});

// 7. コミット作成
Bash(
  "git add -A && git commit -m 'fix(ai): add debug logging for WASM interface'"
);
```

## 成功の判定基準

デバッグ作業の成功は以下で判定します：

1. **ゲームの完遂**: 開始から終了まで一度もエラーなくプレイ完了
2. **全エラーの解決**: dev3000で検出されるエラーがゼロ
3. **安定性の確認**: 複数回のプレイで再現性のある動作
4. **知識の蓄積**: tasks.mdに全ての問題と解決策が記録

## 注意事項

- **破壊的変更を避ける**: 既存の動作を大きく変更しない
- **段階的な修正**: 一度に複数の問題を解決しようとしない
- **ロールバック可能**: いつでも前の状態に戻せるようにする
- **ドキュメント化**: 発見した問題と解決策は必ず記録する

このデザインドキュメントに従って、私（Claude Code）は自律的にリバーシゲームのデバッグ作業を進めていきます。
