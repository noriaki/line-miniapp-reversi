# Research & Design Decisions Template

---

**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

**Usage**:

- Log research activities and outcomes during the discovery phase.
- Document design decision trade-offs that are too detailed for `design.md`.
- Provide references and evidence for future audits or reuse.

---

## Summary

- **Feature**: `upgrade-nextjs-16`
- **Discovery Scope**: Complex Integration (Major version upgrade with React 19 migration)
- **Key Findings**:
  - Next.js 16 requires React 19.2.x (mandatory dependency)
  - Turbopack is now default bundler, WASM files in `/public` are automatically copied
  - Static export mode has minimal breaking changes impact
  - React 19 Strict Mode has more aggressive useEffect cleanup behavior
  - LIFF SDK 2.27.2 lacks explicit React 19 compatibility documentation

## Research Log

### Next.js 16 and React 19 Compatibility

- **Context**: Verify Next.js 16 requirements and React 19 integration status
- **Sources Consulted**:
  - [Next.js 16 Official Release](https://nextjs.org/blog/next-16)
  - [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
  - [Next.js Minimum React Version](https://nextjs.org/docs/messages/react-version)
- **Findings**:
  - Next.js 16 officially released on October 21, 2025
  - React 19.2.x is mandatory dependency (Next.js 16 uses React Canary features)
  - Node.js minimum version increased to 20.9.0 (Node 18 no longer supported)
  - TypeScript minimum version is 5.1.0
  - Official codemod: `npx @next/codemod@canary upgrade latest` handles automated migration
- **Implications**:
  - Cannot upgrade Next.js without upgrading React simultaneously
  - Node.js 24.9.0 (current) satisfies minimum requirement
  - TypeScript 5.x (current) satisfies minimum requirement
  - Codemod will automatically update package.json and apply breaking change fixes

### Turbopack and Static Export with WASM Files

- **Context**: Verify Turbopack compatibility with static export mode and WASM file handling
- **Sources Consulted**:
  - [Turbopack API Reference](https://nextjs.org/docs/app/api-reference/turbopack)
  - [Turbopack WASM Support Discussion](https://github.com/vercel/next.js/discussions/75430)
  - [Static Export with Turbopack Issue](https://github.com/vercel/next.js/issues/75751)
- **Findings**:
  - Turbopack is now default bundler in Next.js 16 (no `--turbopack` flag needed)
  - WASM files in `/public` directory are automatically served as static assets
  - Static export mode (`output: 'export'`) is compatible with Turbopack
  - Current project already uses `/public/ai.wasm` and `/public/ai.js` (correct pattern)
  - No custom webpack config exists in the project (reduces migration risk)
- **Implications**:
  - No changes needed to WASM file handling (already following best practice)
  - Build time expected to improve by 30-50% with Turbopack
  - Fast Refresh expected to be up to 10x faster
  - Verification needed: Confirm `out/ai.wasm` and `out/ai.js` are copied correctly after build

### React 19 Strict Mode and useEffect Behavior

- **Context**: Understand React 19 Strict Mode changes that may affect LIFF initialization
- **Sources Consulted**:
  - [React 19 StrictMode Documentation](https://react.dev/reference/react/StrictMode)
  - [React 19 useEffect Reference](https://react.dev/reference/react/useEffect)
  - [React StrictMode useEffect Behavior Issue](https://github.com/facebook/react/issues/31098)
- **Findings**:
  - React 19 Strict Mode continues double-invocation pattern: setup → cleanup → setup
  - Cleanup functions are enforced more aggressively in React 19
  - Development-only behavior (production unaffected)
  - LIFF initialization in `LiffProvider` already implements proper cleanup (isMounted flag pattern)
- **Implications**:
  - Existing LIFF initialization code follows React best practices
  - No code changes required for Strict Mode compatibility
  - Verification needed: Confirm no console warnings during development server startup

### LIFF SDK React 19 Compatibility

- **Context**: Verify LIFF SDK 2.27.2 compatibility with React 19
- **Sources Consulted**:
  - [LIFF Release Notes](https://developers.line.biz/en/docs/liff/release-notes/)
  - [LIFF NPM Package](https://www.npmjs.com/package/@line/liff)
  - [react-liff Library](https://www.npmjs.com/package/react-liff)
- **Findings**:
  - LIFF SDK 2.27.2 is latest version
  - LIFF SDK is framework-agnostic (vanilla JavaScript)
  - react-liff wrapper library supports React 18+, no React 19 explicit mention
  - Project uses `@line/liff` directly without wrapper (correct approach)
  - No known React 19 compatibility issues reported
- **Implications**:
  - Low risk: LIFF SDK is not React-specific, uses standard browser APIs
  - Current implementation uses official patterns (direct API calls, no wrapper)
  - Verification needed: Test LIFF initialization and profile retrieval in development

### Breaking Changes Analysis

- **Context**: Assess impact of Next.js 16 breaking changes on this project
- **Sources Consulted**:
  - [Next.js 16 Upgrade Guide - Breaking Changes](https://nextjs.org/docs/app/guides/upgrading/version-16)
- **Findings**:
  - **Async Request APIs**: No impact (params/searchParams/cookies/headers not used)
  - **Middleware → Proxy**: No impact (no middleware.ts file)
  - **Image API Changes**: No impact (next/image not used, unoptimized setting)
  - **Parallel Routes**: No impact (not used)
  - **PPR/Cache Components**: No impact (static export mode)
  - **Custom webpack config**: No impact (none exists)
- **Implications**:
  - Static export configuration shields project from most breaking changes
  - No codemod transformations expected beyond package.json updates
  - Low-risk migration profile confirmed

## Architecture Pattern Evaluation

Not applicable for this feature. This is a dependency upgrade, not a new feature implementation. Existing architecture patterns are preserved.

## Design Decisions

### Decision: Use Official Codemod for Automated Upgrade

- **Context**: Choose between manual step-by-step upgrade vs automated codemod approach
- **Alternatives Considered**:
  1. Manual upgrade: Update package.json manually, test incrementally
  2. Official codemod: `npx @next/codemod@canary upgrade latest` for automated migration
- **Selected Approach**: Official Codemod (Option 2)
- **Rationale**:
  - Next.js 16 requires React 19 (cannot upgrade incrementally)
  - Codemod is officially maintained and tested by Vercel
  - Automatically handles package.json updates and breaking change fixes
  - Faster execution with lower human error risk
  - Recommended approach in official documentation
- **Trade-offs**:
  - Benefits: Speed, accuracy, official support
  - Compromises: Less granular control over individual changes
- **Follow-up**: Manual verification of all changes after codemod execution

### Decision: Verify WASM Files in Build Output

- **Context**: Turbopack default bundler may handle static assets differently than webpack
- **Alternatives Considered**:
  1. Trust Turbopack to handle `/public` assets automatically
  2. Add explicit verification step for WASM file copying
- **Selected Approach**: Add Explicit Verification (Option 2)
- **Rationale**:
  - WASM files are critical for AI functionality (core feature)
  - Turbopack WASM support has documented limitations in some contexts
  - Project already uses correct pattern (`/public/ai.wasm`)
  - Low cost to add verification step (check `out/` directory after build)
- **Trade-offs**:
  - Benefits: Early detection of potential WASM copy issues
  - Compromises: Slight increase in verification complexity
- **Follow-up**: Include WASM file verification in acceptance criteria

### Decision: Maintain Current LIFF Implementation Pattern

- **Context**: Verify LIFF integration approach for React 19 compatibility
- **Alternatives Considered**:
  1. Migrate to react-liff wrapper library
  2. Keep current direct `@line/liff` API usage
- **Selected Approach**: Keep Current Implementation (Option 2)
- **Rationale**:
  - Current implementation follows official LIFF patterns
  - Direct API usage is framework-agnostic (lower React version dependency)
  - Proper cleanup pattern already implemented (isMounted flag)
  - react-liff wrapper adds unnecessary abstraction layer
  - No reported React 19 compatibility issues with current approach
- **Trade-offs**:
  - Benefits: Simpler codebase, official pattern, proven compatibility
  - Compromises: None identified
- **Follow-up**: Test LIFF initialization during development and E2E phases

### Decision: 4-Phase Sequential Verification Approach

- **Context**: Ensure upgrade success without E2E test modifications
- **Alternatives Considered**:
  1. Run all tests simultaneously after upgrade
  2. Sequential 4-phase approach: Codemod → Type Check → Test Suite → Dev/Build Verification
- **Selected Approach**: Sequential 4-Phase Approach (Option 2)
- **Rationale**:
  - Early failure detection (fail fast principle)
  - Clear isolation of issues by phase
  - Type errors caught before runtime tests
  - Unit tests validate before integration tests
  - Development server verification before production build
  - Matches detailed upgrade plan in `docs/upgrade-nextjs-16.md`
- **Trade-offs**:
  - Benefits: Clear problem isolation, systematic validation
  - Compromises: Slightly longer execution time (sequential vs parallel)
- **Follow-up**: Document each phase outcome in implementation report

## Risks & Mitigations

- **Risk 1: LIFF SDK Unexpected React 19 Incompatibility** — Mitigation: Early testing in development environment, comprehensive E2E test coverage, fallback error handling already implemented
- **Risk 2: Turbopack WASM File Copy Failure** — Mitigation: Explicit verification step in build phase, files already in `/public` directory (correct pattern)
- **Risk 3: React 19 Strict Mode Side Effects** — Mitigation: Existing code follows cleanup patterns, development testing will surface issues early
- **Risk 4: Test Suite Failures Due to React 19 Changes** — Mitigation: React Testing Library 16.3.0 already React 19 compatible, comprehensive test coverage will validate behavior
- **Risk 5: Performance Regression** — Mitigation: Turbopack expected to improve build times by 30-50%, maintain existing SSG sub-2-second load time metric

## References

### Official Documentation

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) — Official release announcement and features
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — Breaking changes and migration steps
- [Next.js Codemods Documentation](https://nextjs.org/docs/app/guides/upgrading/codemods) — Automated migration tools
- [React 19 StrictMode Reference](https://react.dev/reference/react/StrictMode) — Strict Mode behavior and useEffect patterns
- [React 19 useEffect Reference](https://react.dev/reference/react/useEffect) — Effect lifecycle and cleanup patterns

### LINE Platform

- [LIFF SDK Release Notes](https://developers.line.biz/en/docs/liff/release-notes/) — Version 2.27.2 changes
- [LIFF SDK NPM Package](https://www.npmjs.com/package/@line/liff) — Official package information

### Technical Discussions

- [Turbopack WASM Support Discussion](https://github.com/vercel/next.js/discussions/75430) — WASM file handling in Turbopack
- [Turbopack Static Export Issue](https://github.com/vercel/next.js/issues/75751) — Known issues and workarounds

### Project-Specific

- [Upgrade Plan Document](../../../docs/upgrade-nextjs-16.md) — Detailed upgrade steps and success criteria
