# Project Structure

## Organization Philosophy

**Domain-Driven Layering**: Code organized by technical domain (game logic, AI, LINE integration) rather than file type. Each domain is self-contained with its own types, logic, and tests co-located.

**Pure Logic vs. Stateful Hooks**: Business logic implemented as pure functions in `/lib`, state management handled by React hooks in `/hooks`, UI rendering in `/components`. Clear unidirectional dependency: Components → Hooks → Lib.

## Directory Patterns

### Game Domain (`/src/lib/game/`)

**Purpose**: Pure functional game logic - board state, move validation, game rules
**Pattern**: Immutable operations, no side effects, comprehensive unit tests co-located
**Example**:

```typescript
// board.ts - Pure functions returning new boards
export function makeMove(board: Board, pos: Position, player: Player): Board;
export function getValidMoves(board: Board, player: Player): Position[];
```

### AI Engine (`/src/lib/ai/`)

**Purpose**: WebAssembly bridge, AI engine interface, fallback logic
**Pattern**: Async operations, Worker-compatible, error boundaries
**Example**:

```typescript
// ai-engine.ts - Main AI interface
export async function getAIMove(board: Board, level: number): Promise<Position>;
// wasm-bridge.ts - WASM interop layer
// ai-fallback.ts - Fallback when WASM unavailable
```

### LINE Integration (`/src/lib/liff/`)

**Purpose**: LIFF type definitions (re-exports from `@line/liff`)
**Pattern**: Minimal - just type re-exports, no wrapper classes
**Example**:

```typescript
// types.ts - Re-export official LIFF types
export type { Profile } from '@line/liff';
```

### Share Domain (`/src/lib/share/`)

**Purpose**: Game result sharing - move encoding/decoding, LINE Flex Messages, Web Share API
**Pattern**: Pure functions for data transformation, service functions for external APIs, barrel exports
**Example**:

```typescript
// move-encoder.ts - WTHOR format encoding/decoding, board replay
export function encodeMoves(positions: Position[]): string;
export function decodeMoves(encoded: string): DecodeResult;
export function replayMoves(positions: Position[]): ReplayResult;

// flex-message-builder.ts - LINE Flex Message construction
export function buildFlexMessage(
  result: ShareResult,
  permalink: string
): FlexMessage;

// share-service.ts - Share operation orchestration
export async function shareToLine(
  result: ShareResult,
  permalink: string
): Promise<ShareOutcome>;
export async function shareToWeb(
  result: ShareResult,
  shareUrl: string
): Promise<ShareOutcome>;

// url-builder.ts - URL construction utilities
export function buildPermalink(liffId: string, path: string): string;
```

### Shared Types (`/src/types/`)

**Purpose**: Cross-domain type definitions and interfaces
**Pattern**: Discriminated unions, interface definitions for shared concerns
**Example**:

```typescript
// message.ts - Message type system with discriminated unions
export type Message =
  | { type: 'info'; text: string; timeout: number }
  | { type: 'warning'; text: string; timeout: number };
export interface MessageBoxProps {
  message: Message | null;
}
```

### React State Management (`/src/hooks/`)

**Purpose**: Custom React hooks for game state, AI player, LIFF integration, message queue, sharing
**Pattern**: Encapsulate stateful logic, consume pure lib functions
**Example**:

```typescript
// useGameState.ts - Game state machine
// useAIPlayer.ts - AI worker coordination
// useLiff.ts - LIFF context consumer
// useMessageQueue.ts - Message display queue with timeout management
// useGameInconsistencyDetector.ts - Game state validation and error detection
// useShare.ts - Share operation state, exclusion control, toast notifications
// worker-factory.ts - Worker instantiation abstraction (testable)
```

### UI Components (`/src/components/`)

**Purpose**: Presentational components with visual logic
**Pattern**: Receive props from hooks, render UI, emit events. CSS files co-located with components.
**Example**:

```typescript
// GameBoard.tsx - Game grid with animations (uses GameBoard.css)
// BoardDisplay.tsx - Static board visualization for result pages
// ShareButtons.tsx - LINE/Web share buttons with availability detection
// MessageBox.tsx - Unified message display (info/warning)
// ErrorBoundary.tsx - React error boundary wrapper
// WASMErrorHandler.tsx - WASM-specific error handling
```

### React Context (`/src/contexts/`)

**Purpose**: Global state providers (LIFF initialization)
**Pattern**: `<Provider>` + `Context` + consumer hook pattern
**Example**:

```typescript
// LiffProvider.tsx - Initializes LIFF SDK (client component)
// LiffContext.tsx - Context definition
// Consumed via useLiff() hook
```

### Web Workers (`/src/workers/`)

**Purpose**: Background thread for WASM AI execution
**Pattern**: Message-passing interface, Worker-compatible module
**Example**: `ai-worker.ts` (loads WASM, processes AI move requests)

### E2E Tests (`/e2e/`)

**Purpose**: End-to-end tests for mobile user scenarios
**Pattern**: Consolidated single-file approach, mobile-only testing (Pixel 5, iPhone 12)
**Example**:

```typescript
// game-basic.spec.ts - All basic game operations
// Pattern: Selectors constant, helper functions, test.describe groups
const SELECTORS = {
  gameBoard: '[data-testid="game-board"]',
  cell: (row: number, col: number) => `[data-row="${row}"][data-col="${col}"]`,
  // ...
} as const;

// Tests grouped by functionality
test.describe('Initial Board Display', () => {
  /* ... */
});
test.describe('Stone Placement and Flipping', () => {
  /* ... */
});
```

**E2E Conventions**:

- Mobile-first: Only Pixel 5 and iPhone 12 profiles (no desktop)
- Data attributes for selectors: `data-testid`, `data-row`, `data-col`, `data-stone`, `data-valid`
- Console monitoring for WASM fallback detection
- Async helpers: `waitForAITurn`, `waitForPlayerTurn` for turn-based interactions

### Next.js App Router (`/src/app/`)

**Purpose**: Server Components, layouts, page routes, dynamic route handlers
**Pattern**: Minimal logic in static pages, Server Components for ISR pages with dynamic data
**Example**:

```typescript
// layout.tsx - App wrapper with LiffProvider
// page.tsx - Game board page (renders GameBoard)
// r/[side]/[encodedMoves]/page.tsx - ISR result page with OGP
// r/[side]/[encodedMoves]/opengraph-image.tsx - Dynamic OG image generation
```

**ISR Route Pattern** (`/r/[side]/[encodedMoves]/`):

- `generateStaticParams()` returns empty array (on-demand generation)
- `generateMetadata()` for dynamic OGP with ImageResponse
- Server Components process URL params, render result UI
- Client wrapper components for interactive elements (ShareButtonsWrapper)

## Naming Conventions

- **Files**: kebab-case (`move-validator.ts`, `ai-engine.ts`)
- **Components**: PascalCase files for React components (`GameBoard.tsx`, `LiffProvider.tsx`)
- **Types**: PascalCase (`Board`, `Position`, `Player`)
- **Functions**: camelCase (`makeMove`, `getValidMoves`)
- **Constants**: UPPER_SNAKE_CASE (rare, mostly in configs)

## Import Organization

```typescript
// 1. External dependencies
import React from 'react';
import liff from '@line/liff';

// 2. Absolute imports via @/ alias
import { makeMove } from '@/lib/game';
import { useLiff } from '@/hooks/useLiff';

// 3. Relative imports (same domain)
import { validateMove } from './move-validator';
import type { Board, Position } from './types';
```

**Path Aliases**:

- `@/`: Maps to `/src/` (configured in tsconfig.json)

## Code Organization Principles

**Dependency Flow**: `Components → Hooks → Lib` (one-way)
**No Circular Dependencies**: Domains are independent (game logic doesn't import AI or LIFF)
**Co-located Tests**: `__tests__` directories adjacent to source files
**Pure vs. Impure Separation**: `/lib` is pure functions, `/hooks` and `/contexts` handle side effects

**LIFF Integration Pattern**:

- Provider initializes SDK → Context stores state → Hook consumes context → Components use hook
- No wrapper classes - use `liff.init()`, `liff.getProfile()` directly
- Official types from `@line/liff` package

**Worker Abstraction Pattern**:

- Worker instantiation isolated in `worker-factory.ts` for testing (uses `import.meta.url`)
- Mock implementation in `__mocks__/worker-factory.ts` for Jest compatibility
- Enables unit testing of Worker-dependent hooks without bundler setup

---

_Updated: 2025-12-14 (Added Share domain, ISR route patterns, useShare hook, share-related components)_

_Document patterns, not file trees. New files following patterns shouldn't require updates_
