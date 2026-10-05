# Workflow reference

Source files live under `.github/workflows/`. Each `.md` is compiled to its matching
`.lock.yml` with gh-aw v0.89.21. Commit both; never manually edit generated YAML.
All eight agents explicitly use **engine: copilot**. Reasoning-stage permissions include
**contents: read** and **copilot-requests: write** plus only the reads listed below.
Authentication is the Actions token for Copilot inference; runtime eligibility is
unverified because local GitHub CLI is signed out. If unavailable, remove that permission,
configure **COPILOT_GITHUB_TOKEN**, recompile and validate as explained in README.
No automatic authentication or engine switch occurs.

## AI · PR Reviewer

- Source: [`ai-pr-review.md`](../.github/workflows/ai-pr-review.md)
- Generated: `ai-pr-review.lock.yml`
- Trigger: PR opened, reopened, synchronize.
- Runtime engine: `copilot`.
- Authentication: Actions token with `copilot-requests: write`; documented Copilot PAT fallback.
- Repository read permissions: `contents` plus pull-requests.
- Safe outputs: create-pull-request-review-comment ≤5; submit-pull-request-review ≤1.
- Purpose: Identify semantic defects with paths, impact and recommended fixes.
- Expected demo result: Green CI alongside evidence-backed validation/state/test findings.

## AI · Security Review

- Source: [`ai-security-review.md`](../.github/workflows/ai-security-review.md)
- Generated: `ai-security-review.lock.yml`
- Trigger: PR opened, reopened, synchronize; manual.
- Runtime engine: `copilot`.
- Authentication: Actions token with `copilot-requests: write`; documented Copilot PAT fallback.
- Repository read permissions: `contents` plus pull-requests, issues.
- Safe outputs: Review comments ≤5; review ≤1; create-issue ≤1.
- Purpose: Trace real security risks from input to sink, without inventing vulnerabilities.
- Expected demo result: Unsafe HTML review on fixture PR; clean main manual scan may noop.

## AI · Issue Triage

- Source: [`ai-issue-triage.md`](../.github/workflows/ai-issue-triage.md)
- Generated: `ai-issue-triage.lock.yml`
- Trigger: Issue opened; all reporter roles.
- Runtime engine: `copilot`.
- Authentication: Actions token with `copilot-requests: write`; documented Copilot PAT fallback.
- Repository read permissions: `contents` plus issues.
- Safe outputs: add-labels ≤1 call, allowlisted labels; add-comment ≤1.
- Purpose: Classify intent, priority and missing context; search duplicates.
- Expected demo result: Bug/enhancement labels or needs-info questions; no automatic closure or ai-fix.

## AI · Issue Fixer

- Source: [`ai-issue-fixer.md`](../.github/workflows/ai-issue-fixer.md)
- Generated: `ai-issue-fixer.lock.yml`
- Trigger: label_command ai-fix, issues only; write/maintainer/admin actor.
- Runtime engine: `copilot`.
- Authentication: Actions token with `copilot-requests: write`; documented Copilot PAT fallback.
- Repository read permissions: `contents` plus issues, pull-requests.
- Safe outputs: create-pull-request ≤1; add-comment ≤1.
- Purpose: Reproduce issue, implement minimal fix, add tests, propose draft PR.
- Expected demo result: Blank-title fix against demo/issue-fix when explicitly configured; already-fixed comment on main.

## AI · Implement Task

- Source: [`ai-implement-task.md`](../.github/workflows/ai-implement-task.md)
- Generated: `ai-implement-task.lock.yml`
- Trigger: workflow_dispatch; required string input task.
- Runtime engine: `copilot`.
- Authentication: Actions token with `copilot-requests: write`; documented Copilot PAT fallback.
- Repository read permissions: `contents` plus pull-requests.
- Safe outputs: create-pull-request ≤1.
- Purpose: Interpret requirement, implement source/tests, validate, propose draft PR.
- Expected demo result: Priority selector, task badges, backward-compatible persistence and tests.

## AI · CI Investigator

- Source: [`ai-ci-investigator.md`](../.github/workflows/ai-ci-investigator.md)
- Generated: `ai-ci-investigator.lock.yml`
- Trigger: CI workflow_run completed, conclusion failure/timed_out; main/demo/**/copilot/**/codex/**.
- Runtime engine: `copilot`.
- Authentication: Actions token with `copilot-requests: write`; documented Copilot PAT fallback.
- Repository read permissions: `contents` plus actions, issues, pull-requests.
- Safe outputs: create-issue ≤1.
- Purpose: Read failed jobs/logs and exact failed SHA to diagnose cause.
- Expected demo result: Issue with Failed Stage, Likely Root Cause, Evidence, Recommended Fix, Confidence.

## AI · Release Readiness

- Source: [`ai-release-readiness.md`](../.github/workflows/ai-release-readiness.md)
- Generated: `ai-release-readiness.lock.yml`
- Trigger: workflow_dispatch.
- Runtime engine: `copilot`.
- Authentication: Actions token with `copilot-requests: write`; documented Copilot PAT fallback.
- Repository read permissions: `contents` plus actions, issues, pull-requests.
- Safe outputs: create-issue ≤1.
- Purpose: Assess latest main CI, changes, risks, tests, documentation and blockers.
- Expected demo result: READY / READY WITH CAUTION / NOT READY advisory issue; no deployment.

## AI · Documentation Updater

- Source: [`ai-docs-updater.md`](../.github/workflows/ai-docs-updater.md)
- Generated: `ai-docs-updater.lock.yml`
- Trigger: workflow_dispatch.
- Runtime engine: `copilot`.
- Authentication: Actions token with `copilot-requests: write`; documented Copilot PAT fallback.
- Repository read permissions: `contents` plus pull-requests.
- Safe outputs: create-pull-request ≤1; README.md only.
- Purpose: Compare actual app/scripts/features to README and correct material drift.
- Expected demo result: Draft README PR if outdated; noop when current.

## Code-writing and manual workflow details

Fixer and Implement Task allow only `src/**` and `tests/**`, enforce protected-file
blocking and propose draft PRs. They have local bash/edit capability and Node 24,
but repository tokens remain read-only. Documentation Updater's only publishable
path is README.md, with exactly that filename excluded from protected-file blocking.
Review agents never execute PR code. PR safe outputs allow COMMENT and REQUEST_CHANGES,
not APPROVE. All agents lack merge outputs.

The fixer normally checks out and targets main. `DEMO_ISSUE_FIX_BASE=demo/issue-fix`
selects a prepared fixture; any other value resolves to main. The native label command
removes ai-fix automatically. Its compiler-generated manual dispatch support is not
the customer trigger: demonstrate a human applying the issue label.

Manual inputs are referenced in the Markdown prompt with the documented
`${{ github.event.inputs.task }}` form; the compiler handles prompt interpolation.
Manual agents use the run ID as the conclusion concurrency discriminator to avoid
unrelated dispatches sharing that slot.

Traditional `ci.yml` and `deploy.yml` are handwritten deterministic Actions, not agents.
Deployment gates its own artifact on lint/test/build, then uses the official Pages
configuration, artifact-upload and deployment actions pinned to verified release SHAs.
`workflow_dispatch` on CI offers a token-free manual fallback for agent-created PRs.

## Official sources checked on 5 October 2026

- [Workflow source/lock structure](https://github.github.com/gh-aw/reference/workflow-structure/)
- [Authentication and Copilot billing](https://github.github.com/gh-aw/reference/auth/)
- [Triggers, label commands and completion filtering](https://github.github.com/gh-aw/reference/triggers/)
- [Safe outputs, comments, issue creation and labels](https://github.github.com/gh-aw/reference/safe-outputs/)
- [PR reviews, PR creation and protected files](https://github.github.com/gh-aw/reference/safe-outputs-pull-requests/)
- [GitHub tools](https://github.github.com/gh-aw/reference/tools/)
- [Network allowlists](https://github.github.com/gh-aw/reference/network/)
- [Checkout configuration](https://github.github.com/gh-aw/reference/checkout/)
- [Triggering CI from generated PRs](https://github.github.com/gh-aw/reference/triggering-ci/)
- [CLI commands](https://github.github.com/gh-aw/setup/cli/)
- [Official Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Vite GitHub Pages base path](https://vite.dev/guide/static-deploy.html#github-pages)

The installed CLI's `--help`, actual compiler and strict validation were also checked.
Live documentation can run ahead of the installed preview release; unsupported syntax
is not retained. `add-labels.max-labels` was rejected and is deliberately omitted.
