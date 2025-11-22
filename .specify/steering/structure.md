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

### React State Management (`/src/hooks/`)

**Purpose**: Custom React hooks for game state, AI player, LIFF integration
**Pattern**: Encapsulate stateful logic, consume pure lib functions
**Example**:

```typescript
// useGameState.ts - Game state machine
// useAIPlayer.ts - AI worker coordination
// useLiff.ts - LIFF context consumer
```

### UI Components (`/src/components/`)

**Purpose**: Presentational components with visual logic
**Pattern**: Receive props from hooks, render UI, emit events
**Example**: `GameBoard.tsx` (game grid + animations), `ErrorBoundary.tsx`

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

### Next.js App Router (`/app/`)

**Purpose**: Server Components, layouts, page routes
**Pattern**: Minimal logic - layout wraps client components
**Example**: `layout.tsx` (wraps app with `<LiffProvider>`), `page.tsx` (renders `<GameBoard>`)

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

---

_Document patterns, not file trees. New files following patterns shouldn't require updates_
