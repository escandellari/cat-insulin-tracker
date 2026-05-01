# Development Workflow

This project uses a multi-agent pipeline (via [Lattice](https://github.com/CallumVass/lattice)) to go from idea → reviewed PRD → GitHub issues → implementation.

---

## Step 1: Review the PRD

Before creating issues, make sure `PRD.md` is complete and implementation-ready.

**Run the full review loop** (critic → architect → integrator, repeats until complete):

> In OpenCode, type:
> ```
> /prd-orchestrator
> ```

This will:
1. **Critic** — reads the PRD with fresh eyes, flags gaps, over-specification, or code blocks
2. **Architect** — answers the questions using codebase context
3. **Integrator** — folds the answers back into `PRD.md` and deletes `QUESTIONS.md`
4. Repeats until the critic signals `<COMPLETE>`

The PRD is ready when it:
- Has no code blocks or schema definitions
- Describes user-observable behavior (not internal implementation)
- Is ~150–200 lines
- Covers functional requirements, edge cases, non-functional requirements, and scope

---

## Step 2: Create GitHub Issues

Once the PRD is complete, decompose it into vertical-slice GitHub issues.

> In OpenCode, type:
> ```
> /issue-creator
> ```

This will:
- Read `PRD.md`
- Explore the codebase to understand existing structure
- Create **vertical-slice issues** in GitHub — each one is a complete user-observable flow across all layers (DB → server → client → UI)
- Label all issues with `auto-generated`

Each issue includes:
- User-observable acceptance criteria
- A test plan with trigger/boundary tests
- Dependencies on other issues
- Context scoped to just that slice

---

## Step 3: Implement Issues

With issues in GitHub, implement them one by one using the implementation orchestrator.

> In OpenCode, type:
> ```
> /implementation-orchestrator #<issue-number>
> ```

This will:
1. **Planner** — reads the issue and explores the codebase, outputs a sequenced TDD test plan
2. **Implementor** — works through the plan in red-green-refactor cycles until all tests pass

Repeat for each issue, following the dependency order listed in the issues.

---

## Quick Reference

| What you want | Command |
|---|---|
| Review & refine the PRD | `/prd-orchestrator` |
| Just critique the PRD (no changes) | `/prd-critic` |
| Create GitHub issues from the PRD | `/issue-creator` |
| Implement a specific issue | `/implementation-orchestrator #<issue-number>` |
| Check pipeline status | `/lattice status` |
| Resume a paused pipeline | `/lattice continue` |
| Retry a failed step | `/lattice retry` |
