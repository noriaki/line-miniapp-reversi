# Project Structure

## Organization Philosophy

**Layer-based with Domain Separation**:

- Presentation Layer: Next.js App Router(Server/Client分離)
- Game Logic Layer: Pure Functions(ビジネスロジック)
- AI Engine Layer: WASM統合・Worker管理
- LINE Integration Layer: LIFF SDK統合・Context管理

サーバサイド(SSG)とクライアントサイド(動的ロジック)を明確に分離。

## Directory Patterns

### App Router Pages (`/app/`)

**Location**: `/app/`
**Purpose**: Next.js App Router、Server Components、静的ページ生成
**Example**:

- `page.tsx`: Server Component(SSG)、メタデータ・初期HTML
- `layout.tsx`: グローバルレイアウト
- `globals.css`: Tailwind CSSベーススタイル

### Source Code (`/src/`)

**Location**: `/src/`
**Purpose**: クライアント側実装、ゲームロジック、AI統合
**Example**:

- `/src/lib/game/`: ゲームドメインロジック(Pure Functions)
- `/src/lib/ai/`: AI Engine、WASM統合、Fallback機能
- `/src/lib/liff/`: LIFF SDK統合、型定義
- `/src/workers/`: Web Worker(WASM実行隔離)
- `/src/components/`: UIコンポーネント(GameBoard, ErrorBoundary, WASMErrorHandler)
- `/src/contexts/`: React Context(LiffContext, LiffProvider)
- `/src/hooks/`: カスタムReact Hooks(useGameState, useAIPlayer, useGameErrorHandler, useLiff)

### Game Logic (`/src/lib/game/`)

**Location**: `/src/lib/game/`
**Purpose**: リバーシルール実装(Pure Functions)
**Example**:

- `types.ts`: ゲームドメイン型定義(Player, Board, Position, GameState)
- `game-logic.ts`: 手の有効性・石配置・反転処理
- `move-validator.ts`: 反転可能石の検索
- `game-end.ts`: ゲーム終了判定・勝敗判定
- `board.ts`: ボード初期化・石数カウント
- `__tests__/`: ユニットテスト(90%カバレッジ目標)

### AI Engine (`/src/lib/ai/`)

**Location**: `/src/lib/ai/`
**Purpose**: WASM統合・メモリ管理・データ変換・フォールバック機能
**Example**:

- `types.ts`: WASM型定義・エラー型(Result型パターン)
- `ai-engine.ts`: 高レベルAPI(initialize, calculateMove)
- `wasm-bridge.ts`: WASM低レベル操作(encodeBoard, callAIFunction)
- `wasm-loader.ts`: WASMロード・初期化
- `ai-fallback.ts`: WASM失敗時のフォールバックAI(ランダム手)
- `__tests__/`: 統合テスト、フォールバックテスト

### Web Workers (`/src/workers/`)

**Location**: `/src/workers/`
**Purpose**: UI非ブロックのWASM実行
**Example**:

- `ai-worker.ts`: Worker thread、WASM計算実行、Message通信

### UI Components (`/src/components/`)

**Location**: `/src/components/`
**Purpose**: Client Components、ゲームUI、エラーハンドリング
**Example**:

- `GameBoard.tsx`: メインゲームボードUI、ユーザー操作管理
- `ErrorBoundary.tsx`: Reactエラー境界、クラッシュ回復
- `WASMErrorHandler.tsx`: WASM固有エラーUI
- `__tests__/`: コンポーネントテスト

### Custom Hooks (`/src/hooks/`)

**Location**: `/src/hooks/`
**Purpose**: 状態管理・ロジック分離・再利用性
**Example**:

- `useGameState.ts`: ゲーム状態管理(board, player, validMoves)
- `useAIPlayer.ts`: AI計算実行・Worker通信
- `useGameErrorHandler.ts`: エラー状態・メッセージ管理
- `useLiff.ts`: LIFF Context消費・状態アクセス
- `__tests__/`: フックテスト

### React Contexts (`/src/contexts/`)

**Location**: `/src/contexts/`
**Purpose**: グローバル状態共有、Context Provider管理
**Example**:

- `LiffContext.tsx`: LIFF状態Context定義
- `LiffProvider.tsx`: LIFF初期化・状態管理Provider
- `__tests__/`: Context/Providerテスト

### LINE Integration (`/src/lib/liff/`)

**Location**: `/src/lib/liff/`
**Purpose**: LIFF SDK統合、型定義

**Example**:

- `types.ts`: LIFF型定義（公式Profile型の再エクスポート、LiffContextType）
- `__tests__/`: LIFF統合テスト（型安全性検証）

**Note**: LIFF SDK操作は公式APIを直接呼び出すため、ラッパークラスは不要（詳細は`.kiro/steering/line-liff.md`参照）

### E2E Tests (`/e2e/`)

**Location**: `/e2e/`
**Purpose**: Playwrightエンドツーエンドテスト
**Example**:

- `game-flow.spec.ts`: ゲームフロー全体テスト
- `ai-game.spec.ts`: AI対戦シナリオテスト
- `responsive.spec.ts`: レスポンシブデザインテスト
- `wasm-error.spec.ts`: WASMエラーハンドリングテスト

### Specifications & Settings (`/.kiro/`)

**Location**: `/.kiro/`
**Purpose**: Kiro開発フレームワーク設定・仕様書
**Example**:

- `/steering/`: プロジェクトメモリ(この文書含む)
- `/specs/`: 機能仕様書(Requirements, Design, Tasks)
- `/settings/`: ルール・テンプレート

### Documentation (`/docs/`)

**Location**: `/docs/`
**Purpose**: プロジェクトドキュメント
**Example**:

- `DEBUG_SETUP.md`: dev3000デバッグ環境セットアップガイド

## Naming Conventions

- **Files**: kebab-case (`game-logic.ts`, `ai-worker.ts`)
- **Types/Interfaces**: PascalCase (`GameState`, `Position`, `AIEngine`)
- **Functions**: camelCase (`validateMove`, `calculateValidMoves`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TIMEOUT_MS`)
- **Components**: PascalCase (`GameBoard.tsx`)

## Import Organization

```typescript
// 外部ライブラリ
import { useState } from 'react';

// 内部モジュール(絶対パス)
import { GameLogic } from '@/lib/game/game-logic';
import type { Board, Player } from '@/lib/game/types';

// 相対パス(同階層・サブディレクトリ)
import { validateMove } from './move-validator';
```

**Path Aliases**:

- `@/`: `/src/`にマップ(tsconfig.json設定)

## Code Organization Principles

### Layer Separation

- **Presentation → Logic**: 許可(UIからロジック呼び出し)
- **Logic → Presentation**: 禁止(Pure Functionsは依存なし)
- **WASM Bridge → Game Logic**: 禁止(境界を越えない)

### Pure Functions First

- Game Logicは全てPure Functions(副作用なし、Immutable)
- テスタビリティ・保守性重視
- State管理はReact Hooksに委譲

### Test Co-location

- `__tests__/`ディレクトリを実装と同階層に配置
- ユニット/統合テスト: `<module>.test.ts`形式
- E2Eテスト: `/e2e/<feature>.spec.ts`形式(Playwright)

### Error Recovery Pattern

- **エラー境界**: ErrorBoundaryで最上位キャッチ
- **フォールバック**: ai-fallbackでWASM失敗時の代替
- **状態管理**: useGameErrorHandlerでエラー状態一元管理
- UIクラッシュ防止と継続的なUX提供

---

_created_at: 2025-10-21_
_updated_at: 2025-11-02_

**Recent Updates (2025-11-02)**:

- Added LINE Integration Layer documentation (`/src/lib/liff/`)
- Added React Contexts pattern (`/src/contexts/`)
- Added `useLiff` hook to Custom Hooks section
- Updated layer architecture to reflect LIFF SDK integration
