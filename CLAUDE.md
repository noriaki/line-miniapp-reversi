# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Context

### Paths

- Steering: `.specify/steering/`
- Specs: `.specify/specs/`

### Steering vs Specification

**Steering** (`.specify/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.specify/specs/`) - Formalize development process for individual features

### Active Specifications

- Check `.specify/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines

- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow

- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules

- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration

- Load entire `.specify/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)

## Git/GitHub Workflow

**IMPORTANT**: All `git` and `gh` commands MUST be executed outside the sandbox (`dangerouslyDisableSandbox: true`).

### Commit Guidelines

- Review changes carefully and split them into appropriate granular commits
- Use Semantic Commit Messages format with clear and concise English
  - Format: `<type>(<scope>): <subject>`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(auth): add user authentication`

### Branch Strategy (GitHub Flow)

- Create feature branches from `main` using: `git flow feature start <feature-name>`
- First push to GitHub using: `git flow feature publish <feature-name>`
- Always work on feature branches, never directly on `main`

### GitHub Operations

- Use `gh` command for GitHub repository operations and Pull Request management unless otherwise specified
- Language: English
- When creating a Pull Request:
  - Include the PR link URL in the output
  - Wait for user to merge the PR
- After user confirms PR merge:
  1. Verify PR status is merged
  2. Switch back to `main` branch
  3. Pull latest changes from remote
  4. Delete both local and remote feature branches
