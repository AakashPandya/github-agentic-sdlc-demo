# Security model

```text
GitHub Actions runner → OpenAI Codex → OpenAI API inference
        |                    |
Read-only GitHub token       OPENAI_API_KEY (Actions secret)
        |
Repository context → Reasoning → Structured safe-output request
                                       |
                              Separate mutation job
                                       |
                         Comment / Issue / Draft PR
                                       |
                                 Human review
```

## Two separate credentials

The OpenAI API key authorizes model inference, not GitHub writes. The GitHub Actions token
provides repository access according to each job's permissions. No Copilot subscription,
Copilot token or Copilot inference permission is configured in the authored workflows.
The generated Codex integration reads CODEX_API_KEY first, then OPENAI_API_KEY; use only
OPENAI_API_KEY for the documented setup to avoid unexpected key precedence.

Store the key in repository/organization Actions secrets. Never commit it, use a VITE_
client variable, pass it as a manual task input, print it, or place it in a prompt. The app
is browser-only and has no inference integration. The workflow sends selected repository
context to OpenAI; organization data-processing approval is an external prerequisite.
No actual key was created or inspected during this migration.

## Agent permissions and tools

All authored agent permission values are read. The generated `jobs.agent.permissions`
are also checked for repository writes by `npm run workflows:check`. Activation, safe-output
and conclusion jobs may legitimately have narrowly scoped writes for statuses, label-command
removal and the declared mutations. A generated job with `issues: write` is not evidence
that the reasoning agent received that permission; inspect jobs individually.

The five investigation agents (PR review, security, triage, CI investigation and release
readiness) disable shell and agent checkout. They use GitHub MCP read tools. Codex's native
web search/fetch are disabled by generated command options. The compiler cannot enforce
nonempty per-command Codex shell allowlists, so no such list is claimed as a boundary.

Issue Fixer and Implement Task can run shell commands locally for npm validation. The
README updater can edit files locally; gh-aw v0.89.21 enables shell when edit capability is
granted, so its source explicitly declares that fact. Its prompt disallows running project
code, while the safe-output handler independently restricts publication to README.md.
Prompt instructions are not equivalent to an execution sandbox.

The external gh-aw firewall/sandbox and threat detection remain enabled. The generated
Codex CLI uses its bypass flag inside the outer sandbox; that is generated compiler behavior,
not a disabled gh-aw firewall. Network access is limited to defaults, GitHub and Codex
transport, plus the Node ecosystem only for the two implementation agents. Model calls and
threat detection use OpenAI credentials. Generated provider catalogs and cleanup code may
mention other engines; they are framework plumbing, not configured inference fallbacks.

## Untrusted events and publication boundaries

PR workflows keep the default same-repository restriction and do not use pull_request_target.
Issue triage accepts reports from all roles but only has bounded label/comment outputs.
Its allowlist excludes ai-fix. The fixer requires a write/maintainer/admin actor to apply
that label command; removing the label after activation allows a later deliberate retry.

CI investigation runs after CI failure/timeout on main, demo/** and codex/**. Its agent
does not check out or execute the failed branch or artifacts. It reads run data and source
at the failed SHA via APIs. Logs, issues, PR content and source comments are explicitly
untrusted evidence. Missing logs reduce confidence rather than being fabricated.

| Agent | Explicit output limits |
|---|---|
| PR Reviewer | 5 inline comments; 1 COMMENT/REQUEST_CHANGES review |
| Security Review | 5 inline comments; 1 review; 1 serious manual-scan issue |
| Issue Triage | 1 allowed-label call; 1 comment; prompt selects at most 3 labels |
| Issue Fixer | 1 draft PR or 1 explanatory comment; 20 files / 256 KB patch |
| Implement Task | 1 draft PR; 20 files / 256 KB patch |
| CI Investigator | 1 issue |
| Release Readiness | 1 advisory issue |
| Documentation Updater | 1 README-only draft PR; 1 file / 64 KB patch |

Framework failure/status reports are separate from these domain-output limits. The
installed compiler supports a maximum number of label calls, not the newer max-labels field.
No merge output exists and review events exclude APPROVE. Configure main rulesets and required
CI to enforce human review at the GitHub platform level. The checkbox permitting Actions to
create and approve PRs is needed for creation; the agent configuration does not permit approval.

## Protected files

Fixer and Implement Task use an exclusive allowlist `[src/**, tests/**]` with
`protected-files: blocked`. The handler rejects out-of-scope patches, including .github/**,
manifests, dependency locks, scripts, configuration and agent instructions. This protects the
published diff; it is not a claim that a local process cannot attempt other filesystem edits.

The README updater allows exactly README.md and uses a narrow exception:

```yaml
allowed-files: [README.md]
protected-files:
  policy: blocked
  exclude: [README.md]
```

All other protected files remain blocked. Generated handler configuration is checked against
these policies. PR creation failure does not silently create an issue containing a patch:
`fallback-as-issue: false` is explicit on all three PR writers.

## Demo isolation, CI and remaining risks

Main stays correct. demo/pr-review contains intentional semantic/security defects;
demo/ci-failure has a controlled failing assertion. demo/issue-fix is an isolated blank-title
regression selected only by a maintainer-owned variable. Issue text cannot choose an arbitrary
base branch. Never merge those fixture branches into main; remove the variable after use.

The optional GH_AW_CI_TRIGGER_TOKEN is a separate GitHub credential, restricted to this repo
with Contents write, used only by mutation jobs to trigger follow-on CI. Without it use
human-dispatched CI and check the exact SHA. Neither that PAT nor the OpenAI key makes an
agent's output trustworthy by itself.

The policy check is an authored safety contract, not a formal proof of generated runtime
code. Keep compiler/action/container pins reviewed; validate again after upgrades. Inference
can consume API credit and return incorrect results. All outcomes still need human review.
Task data is unencrypted browser storage; do not store secrets or customer-sensitive data.

References: [Codex integration](https://github.github.com/gh-aw/engines/codex/),
[protected files](https://github.github.com/gh-aw/reference/safe-outputs-pull-requests/),
[API credentials](https://developers.openai.com/api/reference/overview).
