# Technology Stack

## Architecture

**Static-First Mini App**: Next.js with static export (`output: 'export'`) for CDN-optimized delivery. Game logic isolated as pure functions, AI execution offloaded to Web Workers for non-blocking UI.

**Domain-Driven Organization**: Clear separation between game logic (`/lib/game`), AI engine (`/lib/ai`), LINE integration (`/lib/liff`), and UI components. Immutable state patterns throughout.

## Core Technologies

- **Language**: TypeScript 5.x (strict mode enabled)
- **Framework**: Next.js 16.x (App Router, Static Export mode)
- **Runtime**: Node.js 24.x (development), Static HTML/JS (production)
- **UI Library**: React 19.x (client components for interactivity)
- **Package Manager**: pnpm 9.x

## Key Libraries

- **LIFF SDK 2.x**: Official LINE Front-end Framework (direct API usage, no wrapper classes)
- **Egaroucid WASM**: High-performance Reversi AI engine (loaded via Web Workers)
- **Tailwind CSS + Plain CSS**: Utility-first styling with component-scoped plain CSS for complex animations (GameBoard.css)
- **@line/liff-mock**: Official LIFF testing utilities

## Development Standards

### Type Safety

- TypeScript strict mode enforced (`strict: true`)
- No `any` types permitted
- Immutable types for game state (`ReadonlyArray`, `readonly` properties)
- Official LIFF types from `@line/liff` used directly (no custom type wrappers)

### Code Quality

- **Linting**: ESLint with Next.js config + Prettier integration
- **Pre-commit**: Husky + lint-staged for automated quality gates
- **Formatting**: Prettier enforced on all commits
- **Pure Functions**: Game logic implemented as stateless pure functions for testability

### Testing

- **Unit Tests**: Jest + React Testing Library (90%+ coverage target)
- **Integration Tests**: WASM bridge, AI engine, LIFF integration
- **E2E Tests**: Playwright (mobile Chrome + Safari profiles)
- **LIFF Mocking**: `@line/liff-mock` for LINE-specific scenarios

## Development Environment

### Required Tools

- Node.js 24.x (managed via nodenv)
- pnpm 9.x
- Optional: dev3000 for AI-assisted debugging

### Common Commands

```bash
# Dev: pnpm dev (http://localhost:3000)
# Dev w/ Debug: pnpm dev:debug (http://localhost:3030 + dev3000 timeline)
# Build: pnpm build (static export to /out)
# Test: pnpm test (unit + integration)
# E2E: pnpm test:e2e (Playwright)
# Quality: pnpm lint && pnpm type-check
```

## Key Technical Decisions

**Static Export over SSR**: Mini apps benefit from CDN caching and predictable performance. No server-side rendering needed for game logic.

**Web Workers for AI**: WASM execution in dedicated worker prevents UI blocking during AI computation (critical for mobile responsiveness).

**Direct LIFF SDK Usage**: No abstraction layers over `@line/liff` - use official types and APIs directly. Keeps codebase aligned with LINE's best practices and reduces maintenance overhead.

**Immutable Game State**: All game state transitions return new objects (no mutations). Enables time-travel debugging and simplifies testing.

**Pure Function Game Logic**: Game rules (`/lib/game`) are stateless pure functions. React hooks (`/hooks`) manage state, components handle UI. Clear separation of concerns.

---

_Document standards and patterns, not every dependency_
