# Workflow audit — 6 October 2026

Scope: all eight agent Markdown sources and generated locks, deterministic CI/deploy,
demo documentation, portable setup, and local policy checks. This is a static/configuration
audit plus local validation. It is not evidence of a successful OpenAI/GitHub-hosted run.

## Findings and corrections

| Finding | Resolution |
|---|---|
| All runtime agents were Copilot-only, contrary to the new requirement | All eight select `engine: codex`, `model: openai/gpt-6.1-sol`; Copilot inference permission removed |
| Network/auth instructions still assumed GitHub inference | Codex transport enabled; OpenAI Actions-secret setup documented; no key embedded in source |
| A simple engine rename could leave shell execution available to reviewers | Readers explicitly disable shell and agent checkout; generated CLI disables shell; checked automatically |
| README updater's edit tool overrides disabled shell in this compiler | Source now truthfully enables local shell/edit; prompt prohibits project-code execution; publication remains README-only |
| Model-dependent output rules were buried in prose | Each prompt has objective, evidence/decision steps, required output and boundaries; writers have validation and blocked/no-change paths |
| Failure investigation could overstate a diagnosis | Prompt pins failed SHA, distinguishes tests/code/infrastructure causes and requires confidence and unavailable-evidence disclosure |
| A readiness report could overstate missing CI | READY requires current-SHA evidence; missing/pending/failed required CI means NOT READY |
| Personal owner/path assumptions complicated an org move | Setup uses current remote/ORG/REPO placeholders; Pages build gets its path from configure-pages |
| Old demo branches would retain Copilot | Migration is committed and merged into each local demo branch; defects remain isolated |
| Agent-created branch names could miss the CI-investigator branch filter | All PR writers enforce codex/** branch names, covered by the investigator |
| Future edits could regress engine or permissions | Added `npm run workflows:check`, executed by CI and deploy; it parses YAML, checks source/lock policy and prompt hashes |
| Live docs include fields unsupported by v0.89.21 | Omitted max-labels and hosted-web; verified actual generated web-search/fetch disabling instead |

## Credential and dependency review

The migration adds inference references to `OPENAI_API_KEY` and the compiler-supported alternative
`CODEX_API_KEY`. Both are used for the requested OpenAI inference path, including generated
threat detection, and are passed through the compiler's authentication/proxy setup. Actual
secret values were not accessed. CODEX_API_KEY takes precedence: setup explicitly warns
against accidentally inheriting a conflicting organization secret. OpenAI network access
is intentional for this migration; no custom inference endpoint or redirect was introduced.

The safe-update compiler warnings for those new restricted secrets were reviewed against
this request and acknowledged with `gh aw compile --approve`. This approves the source
migration in the compiler; it does not create a key, grant GitHub organization approval,
or execute inference. Once the new locks are committed, normal compile/validate uses that
reviewed manifest baseline. Framework catalogs/cleanup still mention other providers;
the actual engine metadata, runtime command and selected model are Codex/OpenAI.

Added the `yaml` development dependency to parse source and generated workflow configuration
in the deterministic policy check. Application runtime dependencies are unchanged. The generated manifest also adds `COPILOT_GITHUB_TOKEN` to a framework activation step
that checks for invalid OAuth-style tokens. It is not passed to the Codex inference job,
is not required, and can remain unset. Do not hand-edit the generated locks to remove
framework validation. An inherited invalid legacy token may fail that guard even though
Codex uses OpenAI; remove this repository's exposure to that unused token if necessary.

No action
or container versions were intentionally upgraded; the existing pinned compiler regenerates
the locks. Review the generated diff when upgrading the compiler in future.

## Preserved boundaries

- Agent repository permissions remain read-only; mutations happen in separate jobs.
- PR reviews can COMMENT or REQUEST_CHANGES, never APPROVE; no merge output exists.
- Code writers can publish only src/** and tests/**; protected files hard-block.
- Documentation writer can publish only README.md with that exact protected-file exception.
- Triage cannot apply ai-fix. A human with repository write access triggers implementation.
- All explicit domain outputs have maxima; implementation and investigation have turn/time limits.
- CI and deployment require no inference key. Pages publishes only a checked main build.

## Remaining limitations to verify in the target organization

- OpenAI project billing/credits, model access and API limits are not validated locally.
- Organization policy must permit OpenAI processing of the supplied repository context.
- GitHub Actions, action allowlists, PR creation, runners, Pages and main rulesets need setup.
- Automatic CI after agent-created PRs needs the optional GitHub CI-trigger token or human action.
- These workflows assume GitHub.com and main; Enterprise Server/custom runners need separate work.
- Model correctness, duplicated reports under concurrent runs and actual output creation require
  live observation. Bounded outputs do not make model decisions deterministic.
- The policy check validates selected invariants and prompt freshness, not every compiler detail.
  Run the real compiler and strict validation after any workflow change.

See [VALIDATION.md](VALIDATION.md) for actual results and [ORG-SETUP.md](ORG-SETUP.md) for
an API-key smoke test. No hosted inference was run during this audit.
