# Validation report — Codex migration, 6 October 2026

All work was performed in this existing repository. No organization repository was created,
no remote was changed, and no API key was created or read. The original application remains
unchanged except that Vite can receive the destination Pages base path at build time.

## Toolchain

- gh-aw: v0.89.21; generated Codex CLI: 0.154.0.
- Node: v24.20.0; npm: 11.19.0.
- Configured inference: `engine: codex`, `model: openai/gpt-6.1-sol`.
- GitHub CLI authentication: signed out; remote doctor/inference execution unavailable.

## Checks performed

| Check | Observed result |
|---|---|
| npm dependency installation | Passed; added yaml development dependency; audit reported zero advisories |
| `npm run workflows:check` | Passed for all 8 agents and deterministic deployment policy |
| Negative policy probes | Correctly rejected repository write permission, alternate engine, stale prompt and reader shell enablement |
| `npm run lint` | Passed |
| `npm test` | 19 tests passed across 3 files |
| `npm run build` | Passed |
| Renamed repository build | `PAGES_BASE_PATH=/renamed-org-demo/ npm run build` passed; generated asset path verified |
| `gh aw compile` | 8 succeeded, zero warnings on the committed migration |
| `gh aw validate` | 8 succeeded, zero warnings |
| `gh aw validate --strict` | 8 succeeded, zero warnings |
| Generated action-pin comparison | No action pins changed from the prior committed locks |
| Credential review | OpenAI inference wiring verified; generic activation-only legacy-token validation documented |

The initial safe-update warnings compared against the old Copilot manifests. The new
credential references were reviewed and acknowledged with `gh aw compile --approve`, then
committed. Ordinary compile and both validate commands were rerun against the new committed
baseline and all reported zero warnings. No unsupported frontmatter or hand-edited lock files
were retained. This compiler rejects newer `network.hosted-web` syntax; actual Codex command
lines disable web search/fetch and the policy check verifies that behavior.

## Updated demo branches

Main was merged into all three existing local fixtures, carrying the new engine, prompts,
locks, policy checks, documentation and package lock without merging defects into main.

| Branch | Policy / lint / build | Tests after migration |
|---|---|---|
| main | Passed | 19 passed |
| demo/pr-review | Passed | 19 passed; intentional uncovered review defects retained |
| demo/ci-failure | Passed | 19 passed, exactly 1 expected failure |
| demo/issue-fix | Passed | 17 passed; isolated blank-task fixture retained |

## Runtime limits

Local compilation and policy checks do not validate OpenAI billing, model entitlement, API
limits, organization permission to send source context to OpenAI, GitHub action policy,
PR creation or Pages access. No live inference request, remote PR or deployment was executed.
Configure OPENAI_API_KEY in the target repository and perform the manual smoke test in
[ORG-SETUP.md](ORG-SETUP.md). The API key and optional GitHub CI-trigger token are independent.

The app's desktop/mobile browser behavior was verified during initial creation. The migration
changes workflow/configuration/documentation surfaces, not task interaction code. Intentional
fixture defects are preserved on separate branches; never merge those fixtures into main.
