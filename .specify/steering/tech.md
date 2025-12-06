# Technology Stack

## Architecture

**Hybrid Mini App**: Next.js Server Mode with Vercel deployment. Game logic isolated as pure functions, AI execution offloaded to Web Workers for non-blocking UI. API Routes handle server-side operations (e.g., image upload with presigned URLs).

**Domain-Driven Organization**: Clear separation between game logic (`/lib/game`), AI engine (`/lib/ai`), LINE integration (`/lib/liff`), API routes (`/app/api`), and UI components. Immutable state patterns throughout.

## Core Technologies

- **Language**: TypeScript 5.x (strict mode enabled)
- **Framework**: Next.js 16.0.4 (App Router, Server Mode)
- **Runtime**: Node.js 24.9.0 (development), Vercel Edge Runtime (production)
- **Deployment**: Vercel (enables API Routes and server-side features)
- **UI Library**: React 19.2.0 (client components for interactivity)
- **Package Manager**: pnpm 10.23.0

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

- **Linting**: ESLint 9 with flat config (`eslint.config.mjs`) + Next.js rules + Prettier integration
- **Pre-commit**: Husky + lint-staged for automated quality gates
- **Formatting**: Prettier enforced on all commits
- **Pure Functions**: Game logic implemented as stateless pure functions for testability

### Testing

- **Unit Tests**: Jest + React Testing Library (90%+ coverage target)
- **Integration Tests**: WASM bridge, AI engine, LIFF integration
- **E2E Tests**: Playwright (mobile-only: Pixel 5 for Chrome, iPhone 12 for Safari)
- **LIFF Mocking**: `@line/liff-mock` for LINE-specific scenarios

**Test Quality Standards**:

- **BDD Naming**: `describe('[Feature/Module]')` + `it('should [expected behavior]')`
- **No Spec References**: Prohibit `describe('Task X.Y')` or `it('Requirement N.M: ...')`
- **Single Location**: Each test scenario at one level only (unit < integration < E2E)
- **Appropriate Level**:
  - Unit: Isolated logic with mocks
  - Integration: Component interactions, external dependencies
  - E2E: User-facing workflows

**E2E Strategy**: Mobile-first testing aligned with LINE Mini App target platform. Desktop browsers excluded intentionally. Parallel execution in CI with artifact archiving.

## Development Environment

### Required Tools

- Node.js 24.9.0 (managed via nodenv)
- pnpm 10.23.0
- Optional: dev3000 for AI-assisted debugging

### Common Commands

```bash
# Dev: pnpm dev (http://localhost:3000)
# Dev w/ Debug: pnpm dev:debug (http://localhost:3030 + dev3000 timeline)
# Build: pnpm build (production build for Vercel)
# Test: pnpm test (unit + integration)
# E2E: pnpm test:e2e (Playwright)
# Quality: pnpm lint && pnpm type-check
```

## Key Technical Decisions

**Server Mode over Static Export**: Enables API Routes for server-side operations (e.g., presigned URL generation for image uploads). Deployed on Vercel for seamless Next.js integration.

**API Routes for Backend Operations**: Server-side logic (e.g., `/api/upload/presigned` for Cloudflare R2 integration) handled via Next.js API Routes. Keeps sensitive operations server-side while maintaining client-side game experience.

**Web Workers for AI**: WASM execution in dedicated worker prevents UI blocking during AI computation (critical for mobile responsiveness).

**Direct LIFF SDK Usage**: No abstraction layers over `@line/liff` - use official types and APIs directly. Keeps codebase aligned with LINE's best practices and reduces maintenance overhead.

**Immutable Game State**: All game state transitions return new objects (no mutations). Enables time-travel debugging and simplifies testing.

**Pure Function Game Logic**: Game rules (`/lib/game`) are stateless pure functions. React hooks (`/hooks`) manage state, components handle UI. Clear separation of concerns.

---

_Updated: 2025-12-01 (Server Mode architecture with API Routes, Vercel deployment)_

_Document standards and patterns, not every dependency_
