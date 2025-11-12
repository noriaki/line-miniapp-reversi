# Technology Stack

## Architecture

**Static-first with Client-side Game Engine**:

- SSGで静的HTML生成(高速初期表示)
- クライアント側でゲームロジック・AI計算完結
- Server/Client Component明確分離(Next.js App Router)
- Web Worker経由のWASM実行(UI非ブロック)

## Core Technologies

- **Language**: TypeScript 5.x (strict mode)
- **Framework**: Next.js 15.x (App Router, Static Export)
- **Runtime**: Node.js 24.x (nodenv管理、`.node-version`指定)
- **UI Library**: React 18.x
- **AI Engine**: WebAssembly (Egaroucid ai.wasm)

## Key Libraries

- **Styling**: Tailwind CSS + CSS Modules
- **Package Manager**: pnpm 9.x
- **Testing**: Jest + React Testing Library + Playwright (E2E)
- **Debug Tools**: dev3000 (MCP server for AI-assisted debugging) + ngrok (external access)
- **LINE Integration**: LIFF SDK 2.x (implemented, production-ready)

## Development Standards

### Type Safety

- TypeScript strict mode有効
- `any`型の使用禁止
- Result型パターンでエラーハンドリング(Railway-oriented programming)
- WASM境界での型安全性確保

```typescript
// Result型によるエラーハンドリング
type Result<T, E> = { success: true; value: T } | { success: false; error: E };
```

### Code Quality

- ESLint: Next.js推奨設定(`eslint-config-next`)
- Prettier: コードフォーマット自動化
- Type Check: `tsc --noEmit`でビルド前検証
- Anti-patterns: NODE_ENV分岐の回避(本番コードでは環境依存ロジックを排除)

### Testing

- **Jest**: ユニット・統合テスト、全指標90%以上カバレッジ達成(Branches 92.51%)
- **Coverage Enforcement**: jest.config.jsで90%閾値強制(Statements, Branches, Functions, Lines)
- **Playwright**: E2E テスト(game-flow, AI対戦, responsive, WASM error)
- **Multi-device Testing**: Desktop Chrome, Mobile Chrome, Mobile Safari
- **Test Modes**: UI mode、headed mode、プロジェクト別実行(chromium/mobile特化)
- **Pure Functions重視**: テスタビリティ向上
- **Worker Factory Pattern**: Web Workerのテスト分離(`worker-factory.ts` + `__mocks__/`)
- **Mock Infrastructure**: Worker通信シミュレーション、非同期制御、タイムアウトテスト

## Development Environment

### Required Tools

- Node.js 24.x (nodenv推奨)
- pnpm 9.x
- 推奨エディタ: VSCode + TypeScript Extension

### Common Commands

```bash
# Dev
pnpm dev                 # 通常開発モード
pnpm dev:debug           # デバッグモード (dev3000 + MCP server)
pnpm dev:serve:debug     # デバッグ + ngrok外部公開 (LIFF実機テスト用)

# Build (Static Export)
pnpm build

# Test
pnpm test                # Jestユニットテスト
pnpm test:e2e            # Playwright E2Eテスト (全デバイス)
pnpm test:e2e:ui         # Playwright UIモード
pnpm test:e2e:chromium   # Desktop Chromeのみ
pnpm test:e2e:mobile     # Mobile Chrome/Safari
pnpm test:coverage       # カバレッジ付きテスト

# Lint & Format
pnpm lint
pnpm format
```

## Key Technical Decisions

### Server/Client Boundary

- **page.tsx**: Server Component(SSG)、静的レイアウト・メタデータ
- **GameBoard.tsx**: Client Component("use client")、全ゲームロジック
- 理由: SSG高速化とゲームロジック明確分離のバランス

### WASM Integration & Worker Pattern

- **WASMBridge**: メモリ管理・データ変換・エラーハンドリング隠蔽
- **AIEngine**: 高レベルAPI(型安全なインタフェース)
- **Web Worker**: UI非ブロック(0.5-2秒のAI計算)
- **Worker Factory**: テスト容易性向上(`worker-factory.ts` + `__mocks__/`)
- **Webpack 5 静的解析要件**: Worker URL を直接インライン化(変数経由禁止)
- 理由: 型安全性・保守性・UX応答性・テスタビリティ

```typescript
// ✅ Correct: Inline Worker URL for webpack 5 static analysis
new Worker(new URL('../workers/ai-worker', import.meta.url), {
  type: 'module',
});

// ❌ Wrong: Variable breaks webpack static analysis
const workerUrl = new URL('../workers/ai-worker', import.meta.url);
new Worker(workerUrl, { type: 'module' }); // Causes MIME type errors
```

### State Management

- React Hooks(useState, useReducer)のみ
- カスタムフック分離: `useGameState`, `useGameLogic`, `useAIPlayer`, `useLiff`
- React Context: LIFF状態共有(`LiffContext`, `LiffProvider`)
- 理由: シンプルなゲーム状態は外部ライブラリ不要

### Immutability

- Board状態は常に新しいインスタンス生成(Immutable pattern)
- 理由: React State更新の整合性保証、バグ防止

### Error Handling & Resilience

- **Result型パターン**: WASM境界でのエラー伝搬
- **AI Fallback**: WASM初期化失敗時のフォールバック機能(ai-fallback.ts)
- **Error Boundary**: UIレベルでのエラー回復(ErrorBoundary.tsx)
- 理由: WebAssembly統合の不確実性への対応、UX維持

### Debug & Development Tools

- **dev3000**: サーバー/ブラウザイベント統合タイムライン記録
- **MCP Server**: Claude Code (CLI)によるAI支援デバッグ
- **通常開発との分離**: `pnpm dev` (軽量) vs `pnpm dev:debug` (包括的)
- 理由: 問題発生時の診断効率化、通常開発のオーバーヘッド回避

### LIFF Integration

- **Environment Detection**: 自動判定(LINEアプリ内 vs スタンドアロン)
- **Graceful Degradation**: LIFF未対応環境でもフル機能動作
- **Error Recovery**: 初期化失敗時のフォールバック機能
- 理由: LINEユーザ体験向上、外部アクセスでも完全動作保証

---

_created_at: 2025-10-21_
_updated_at: 2025-11-12_

**Recent Updates (2025-11-12)**:

- Worker Factory: Fixed webpack 5 static analysis by inlining Worker URL construction
- Critical pattern: Worker URL must be inline (no variables) for webpack bundling

**Previous Updates (2025-11-03)**:

- Test coverage achievement: Branches 92.51% (all metrics 90%+)
- Added Worker Factory pattern for testable Web Worker integration
- Coverage threshold enforcement in jest.config.js (90% required)
- NODE_ENV anti-pattern removal from production code
- Enhanced error handling integration tests

**Earlier Updates (2025-11-02)**:

- LIFF SDK integration completed (implemented 2025-10-26)
- Added LIFF integration section with graceful degradation pattern
- Updated State Management to include LIFF Context pattern
- Added ngrok script for LIFF device testing (dev:serve:debug)
