# LINE Mini App Reversi

LINEミニアプリプラットフォーム上で動作するリバーシ(オセロ)ゲーム。WebAssembly実装のAI(Egaroucid)と対戦できます。

## Features

- **AI対戦**: WebAssembly(Egaroucid)による高性能なリバーシAIとの対戦
- **LINE統合**: LINEミニアプリとしてシームレスに動作
- **レスポンシブUI**: スマートフォンに特化した直感的なタッチ操作
- **高速な動作**: SSG(Static Site Generation)による2秒以内の初期表示

## Tech Stack

- **Language**: TypeScript 5.x (strict mode)
- **Framework**: Next.js 15.x (App Router, Static Export)
- **Runtime**: Node.js 24.x
- **UI Library**: React 18.x
- **AI Engine**: WebAssembly (Egaroucid ai.wasm)
- **Styling**: Tailwind CSS + CSS Modules
- **Package Manager**: pnpm 9.x
- **LINE Integration**: LIFF SDK 2.x (official SDK with direct API usage, no wrapper classes)
- **Testing**: Jest + React Testing Library + Playwright + @line/liff-mock

## Getting Started

### Prerequisites

- Node.js 24.x (nodenv推奨)
- pnpm 9.x

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

```bash
# Development server (http://localhost:3000)
pnpm dev

# Development server with debugging (http://localhost:3030)
pnpm dev:debug

# Production build (Static Export)
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Lint & Format
pnpm lint
pnpm format

# Type check
pnpm type-check
```

## Debugging with AI Tools

このプロジェクトは **dev3000** を統合し、AI 支援デバッグ環境を提供します。

### クイックスタート

デバッグモードでアプリケーションを起動します：

```bash
pnpm dev:debug
```

このコマンドにより、以下が自動的に起動します：

- Next.js Dev Server (Port 3030)
- dev3000 Timeline Dashboard (Port 3684)
- dev3000 MCP Server (AI デバッグツール)
- Playwright Chrome (自動ブラウザ監視)

### Timeline Dashboard

ブラウザで [http://localhost:3684/logs](http://localhost:3684/logs) にアクセスすると、サーバーログ、ブラウザイベント、ネットワークリクエスト、スクリーンショットを統合タイムラインで確認できます。

### AI デバッグ支援

**Claude Code (CLI)** が dev3000 の記録データにアクセスし、問題の診断と修正提案を提供します。

詳細なセットアップ手順と使用方法については、[/docs/DEBUG_SETUP.md](/docs/DEBUG_SETUP.md) を参照してください。

## LIFF Integration

本プロジェクトは **LIFF SDK 2.x** を使用し、公式 API を直接呼び出すシンプルな統合パターンを採用しています。

### 設計方針

- **公式型定義の直接利用**: `@line/liff` パッケージの型定義を直接使用（独自型ラッピングなし）
- **直接 API 呼び出し**: `liff.init()`, `liff.getProfile()` 等を直接呼び出し（ラッパークラス削除済み）
- **公式 Mock ライブラリ活用**: `@line/liff-mock` による統合テスト
- **最小限の実装**: Next.js/React 統合に必要な最小限のコード（Provider, Context, Hook）のみ維持

### アーキテクチャ

```
/src/contexts/
  LiffContext.tsx   # React Context定義
  LiffProvider.tsx  # LIFF初期化・状態管理（公式SDK直接使用）
/src/hooks/
  useLiff.ts        # LIFF Context消費Hook
/src/lib/liff/
  types.ts          # 型定義（公式Profileを再エクスポート）
```

詳細は `.kiro/steering/line-liff.md` を参照してください。

## Project Structure

```
/app/               # Next.js App Router (Server Components)
/src/
  /lib/
    /game/          # Game domain logic (Pure Functions)
    /ai/            # AI Engine, WASM integration
    /liff/          # LIFF type definitions (official types re-export)
  /contexts/        # React Context (LiffProvider, LiffContext)
  /workers/         # Web Worker (WASM execution)
  /components/      # UI components
  /hooks/           # Custom React Hooks (useLiff, useGameState, etc.)
/docs/              # Project documentation
/.kiro/             # Kiro development framework
  /steering/        # Project memory (product, tech, structure, line-liff)
  /specs/           # Feature specifications
```

## Testing Strategy

- **Unit Tests**: Game Logic (90%+ coverage target)
- **Integration Tests**: WASM Bridge, AI Engine
- **E2E Tests**: Playwright (full game scenarios)

## Development Standards

- **Type Safety**: TypeScript strict mode, no `any` types
- **Code Quality**: ESLint, Prettier, Pre-commit hooks (Husky + lint-staged)
- **Immutability**: Immutable patterns for game state
- **Pure Functions**: Game logic as Pure Functions (testable, maintainable)

## CI/CD

GitHub Actions による自動品質ゲート：

- Lint & Format Check
- Type Check
- Tests with Coverage
- Production Build
- Claude Code AI Review (PR時)

## License

MIT

## Contributing

1. Create a feature branch
2. Implement with TDD
3. Run quality gates (`pnpm lint`, `pnpm type-check`, `pnpm test`)
4. Push and create Pull Request
5. Wait for CI and Claude Code review
