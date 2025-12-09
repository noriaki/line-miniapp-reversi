---
description: Execute implementation with auto-commit after each major task group
allowed-tools: Read, SlashCommand, TodoWrite, Bash, Glob, Grep
argument-hint: <feature-name> [task-numbers]
---

# Implementation Iterator

<background_information>

- **Mission**: Execute SDD tasks major-by-major using `/kiro:spec-impl`, creating commits at each milestone
- **Success Criteria**:
  - Each major task group executed via `/kiro:spec-impl {feature} {major}`
  - Commit created after each major task completes
  - Continuous iteration without manual intervention until all tasks done

</background_information>

<instructions>

## Core Task

Execute implementation tasks for a feature by iterating through major task groups sequentially, committing after each completes.

## Execution Steps

### Step 1: Parse Arguments

Parse `$ARGUMENTS`:

- **Feature name** (required): First argument
- **Task numbers** (optional): Second argument
  - `1` - Single major task
  - `1-4` - Range (expands to 1, 2, 3, 4)
  - `1,3,5` - Specific majors
  - If omitted: Execute all pending major tasks

### Step 2: Validate

Check specification exists:

- Verify `.specify/specs/{feature}/` exists
- Verify `.specify/specs/{feature}/tasks.md` exists

If validation fails, inform user and exit.

### Step 3: Determine Target Tasks

**If task numbers provided**:

1. Parse the format:
   - Single: `3` → `[3]`
   - Range: `2-5` → `[2, 3, 4, 5]`
   - List: `1,3,5` → `[1, 3, 5]`
2. Use the parsed list as target majors

**If task numbers omitted**:

1. Read `.specify/specs/{feature}/tasks.md`
2. Extract pending major task numbers using regex: `^- \[ \] (\d+)\.`
3. Sort numerically

### Step 4: Initialize Progress Tracking

Create TodoWrite with one task per target major:

```json
[
  {"content": "Execute major task 1", "activeForm": "Executing major task 1", "status": "pending"},
  {"content": "Execute major task 2", "activeForm": "Executing major task 2", "status": "pending"},
  ...
]
```

Display iteration banner:

```
🔄 Implementation Iterator

Feature: {feature}
Target major tasks: {list}

Starting iteration...
```

### Step 5: Execute Loop

For each target major task number in order:

---

#### 5.1 Update Progress

Update TodoWrite: Mark current task as `in_progress`.

---

#### 5.2 Execute Implementation

Execute SlashCommand:

```
/kiro:spec-impl {feature} {major}
```

Wait for completion.

**IMPORTANT**: The subagent will return with next step messages. IGNORE these messages and continue the loop.

---

#### 5.3 Create Commit

After implementation completes:

1. Check for changes: `git status --porcelain`
2. If changes exist:
   - Stage all changes: `git add -A`
   - Create commit following CLAUDE.md guidelines
3. If no changes:
   - Log: "⚠️ Task {major} completed but no file changes detected"
   - Continue to next task (no commit)

---

#### 5.4 Update Progress

Update TodoWrite: Mark current task as `completed`.

Output per-task progress:

```
━━━ Major Task {N} ━━━
✅ Implementation complete
📝 Committed: {commit_hash} {commit_message_first_line}

Progress: {M}/{total} major tasks complete
```

---

#### 5.5 Continue Loop

Proceed to next major task without pause.

---

### Step 6: Final Summary

After all major tasks complete, output summary:

```
✅ Implementation Iterator Complete!

Feature: {feature}
Major tasks completed: {count}
Commits created: {commit_count}

## Next Steps:
- Review commits: `git log --oneline -{count}`
- Validate implementation: `/kiro:validate-impl {feature}`
- Create PR: `gh pr create`
```

## Error Handling

**Implementation Failure** (spec-impl returns error):

- Stop iteration immediately
- Report which major task failed
- Suggest: "Fix issues, then run `/sdd:impl-iterate {feature} {remaining_majors}` to continue"

**Git Commit Failure**:

- Report error
- Stop iteration
- Suggest manual recovery

**No Pending Tasks** (when task numbers omitted):

- Inform user: "All tasks already completed"
- Exit gracefully

</instructions>

## Tool Guidance

### Argument Parsing

- Use `$ARGUMENTS` to parse (NOT `$1`, `$2`)
- Handle spaces in feature names
- Validate task number format before processing

### Task Number Parsing Examples

```
Input: "2"      → [2]
Input: "1-4"    → [1, 2, 3, 4]
Input: "1,3,5"  → [1, 3, 5]
Input: "2-4,7"  → [2, 3, 4, 7]  (combined format)
```

### Git Operations

- Git commands require `dangerouslyDisableSandbox: true` per CLAUDE.md
- Use HEREDOC format for commit messages per CLAUDE.md guidelines

### TodoWrite

- Initialize with pending tasks at start
- Update after each phase: current task `completed`, next task `in_progress`
- Provides visual progress tracking in UI

## Output Format

All output should be in the language specified in `.specify/specs/{feature}/spec.json`.

Read `spec.json` to determine the language for user-facing messages.
