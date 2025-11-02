# テスト一覧ドキュメント

プロジェクト内の全テストケースを網羅的に記録したドキュメント集です。

## 📁 ディレクトリ構造

```
/docs/tests/
  /unit/          - ユニットテスト（34ファイル）
    /ai/          - AI関連（7ファイル）
    /game/        - ゲームロジック関連（7ファイル）
    /workers/     - Workers（1ファイル）
    /app-pages/   - App Pages（2ファイル）
    /components/  - Components（10ファイル）
    /hooks/       - Hooks（3ファイル）
    /contexts/    - Contexts（1ファイル）
    /lib-liff/    - Lib/LIFF（1ファイル）
    /integration/ - 統合テスト（4ファイル、unit配下に配置）
  /e2e/           - E2Eテスト（8ファイル）
```

## 📊 統計

- **総ドキュメントファイル数**: 42ファイル
- **Unit Tests**: 30ファイル（純粋なユニットテスト）
- **Integration Tests**: 4ファイル（unit配下に配置）
- **E2E Tests**: 8ファイル
- **総テスト実行ファイル数**: 34ファイル（src内）

## 🗂️ ユニットテスト

### AI関連（7ファイル）

| ファイル                       | テスト数 | 削除推奨 | ドキュメント                                |
| ------------------------------ | -------- | -------- | ------------------------------------------- |
| ai-engine.test.ts              | 13       | 0        | [詳細](./unit/ai/ai-engine.md)              |
| index.test.ts                  | 1        | 1        | [詳細](./unit/ai/index.md)                  |
| ai-fallback.test.ts            | 3        | 1        | [詳細](./unit/ai/ai-fallback.md)            |
| wasm-bridge.test.ts            | 23       | 0        | [詳細](./unit/ai/wasm-bridge.md)            |
| wasm-loader-emscripten.test.ts | 37       | 0        | [詳細](./unit/ai/wasm-loader-emscripten.md) |
| wasm.integration.test.ts       | 60       | 0        | [詳細](./unit/ai/wasm-integration.md)       |
| ai-engine.integration.test.ts  | 2        | 0        | [詳細](./unit/ai/ai-engine-integration.md)  |

### ゲームロジック関連（7ファイル）

| ファイル                             | テスト数 | 削除推奨 | ドキュメント                                        |
| ------------------------------------ | -------- | -------- | --------------------------------------------------- |
| board.test.ts                        | 13       | 0        | [詳細](./unit/game/board.md)                        |
| game-end.test.ts                     | 11       | 0        | [詳細](./unit/game/game-end.md)                     |
| index.test.ts                        | 1        | 1        | [詳細](./unit/game/index.md)                        |
| cell-id.test.ts                      | 8        | 4        | [詳細](./unit/game/cell-id.md)                      |
| move-history.test.ts                 | 23       | 20       | [詳細](./unit/game/move-history.md)                 |
| game-logic.comprehensive.test.ts     | 26       | 0        | [詳細](./unit/game/game-logic-comprehensive.md)     |
| move-validator.comprehensive.test.ts | 19       | 0        | [詳細](./unit/game/move-validator-comprehensive.md) |

### Workers（1ファイル）

| ファイル          | テスト数 | 削除推奨 | ドキュメント                        |
| ----------------- | -------- | -------- | ----------------------------------- |
| ai-worker.test.ts | 2        | 2        | [詳細](./unit/workers/ai-worker.md) |

### App Pages（2ファイル）

| ファイル        | テスト数 | 削除推奨 | ドキュメント                       |
| --------------- | -------- | -------- | ---------------------------------- |
| page.test.tsx   | 4        | 0        | [詳細](./unit/app-pages/page.md)   |
| layout.test.tsx | 6        | 0        | [詳細](./unit/app-pages/layout.md) |

### Components（10ファイル）

| ファイル                              | テスト数 | 削除推奨 | ドキュメント                                              |
| ------------------------------------- | -------- | -------- | --------------------------------------------------------- |
| ErrorBoundary.test.tsx                | 8        | 2        | [詳細](./unit/components/ErrorBoundary.md)                |
| WASMErrorHandler.test.tsx             | 7        | 1        | [詳細](./unit/components/WASMErrorHandler.md)             |
| GameBoard-error-handling.test.tsx     | 15       | 0        | [詳細](./unit/components/GameBoard-error-handling.md)     |
| GameBoard-pass-logic.test.tsx         | 15       | 0        | [詳細](./unit/components/GameBoard-pass-logic.md)         |
| GameBoard-pass-performance.test.tsx   | 10       | 0        | [詳細](./unit/components/GameBoard-pass-performance.md)   |
| GameBoard-liff.test.tsx               | 12       | 0        | [詳細](./unit/components/GameBoard-liff.md)               |
| GameBoard.integration.test.tsx        | 7        | 0        | [詳細](./unit/components/GameBoard-integration.md)        |
| GameBoard.final-verification.test.tsx | 20       | 0        | [詳細](./unit/components/GameBoard-final-verification.md) |
| GameBoard.test.tsx                    | 30       | 0        | [詳細](./unit/components/GameBoard.md)                    |
| ErrorBoundary.integration.test.tsx    | 7        | 0        | [詳細](./unit/components/ErrorBoundary-integration.md)    |

### Hooks（3ファイル）

_注: useGameErrorHandlerとuseGameStateは、それぞれ通常版と-pass版の2つのテストファイルを統合ドキュメント化しています_

| ドキュメント           | 対象テストファイル                                              | テスト数      | 削除推奨 | リンク                                      |
| ---------------------- | --------------------------------------------------------------- | ------------- | -------- | ------------------------------------------- |
| useGameErrorHandler.md | useGameErrorHandler.test.ts<br>useGameErrorHandler-pass.test.ts | 18<br>(10+8)  | 0        | [詳細](./unit/hooks/useGameErrorHandler.md) |
| useGameState.md        | useGameState.test.ts<br>useGameState-pass.test.ts               | 27<br>(16+11) | 0        | [詳細](./unit/hooks/useGameState.md)        |
| useLiff.md             | useLiff.test.tsx                                                | 15            | 0        | [詳細](./unit/hooks/useLiff.md)             |

### Contexts（1ファイル）

| ファイル              | テスト数 | 削除推奨 | ドキュメント                            |
| --------------------- | -------- | -------- | --------------------------------------- |
| LiffProvider.test.tsx | 20       | 0        | [詳細](./unit/contexts/LiffProvider.md) |

### Lib/LIFF（1ファイル）

| ファイル            | テスト数 | 削除推奨 | ドキュメント                           |
| ------------------- | -------- | -------- | -------------------------------------- |
| type-safety.test.ts | 8        | TBD      | [詳細](./unit/lib-liff/type-safety.md) |

## 🔗 統合テスト

_注: 統合テストのドキュメントは、関連するモジュール配下（unit/components/, unit/ai/）に配置されています_

| ファイル                           | テスト数 | ドキュメント                                           |
| ---------------------------------- | -------- | ------------------------------------------------------ |
| ErrorBoundary.integration.test.tsx | 8        | [詳細](./unit/components/ErrorBoundary-integration.md) |
| GameBoard.integration.test.tsx     | 7        | [詳細](./unit/components/GameBoard-integration.md)     |
| ai-engine.integration.test.ts      | 2        | [詳細](./unit/ai/ai-engine-integration.md)             |
| wasm.integration.test.ts           | 60       | [詳細](./unit/ai/wasm-integration.md)                  |

## 🌐 E2Eテスト

| ファイル                      | テスト数 | ドキュメント                           |
| ----------------------------- | -------- | -------------------------------------- |
| ai-game.spec.ts               | 7        | [詳細](./e2e/ai-game.md)               |
| game-flow.spec.ts             | 6        | [詳細](./e2e/game-flow.md)             |
| responsive.spec.ts            | 6        | [詳細](./e2e/responsive.md)            |
| wasm-error.spec.ts            | 4        | [詳細](./e2e/wasm-error.md)            |
| pass-feature.spec.ts          | 12       | [詳細](./e2e/pass-feature.md)          |
| element-id-assignment.spec.ts | 8        | [詳細](./e2e/element-id-assignment.md) |
| move-history.spec.ts          | 6        | [詳細](./e2e/move-history.md)          |
| ai-negative-value-fix.spec.ts | 2        | [詳細](./e2e/ai-negative-value-fix.md) |

## 📈 削除推奨テストのサマリー

詳細は [test-cleanup-recommendations.md](../test-cleanup-recommendations.md) を参照してください。

### 削除推奨テスト数: 52件

| カテゴリ                     | テスト数 | 割合 |
| ---------------------------- | -------- | ---- |
| 起こり得ないエッジケース     | 14+      | 27%  |
| 標準ライブラリへの過剰な疑い | 15       | 29%  |
| 重複テスト                   | 14       | 27%  |
| モジュールエクスポート確認   | 3        | 6%   |
| テスト網羅性のため           | 6        | 11%  |

### 最も影響の大きいファイル

1. **move-history.test.ts**: 20+テスト削除推奨（約70%）
2. **cell-id.test.ts**: 4テスト削除推奨（約50%）
3. **エクスポート確認のみのファイル**: 3ファイル（完全削除可能）

## 🔍 ドキュメントの見方

各テストファイルのドキュメントには以下の情報が含まれます：

- **ファイルパス**: テストファイルの場所
- **テスト対象コード**: テスト対象の実装ファイル
- **テストケース一覧**:
  - 元のテストタイトル（英語）
  - 日本語のテストタイトル
  - テスト内容の説明
  - 期待値（expect文）
  - 削除判定チェックボックス
  - 削除理由（該当する場合）

## 📝 凡例

### 削除判定チェックボックス

- [ ] 不要 - 保持推奨
- [x] 不要 - 削除推奨

### 削除理由の分類

1. **モジュールエクスポート確認**: TypeScript コンパイルで保証される
2. **標準ライブラリへの過剰な疑い**: Math.random(), Array.join() など
3. **起こり得ないエッジケース**: ゲームルール上発生しない範囲外の値
4. **重複テスト**: 同じロジックを異なる観点から繰り返しテスト
5. **テスト網羅性のため**: 実質的な価値のないテスト

---

_作成日: 2025/11/02_
_最終更新: 2025/11/02（ドキュメント構造の実態に合わせて修正）_
