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
| `gh aw compile --approve` | 8 succeeded, zero warnings after acknowledging the requested API credential migration |
| `gh aw validate` | 8 succeeded; before committing, 8 safe-update warnings about the newly authorized API secret references |
| `gh aw validate --strict` | 8 succeeded; before committing, the same 8 migration warnings |
| Generated action-pin comparison | No action pins changed from the prior committed locks |
| Credential review | OpenAI inference wiring verified; generic activation-only legacy-token validation documented |

The warnings compare against the old committed Copilot manifests; the audit documents the
new secret names and their use. Once the migrated locks are committed, rerun ordinary
compile/validate and record the resulting baseline. No unsupported frontmatter or hand-edited
lock files were retained. This compiler rejects newer `network.hosted-web` syntax; actual
Codex command lines disable web search/fetch and the policy check verifies that behavior.

## Runtime limits

Local compilation and policy checks do not validate OpenAI billing, model entitlement, API
limits, organization permission to send source context to OpenAI, GitHub action policy,
PR creation or Pages access. No live inference request, remote PR or deployment was executed.
Configure OPENAI_API_KEY in the target repository and perform the manual smoke test in
[ORG-SETUP.md](ORG-SETUP.md). The API key and optional GitHub CI-trigger token are independent.

The app's desktop/mobile browser behavior was verified during initial creation. The migration
changes workflow/configuration/documentation surfaces, not task interaction code. Intentional
fixture defects are preserved on separate branches; never merge those fixtures into main.
