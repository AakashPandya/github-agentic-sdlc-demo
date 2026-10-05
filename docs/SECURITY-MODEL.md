# Security model

```text
GitHub Copilot
      |
read-only repository reasoning
      |
      v
Repository Context
      |
      v
Structured Safe Output Request
      |
      v
Separate Permission-Controlled Job
      |
      v
Comment / Issue / Draft Pull Request
      |
      v
Human Review
```

## Permissions and trust

Every agent explicitly uses `engine: copilot`. Agent jobs receive repository read
permissions only. `copilot-requests: write` enables inference and does not authorize
repository writes. It requires supported organization Copilot billing; otherwise use
the documented `COPILOT_GITHUB_TOKEN` fallback after removing that permission and
recompiling. Generation-time coding tools are unrelated to runtime agent identity.

Safe outputs are structured requests that separately privileged handlers validate.
Generated `safe_outputs`, activation and conclusion jobs can have write permissions
for their defined purposes, including status reporting and label-command removal.
That does not grant the reasoning agent a writable repository token. Review the
compiled YAML's individual `jobs.agent.permissions`, not just occurrences of `write`.

Reviewers use only GitHub read tools, without shell or edit tools. Code-writing agents
can edit a local workspace and run checks, while their tokens remain read-only.
Repository content, PR diffs, issues and logs are untrusted evidence. Instructions
explicitly reject scope expansion, secret disclosure and instructions found in that data.
The default gh-aw sandbox/firewall and threat detection remain enabled. Network access
is scoped to defaults, GitHub and Copilot; implementation/fixer agents additionally
allow the Node ecosystem needed for npm. These controls reduce risk; neither model
instructions nor automated analysis replace human review.

PR workflows retain gh-aw's default same-repository restriction. Fork workflows are
not enabled, and `pull_request_target` is not used. Issue triage permits reports from
all roles, has only bounded comment/label outputs, and cannot request a code fix.
The fixer requires a write/maintainer/admin actor to apply its label command. Public
issue traffic may consume inference budget; use organization billing controls and
review gh-aw's generated daily credit controls before opening a high-traffic demo.

CI investigation is a privileged `workflow_run` context, so it has no code execution
or edit tool. It reads the failed SHA and logs via GitHub read APIs and does not execute
branch code or downloaded artifacts. Trusted branch patterns limit activation.

## Mutation boundaries

| Agent | Permitted output ceiling |
|---|---|
| PR Reviewer | 5 inline findings; 1 COMMENT/REQUEST_CHANGES review |
| Security Review | 5 inline findings; 1 COMMENT/REQUEST_CHANGES review; 1 serious manual-scan issue |
| Issue Triage | 1 allowed-label call; 1 comment; prompt limits selection to 3 labels |
| Issue Fixer | 1 draft PR or explanatory comment; maximum 20 changed files / 256 KB patch |
| Implement Task | 1 draft PR; maximum 20 changed files / 256 KB patch |
| CI Investigator | 1 issue |
| Release Readiness | 1 advisory issue |
| Documentation Updater | 1 draft PR touching only README.md; maximum 1 file / 64 KB |

Triage's supported compiler schema limits calls with `max`; it does not support the
live docs' newer `max-labels` field. The allowed set excludes `ai-fix`, preventing the
triage model from authorizing implementation. gh-aw may independently emit framework
failure/status reports in addition to the agent's configured domain outputs.

No merge safe output exists. Review events exclude APPROVE. No agent directly deploys,
creates releases or writes to main. Draft PRs preserve human review as the approval
boundary. Configure a main ruleset to enforce review and required CI at the platform
level; prompt instructions alone are not branch protection.

## Protected files

Issue Fixer and Implement Task enforce `protected-files: blocked` plus an exclusive
`allowed-files: ["src/**", "tests/**"]`. This prevents committing `.github/**`, agent
instructions, manifests, lockfiles, README or any other path outside that list.
A model's local edit attempt is not the same as permission to publish that edit: the
safe-output handler rejects out-of-policy patches.

Documentation Updater allows exactly `README.md` and uses:

```yaml
protected-files:
  policy: blocked
  exclude: [README.md]
allowed-files: [README.md]
```

This narrow exception leaves all other protections intact. The default general gh-aw
policy may request review for protected files; this repository deliberately hard-blocks
them instead. See [official PR safe-output policies](https://github.github.com/gh-aw/reference/safe-outputs-pull-requests/).

## Demo isolation and data

Main renders plain text and rejects blank titles. `demo/pr-review` intentionally has
unsafe rendering and semantic defects; `demo/ci-failure` has one controlled test failure.
`demo/issue-fix` contains only the blank-creation fixture and missing regression cases.
None should be merged into main or deployed. The maintainer-owned `DEMO_ISSUE_FIX_BASE`
variable can select only the fixed fixture name; otherwise the fixer uses main. Issue
text cannot widen that checkout/base selection. Remove the variable after rehearsal.

Task data is browser-local and unencrypted. It is not a secret store, and another tab's
changes are not synchronized. Invalid stored data is not automatically overwritten.
No secrets are embedded in source. Do not include real customer information in demo
issues/tasks; generated reports and logs may preserve it.

The optional CI trigger PAT is confined to the generated mutation stage, scoped to this
repository with Contents write, and is unrelated to Copilot billing. Without it, use
human-dispatched CI and check the exact PR SHA before review/merge. See the
[official CI trigger documentation](https://github.github.com/gh-aw/reference/triggering-ci/).
