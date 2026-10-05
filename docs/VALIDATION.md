# Validation report

Verified locally on **5 October 2026** in the existing repository
`AakashPandya/github-agentic-sdlc-demo`. No additional repository was created.

## Environment

| Check | Observed result |
|---|---|
| `gh --version` | 2.102.0 |
| `gh auth status` | Not logged in; exit 1 |
| `git --version` | 2.54.0 (Apple Git-157) |
| `node --version` | v24.20.0 |
| `npm --version` | 11.19.0 |
| `gh aw version` | v0.89.21 |

## Main application and workflows

| Command/check | Actual result |
|---|---|
| `npm install` | Passed; lockfile generated; audit reported 0 vulnerabilities |
| `npm ci` | Passed; audit reported 0 vulnerabilities |
| `npm run lint` | Passed |
| `npm test` | Passed: 19 tests across 3 files |
| `npm run build` | Passed: TypeScript and Vite production bundle |
| `gh aw compile` | Passed: 8 workflows, 0 warnings |
| `gh aw validate` | Passed: 8 workflows, 0 warnings |
| `gh aw validate --strict` | Passed: 8 workflows, 0 warnings |
| `gh aw doctor --repo AakashPandya/github-agentic-sdlc-demo` | Blocked: CLI not authenticated |
| Browser check | Chromium desktop 1280×1000 and mobile 390×844; create, complete, reload persistence passed; no page errors or horizontal overflow |
| Source/lock policy inspection | 8 explicit Copilot engines; repository agent permissions read-only; protected-file blocking and exclusive file allowlists; no merge outputs or APPROVE review event |
| Forbidden runtime dependency search | No alternate runtime engine settings or third-party LLM API key references found |

Initial TypeScript test-query typing and one live-docs/compiler schema mismatch were
corrected before these final results. Live docs list `add-labels.max-labels`; v0.89.21
rejects it. The compatible source limits label calls to one and constrains allowed labels.
Generated lock files were produced by the real compiler, not hand-authored.

`npm ci` emitted a macOS-only optional `fsevents` install-script approval warning;
installation, test execution and the production build all succeeded. No approval policy
was weakened. An audit result is a package advisory snapshot, not a comprehensive
application security certification.

## What remains unverified remotely

No remote push, labels, issues, PRs, agent inference run or Pages deployment occurred:
GitHub CLI is signed out. Copilot license, centralized organization billing, repository
Actions policy, PR-creation permission, Pages availability and token configuration cannot
be established locally. All workflows configure the recommended Actions-token inference
method. A personal repository may need the documented Copilot PAT fallback.

Agent findings and generated code cannot be promised in advance. The runbook provides
scenarios and expected outcomes, not fabricated execution evidence. Optional CI-trigger
PAT configuration is independent of Copilot authentication. gh-aw remains preview tooling;
compilation does not prove a GitHub-hosted execution will succeed under account policies.
