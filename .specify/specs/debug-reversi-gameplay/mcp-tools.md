# MCP Tools Reference for debug-reversi-gameplay

## 概要

このドキュメントは、Claude Codeがdev3000を活用してリバーシゲームのデバッグ作業を自律的に実施する際に利用可能な、全てのMCPツールのリファレンスです。各ツールの用途、パラメータ、使用例を詳細に記載しています。

## ツールカテゴリ

1. [エラー検出・分析ツール](#1-エラー検出分析ツール)
2. [ブラウザ操作ツール](#2-ブラウザ操作ツール)
3. [ログ・イベント監視ツール](#3-ログイベント監視ツール)
4. [Next.js統合ツール](#4-nextjs統合ツール)
5. [デバッグ補助ツール](#5-デバッグ補助ツール)
6. [サーバー管理ツール](#6-サーバー管理ツール)
7. [Chrome DevTools高度な機能](#7-chrome-devtools高度な機能)

---

## 1. エラー検出・分析ツール

### `mcp__dev3000__fix_my_app` ⭐最重要

**概要**: エラーの自動検出と優先順位付けを行う統合デバッグツール。ビルドエラー、サーバーエラー、ブラウザエラー、ネットワークエラーを検出し、優先度順にランク付けします。

**用途**:

- 全てのエラーを一括検出
- エラーを優先度でランク付け（ビルド > サーバー > ブラウザ > ネットワーク）
- 最も深刻な問題の特定
- デバッグセッションの開始点

**パラメータ**:

```typescript
{
  mode?: "snapshot" | "bisect" | "monitor";
  focusArea?: "all" | "build" | "runtime" | "network" | "ui" | "performance";
  timeRangeMinutes?: number; // デフォルト: 10
  createPR?: boolean; // デフォルト: false
  returnRawData?: boolean; // デフォルト: false
  projectName?: string; // 複数のdev3000インスタンスがある場合
}
```

**使用例**:

```typescript
// 基本的な使い方: 全エラーの検出
mcp__dev3000__fix_my_app({
  mode: 'snapshot',
  focusArea: 'all',
  timeRangeMinutes: 10,
});

// 特定領域に絞った検出
mcp__dev3000__fix_my_app({
  mode: 'snapshot',
  focusArea: 'runtime',
  timeRangeMinutes: 5,
});

// リグレッション検出（変更前後の比較）
mcp__dev3000__fix_my_app({
  mode: 'bisect',
  timeRangeMinutes: 15,
});
```

**注意事項**:

- デバッグ作業の最初に必ず実行して全体像を把握する
- エラーが解決したら再度実行して確認する
- `mode: "snapshot"` が最も一般的な使い方

---

### `mcp__dev3000__fix_my_jank`

**概要**: レイアウトシフトやパフォーマンス問題を検出する専門ツール。

**用途**:

- UIの表示崩れ検出
- Cumulative Layout Shift (CLS)の分析
- パフォーマンスボトルネックの特定

**パラメータ**:

```typescript
{
  timeRangeMinutes?: number; // デフォルト: 10
  projectName?: string;
}
```

**使用例**:

```typescript
// UI表示問題の検出
mcp__dev3000__fix_my_jank({
  timeRangeMinutes: 10,
});
```

**注意事項**:

- UI表示に問題がある場合に使用
- `fix_my_app` で "ui" に絞るのと同じ効果

---

## 2. ブラウザ操作ツール

### `mcp__dev3000__execute_browser_action` ⭐最重要

**概要**: 統合ブラウザ操作ツール。Chrome DevToolsに自動委譲され、最適なツールで実行されます。

**用途**:

- ゲームプレイの自動化
- エラーの再現
- 動作確認
- 画面状態の取得

**パラメータ**:

```typescript
{
  action: "click" | "navigate" | "screenshot" | "evaluate" | "scroll" | "type";
  params?: {
    // action: "click"
    x?: number;
    y?: number;

    // action: "navigate"
    url?: string;

    // action: "evaluate"
    script?: string;

    // action: "type"
    text?: string;
  };
}
```

**使用例**:

```typescript
// ゲーム画面へナビゲート
mcp__dev3000__execute_browser_action({
  action: 'navigate',
  params: { url: 'http://localhost:3000' },
});

// リバーシの石を置く（クリック）
mcp__dev3000__execute_browser_action({
  action: 'click',
  params: { x: 450, y: 300 },
});

// スクリーンショット取得
mcp__dev3000__execute_browser_action({
  action: 'screenshot',
});

// JavaScriptの実行
mcp__dev3000__execute_browser_action({
  action: 'evaluate',
  params: {
    script: 'return document.querySelector(".game-board").dataset.gameState',
  },
});

// ページをスクロール
mcp__dev3000__execute_browser_action({
  action: 'scroll',
  params: { x: 0, y: 500 },
});

// テキスト入力
mcp__dev3000__execute_browser_action({
  action: 'type',
  params: { text: 'test input' },
});
```

**注意事項**:

- 最も頻繁に使用するツール
- Chrome DevToolsに自動委譲されるため、高品質な操作が保証される
- ゲームプレイの自動化に必須

---

### `mcp__dev3000__chrome-devtools_take_snapshot` ⭐重要

**概要**: アクセシビリティツリーベースのテキストスナップショットを取得。各要素にUIDが付与されます。

**用途**:

- UI状態の確認
- クリック可能な要素の特定
- 要素のUID取得（他のツールで使用）

**パラメータ**: なし

**使用例**:

```typescript
// UI状態のスナップショット取得
mcp__dev3000__chrome - devtools_take_snapshot();
```

**注意事項**:

- スクリーンショットよりも優先して使用（テキストベースで情報量が多い）
- 返されるUIDは `chrome-devtools_click` などで使用可能
- ページの階層構造と各要素の状態が分かる

---

### `mcp__dev3000__chrome-devtools_take_screenshot`

**概要**: 高品質なスクリーンショットを取得。

**用途**:

- エラー発生時の画面記録
- 視覚的な検証
- UI状態の記録

**パラメータ**:

```typescript
{
  selector?: string; // 特定要素のスクリーンショット
  fullPage?: boolean; // ページ全体のスクリーンショット
}
```

**使用例**:

```typescript
// ページ全体のスクリーンショット
mcp__dev3000__chrome - devtools_take_screenshot({ fullPage: true });

// 特定要素のスクリーンショット
mcp__dev3000__chrome - devtools_take_screenshot({ selector: '.game-board' });
```

**注意事項**:

- 視覚的な確認が必要な場合のみ使用
- テキストベースの `take_snapshot` の方が情報量が多い

---

### `mcp__dev3000__chrome-devtools_click`

**概要**: 特定の要素をクリック。

**用途**:

- UI要素のクリック操作
- ボタン、リンクの操作

**パラメータ**:

```typescript
{
  uid: string; // take_snapshotで取得したUID
}
```

**使用例**:

```typescript
// スナップショットからUIDを取得後
mcp__dev3000__chrome - devtools_click({ uid: 'element-123' });
```

**注意事項**:

- `execute_browser_action` の click でも可能
- 座標ではなくUIDで操作したい場合に使用

---

### `mcp__dev3000__chrome-devtools_evaluate_script`

**概要**: ブラウザコンテキストでJavaScriptを実行。

**用途**:

- ゲーム状態の取得
- デバッグ情報の取得
- DOM操作

**パラメータ**:

```typescript
{
  script: string; // 実行するJavaScriptコード
}
```

**使用例**:

```typescript
// ゲーム状態を取得
mcp__dev3000__chrome -
  devtools_evaluate_script({
    script: `
    const board = document.querySelector('.game-board');
    return {
      gameState: board?.dataset.gameState,
      currentPlayer: board?.dataset.currentPlayer,
      score: board?.dataset.score
    };
  `,
  });

// Reactコンポーネントの内部状態を取得
mcp__dev3000__chrome -
  devtools_evaluate_script({
    script: `
    const reactRoot = document.querySelector('#__next');
    const fiber = reactRoot?._reactRootContainer?._internalRoot?.current;
    return fiber?.memoizedState;
  `,
  });
```

**注意事項**:

- 返り値はJSON.stringifyで送信されるため、シリアライズ可能な値のみ
- 複雑なデバッグ情報の取得に有用

---

## 3. ログ・イベント監視ツール

### `mcp__dev3000__chrome-devtools_list_console_messages` ⭐重要

**概要**: ブラウザコンソールの全メッセージを取得。

**用途**:

- JavaScriptエラーの確認
- デバッグログの確認
- 警告メッセージの確認

**パラメータ**: なし

**使用例**:

```typescript
// 全コンソールメッセージを取得
mcp__dev3000__chrome - devtools_list_console_messages();
```

**出力例**:

```json
[
  {
    "id": "msg-123",
    "level": "error",
    "text": "Uncaught TypeError: Cannot read property 'move' of undefined",
    "timestamp": 1234567890,
    "url": "http://localhost:3000/game.js",
    "lineNumber": 45
  }
]
```

**注意事項**:

- エラー発生後、必ず確認する
- エラーメッセージからスタックトレースを取得できる

---

### `mcp__dev3000__chrome-devtools_list_network_requests`

**概要**: ページ読み込み以降の全ネットワークリクエストを取得。

**用途**:

- API通信失敗の確認
- リソース読み込みエラーの確認
- WebAssembly（ai.wasm）の読み込み確認

**パラメータ**: なし

**使用例**:

```typescript
// 全ネットワークリクエストを取得
mcp__dev3000__chrome - devtools_list_network_requests();
```

**出力例**:

```json
[
  {
    "url": "http://localhost:3000/ai.wasm",
    "method": "GET",
    "status": 200,
    "statusText": "OK",
    "responseSize": 123456,
    "timing": {...}
  }
]
```

**注意事項**:

- WebAssembly（ai.wasm）の読み込み確認に必須
- 404エラーや500エラーの特定に有用

---

### `mcp__dev3000__chrome-devtools_get_console_message`

**概要**: 特定のコンソールメッセージの詳細を取得。

**用途**:

- エラーメッセージの詳細確認
- スタックトレースの取得

**パラメータ**:

```typescript
{
  id: string; // list_console_messagesで取得したID
}
```

**使用例**:

```typescript
// 特定のエラーメッセージの詳細取得
mcp__dev3000__chrome - devtools_get_console_message({ id: 'msg-123' });
```

**注意事項**:

- `list_console_messages` で得たIDを使用
- 詳細なスタックトレースが必要な場合に使用

---

### `mcp__dev3000__chrome-devtools_get_network_request`

**概要**: 特定のネットワークリクエストの詳細を取得。

**用途**:

- リクエスト/レスポンスヘッダーの確認
- レスポンスボディの確認
- タイミング情報の取得

**パラメータ**:

```typescript
{
  url: string; // list_network_requestsで取得したURL
}
```

**使用例**:

```typescript
// ai.wasmの詳細情報取得
mcp__dev3000__chrome -
  devtools_get_network_request({
    url: 'http://localhost:3000/ai.wasm',
  });
```

**注意事項**:

- WebAssembly関連のエラー調査に有用

---

## 4. Next.js統合ツール

### `mcp__dev3000__nextjs-dev_nextjs_runtime` ⭐最重要

**概要**: Next.jsランタイム情報とMCPツールへのアクセス。Next.js 16+の内蔵MCPサーバーに接続します。

**用途**:

- Next.js固有のエラー情報取得
- ルート情報の確認
- ビルドステータスの監視
- コンパイルエラーの取得

**パラメータ**:

```typescript
{
  action: "discover_servers" | "list_tools" | "call_tool";
  port?: number; // Next.jsサーバーのポート（デフォルト: 3000）
  toolName?: string; // action: "call_tool" の場合
  args?: object; // action: "call_tool" の場合
}
```

**使用例**:

```typescript
// Next.jsサーバーの検出
mcp__dev3000__nextjs -
  dev_nextjs_runtime({
    action: 'discover_servers',
  });

// 利用可能なツールの一覧取得
mcp__dev3000__nextjs -
  dev_nextjs_runtime({
    action: 'list_tools',
    port: 3000,
  });

// 特定のツールを呼び出し（例: エラー取得）
mcp__dev3000__nextjs -
  dev_nextjs_runtime({
    action: 'call_tool',
    port: 3000,
    toolName: 'get-errors',
    // args は不要な場合は省略
  });
```

**注意事項**:

- Next.js 16以降が必要
- `list_tools` で利用可能なツールを確認してから使用
- `args` パラメータは必要な場合のみ指定（空オブジェクト `{}` は渡さない）

---

### `mcp__dev3000__nextjs-dev_browser_eval`

**概要**: Playwrightブラウザ自動化（Next.js専用）。

**用途**:

- Next.jsアプリケーションの自動テスト
- ページ検証

**パラメータ**:

```typescript
{
  action: 'start' | 'navigate' | 'click' | 'evaluate' | 'screenshot' | 'close';
  // 各アクションに応じたパラメータ
}
```

**使用例**:

```typescript
// ブラウザ起動
mcp__dev3000__nextjs - dev_browser_eval({ action: 'start' });

// ページ遷移
mcp__dev3000__nextjs -
  dev_browser_eval({
    action: 'navigate',
    url: 'http://localhost:3000',
  });
```

**注意事項**:

- `execute_browser_action` の方が推奨される
- Next.js専用の検証が必要な場合のみ使用

---

### `mcp__dev3000__nextjs-dev_nextjs_docs`

**概要**: Next.js公式ドキュメントを検索。

**用途**:

- Next.js固有の問題の調査
- APIリファレンスの確認

**パラメータ**:

```typescript
{
  query: string; // 検索キーワード
}
```

**使用例**:

```typescript
// Next.jsのエラーハンドリングについて調査
mcp__dev3000__nextjs - dev_nextjs_docs({ query: 'error handling' });
```

**注意事項**:

- Next.js関連の問題でドキュメント参照が必要な場合に使用

---

## 5. デバッグ補助ツール

### `mcp__dev3000__find_component_source` ⭐有用

**概要**: DOM要素からReactコンポーネントのソースコードを特定。

**用途**:

- エラーが発生した要素のソースファイル特定
- コンポーネントの実装場所の特定

**パラメータ**:

```typescript
{
  selector: string; // CSSセレクタ（小文字推奨）
  projectName?: string;
}
```

**使用例**:

```typescript
// ゲームボードのソースを特定
mcp__dev3000__find_component_source({ selector: '.game-board' });

// ナビゲーションのソースを特定
mcp__dev3000__find_component_source({ selector: 'nav' });

// 特定のボタンのソースを特定
mcp__dev3000__find_component_source({ selector: '#reset-button' });
```

**注意事項**:

- エラー発生要素のコードを修正する際に必須
- 返される情報は grep パターンなので、その後 Grep ツールで検索する

---

### `mcp__dev3000__analyze_visual_diff`

**概要**: 2つのスクリーンショットの視覚的差分を分析。

**用途**:

- UI変更前後の比較
- レイアウトシフトの分析
- 視覚的なリグレッション検出

**パラメータ**:

```typescript
{
  beforeImageUrl: string; // 変更前の画像URL
  afterImageUrl: string; // 変更後の画像URL
  context?: string; // 分析のコンテキスト（オプション）
}
```

**使用例**:

```typescript
// 修正前後のUI比較
mcp__dev3000__analyze_visual_diff({
  beforeImageUrl: 'https://example.com/before.png',
  afterImageUrl: 'https://example.com/after.png',
  context: 'ゲームボードの表示変更を確認',
});
```

**注意事項**:

- スクリーンショットのURLが必要
- UI表示の問題を視覚的に確認する際に使用

---

### `mcp__dev3000__crawl_app`

**概要**: アプリケーション内の全URLを発見。

**用途**:

- 全ページのエラー検証
- 網羅的なテスト
- リンク切れの検出

**パラメータ**:

```typescript
{
  depth?: number | "all"; // クロール深度（デフォルト: 1）
  projectName?: string;
}
```

**使用例**:

```typescript
// ホームページからのリンクを取得
mcp__dev3000__crawl_app({ depth: 1 });

// 2階層までクロール
mcp__dev3000__crawl_app({ depth: 2 });

// 全ページを網羅的にクロール
mcp__dev3000__crawl_app({ depth: 'all' });
```

**注意事項**:

- リバーシゲームは単一ページなので使用機会は少ない
- 複数ページがある場合に有用

---

## 6. サーバー管理ツール

### `mcp__dev3000__restart_dev_server` ⭐重要

**概要**: 開発サーバーを安全に再起動。dev3000の監視を維持したまま再起動します。

**用途**:

- next.config.js変更後の再起動
- 環境変数変更後の再起動
- サーバー状態のクリア

**パラメータ**:

```typescript
{
  projectName?: string;
}
```

**使用例**:

```typescript
// 開発サーバーの再起動
mcp__dev3000__restart_dev_server();
```

**注意事項**:

- **絶対に手動で `pkill` や `kill` を使用しない**
- このツールを使えばdev3000の監視が維持される
- Next.js HMRで対応できない変更の場合のみ使用
- 不必要な再起動は避ける

---

## 7. Chrome DevTools高度な機能

### `mcp__dev3000__chrome-devtools_list_pages`

**概要**: ブラウザで開いている全ページの一覧を取得。

**用途**: 複数タブがある場合のページ管理

**パラメータ**: なし

---

### `mcp__dev3000__chrome-devtools_select_page`

**概要**: 操作対象のページを選択。

**用途**: 複数タブがある場合にアクティブなページを切り替え

**パラメータ**:

```typescript
{
  index: number; // ページインデックス
}
```

---

### `mcp__dev3000__chrome-devtools_navigate_page`

**概要**: ページをナビゲート。

**用途**: URL遷移

**パラメータ**:

```typescript
{
  url: string;
}
```

**注意事項**: `execute_browser_action` の navigate でも可能

---

### `mcp__dev3000__chrome-devtools_fill`

**概要**: フォーム要素に入力。

**用途**: テキスト入力、セレクトボックスの選択

**パラメータ**:

```typescript
{
  uid: string; // 要素のUID
  value: string; // 入力値
}
```

---

### `mcp__dev3000__chrome-devtools_hover`

**概要**: 要素にホバー。

**用途**: ホバー時の動作確認

**パラメータ**:

```typescript
{
  uid: string; // 要素のUID
}
```

---

### `mcp__dev3000__chrome-devtools_drag`

**概要**: ドラッグ&ドロップ操作。

**用途**: ドラッグ可能な要素の操作

**パラメータ**:

```typescript
{
  sourceUid: string; // ドラッグ元のUID
  targetUid: string; // ドロップ先のUID
}
```

---

### `mcp__dev3000__chrome-devtools_wait_for`

**概要**: 特定のテキストが出現するまで待機。

**用途**: 非同期処理の完了待機

**パラメータ**:

```typescript
{
  text: string; // 待機するテキスト
  timeout?: number; // タイムアウト（ミリ秒）
}
```

---

### `mcp__dev3000__chrome-devtools_handle_dialog`

**概要**: ブラウザダイアログ（alert、confirm、prompt）を処理。

**用途**: ダイアログの承認/拒否

**パラメータ**:

```typescript
{
  accept: boolean; // true: OK, false: Cancel
  promptText?: string; // promptの場合の入力値
}
```

---

## 推奨される使用フロー

### Phase 1: エラー検出（初期調査）

```typescript
// 1. 全体のエラー状況を把握
mcp__dev3000__fix_my_app({
  mode: 'snapshot',
  focusArea: 'all',
  timeRangeMinutes: 10,
});

// 2. コンソールエラーを確認
mcp__dev3000__chrome - devtools_list_console_messages();

// 3. Next.js固有のエラーを確認
mcp__dev3000__nextjs -
  dev_nextjs_runtime({
    action: 'list_tools',
    port: 3000,
  });
```

### Phase 2: 状態確認

```typescript
// 4. UI状態のスナップショット取得
mcp__dev3000__chrome - devtools_take_snapshot();

// 5. 視覚的な確認（必要に応じて）
mcp__dev3000__execute_browser_action({
  action: 'screenshot',
});

// 6. ネットワークリクエストの確認
mcp__dev3000__chrome - devtools_list_network_requests();
```

### Phase 3: ゲームプレイ・検証

```typescript
// 7. ゲーム画面へナビゲート
mcp__dev3000__execute_browser_action({
  action: 'navigate',
  params: { url: 'http://localhost:3000' },
});

// 8. リバーシの石を置く
mcp__dev3000__execute_browser_action({
  action: 'click',
  params: { x: 450, y: 300 },
});

// 9. ゲーム状態を取得
mcp__dev3000__chrome -
  devtools_evaluate_script({
    script: 'return document.querySelector(".game-board").dataset',
  });

// 10. コンソールエラーを再確認
mcp__dev3000__chrome - devtools_list_console_messages();
```

### Phase 4: 原因特定

```typescript
// 11. エラー箇所のソースを特定
mcp__dev3000__find_component_source({
  selector: '.game-board',
});

// 12. 詳細なエラー情報を取得
mcp__dev3000__chrome - devtools_get_console_message({ id: 'msg-123' });
```

### Phase 5: 修正・検証

```typescript
// 13. (コード修正)

// 14. 必要に応じて再起動
mcp__dev3000__restart_dev_server();

// 15. エラー解消を確認
mcp__dev3000__fix_my_app({
  mode: 'snapshot',
  focusArea: 'all',
});

// 16. ゲームプレイを再実行して動作確認
// ... (Phase 3を繰り返し)
```

---

## 実践例: AI石配置エラーのデバッグ

```typescript
// 1. エラーの検出
const errors = await mcp__dev3000__fix_my_app({
  mode: 'snapshot',
  focusArea: 'all',
  timeRangeMinutes: 10,
});
// → "AI player failed to make move" エラーを検出

// 2. コンソールログを確認
const consoleMessages =
  (await mcp__dev3000__chrome) - devtools_list_console_messages();
// → "TypeError: Cannot read property 'getMove' of undefined" を発見

// 3. ネットワークリクエストを確認（ai.wasmが正しく読み込まれているか）
const networkRequests =
  (await mcp__dev3000__chrome) - devtools_list_network_requests();
// → ai.wasm は 200 OK で読み込み成功

// 4. ゲーム状態を取得
const gameState =
  (await mcp__dev3000__chrome) -
  devtools_evaluate_script({
    script: `
    return {
      aiLoaded: window.ai !== undefined,
      boardState: document.querySelector('.game-board')?.dataset.board
    }
  `,
  });
// → aiLoaded: false（AIが初期化されていない）

// 5. AI関連コンポーネントのソースを特定
const componentSource = await mcp__dev3000__find_component_source({
  selector: '.game-board',
});
// → "useAIPlayer.ts" を特定

// 6. (Opusモデルに切り替えて仮説立案)
// 仮説: AIの初期化タイミングが遅く、ゲーム開始時にまだ準備できていない

// 7. (Sonnetモデルに戻して修正実装)
// useAIPlayer.ts に初期化待機ロジックを追加

// 8. 動作確認
await mcp__dev3000__execute_browser_action({
  action: 'navigate',
  params: { url: 'http://localhost:3000' },
});

// 9. 再度ゲームプレイ
await mcp__dev3000__execute_browser_action({
  action: 'click',
  params: { x: 450, y: 300 },
});

// 10. エラーが解消されたか確認
const finalCheck = await mcp__dev3000__fix_my_app({
  mode: 'snapshot',
  focusArea: 'all',
});
// → エラー数: 0

// 11. tasks.mdに結果を記録
// 12. コミット作成
```

---

## 重要な注意事項

### DO（推奨される行動）

- ✅ `fix_my_app` をデバッグの最初と最後に必ず実行
- ✅ `execute_browser_action` を優先的に使用
- ✅ `take_snapshot` でUI状態を確認（スクリーンショットより優先）
- ✅ `list_console_messages` でエラーログを必ず確認
- ✅ `find_component_source` でエラー箇所を特定
- ✅ `restart_dev_server` でサーバー再起動（必要な場合のみ）

### DON'T（避けるべき行動）

- ❌ 手動で `pkill` や `kill` コマンドを使用してサーバーを停止
- ❌ 推測だけでコードを修正（必ず事実を確認）
- ❌ スクリーンショットだけで判断（スナップショットの方が情報量が多い）
- ❌ エラーログを確認せずに修正を開始
- ❌ 不必要にサーバーを再起動（HMRで十分な場合が多い）

---

## まとめ

このリファレンスを活用して、Claude Codeは以下のデバッグワークフローを自律的に実行できます：

1. **エラー検出**: `fix_my_app` で全体像を把握
2. **状態確認**: `take_snapshot` と `list_console_messages` で詳細確認
3. **ゲームプレイ**: `execute_browser_action` でゲームを操作
4. **原因特定**: `find_component_source` でソースを特定
5. **修正検証**: コード修正後、再度 `fix_my_app` で確認

全てのツールは事実ベースの判断を支援し、探索的デバッグアプローチを実現します。
