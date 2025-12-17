# Technology Stack

## Architecture

**Hybrid Static/ISR Mini App**: Next.js with hybrid rendering strategy - static generation for core game pages, ISR (Incremental Static Regeneration) for dynamic content like game result sharing. Game logic isolated as pure functions, AI execution offloaded to Web Workers for non-blocking UI.

**Rendering Strategy**:

- **Static Pages**: Core game UI and components (pre-built at deploy time)
- **ISR Pages**: Game result pages with dynamic OG image generation (on-demand with indefinite caching)
- **CDN Optimization**: Both strategies leverage edge caching for sub-2-second load times

**Domain-Driven Organization**: Clear separation between game logic (`/lib/game`), AI engine (`/lib/ai`), LINE integration (`/lib/liff`), share functionality (`/lib/share`), and UI components. Immutable state patterns throughout.

## Core Technologies

- **Language**: TypeScript 5.x (strict mode enabled)
- **Framework**: Next.js 16.0.10 (App Router, Hybrid Static/ISR mode)
- **Runtime**: Node.js 24.9.0 (development), Static HTML/JS (production)
- **UI Library**: React 19.2.3 (client components for interactivity)
- **Package Manager**: pnpm 10.23.0

## Key Libraries

- **LIFF SDK 2.x**: Official LINE Front-end Framework (direct API usage, no wrapper classes)
- **Egaroucid WASM**: High-performance Reversi AI engine (loaded via Web Workers)
- **Tailwind CSS + Plain CSS**: Utility-first styling with component-scoped plain CSS for complex animations (GameBoard.css)
- **react-icons**: Icon library for UI elements (LINE logo, share icons)
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

- **Unit Tests**: Jest 30.x + React Testing Library (90%+ coverage target)
- **Integration Tests**: WASM bridge, AI engine, LIFF integration
- **E2E Tests**: Playwright 1.56.x (mobile-only: Pixel 5 for Chrome, iPhone 12 for Safari)
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
# Build: pnpm build (production build to /.next)
# Test: pnpm test (unit + integration)
# E2E: pnpm test:e2e (Playwright)
# Quality: pnpm lint && pnpm type-check
```

## Key Technical Decisions

**Hybrid Rendering over Pure Static**: Core game pages use static generation for predictable CDN performance. Dynamic features (game result sharing with OG images) use ISR with indefinite caching - pages are generated on first request and cached permanently. This enables `ImageResponse` for dynamic OG image generation while maintaining fast load times.

**Web Workers for AI**: WASM execution in dedicated worker prevents UI blocking during AI computation (critical for mobile responsiveness).

**Direct LIFF SDK Usage**: No abstraction layers over `@line/liff` - use official types and APIs directly. Keeps codebase aligned with LINE's best practices and reduces maintenance overhead.

**Immutable Game State**: All game state transitions return new objects (no mutations). Enables time-travel debugging and simplifies testing.

**Pure Function Game Logic**: Game rules (`/lib/game`) are stateless pure functions. React hooks (`/hooks`) manage state, components handle UI. Clear separation of concerns.

**Vercel Deployment**: ISR is fully supported on Vercel with zero additional configuration. Edge caching and on-demand regeneration work out of the box.

**LINE Share Integration**: Uses LIFF `shareTargetPicker` for native LINE sharing with Flex Messages. Web Share API as fallback for non-LINE contexts. Share URLs use LIFF permalink format (`https://liff.line.me/{liffId}/{path}`) for proper LINE app handling.

---

_Updated: 2025-12-14 (Added Share domain, react-icons, LINE Share integration pattern)_

_Document standards and patterns, not every dependency_
