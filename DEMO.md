# Customer demo: To-Do App CI/CD with gh-aw Agents

Target duration: **13–15 minutes**. Runtime AI engine throughout: **GitHub Copilot**.
Agent runs are asynchronous and can take longer than the speaking slot. Run a rehearsal
and prepare completed examples beforehand; show live dispatch and the prepared result
side by side. Never present a prepared result as a newly completed run.

## Before the customer arrives

Complete [README setup](README.md#github-setup), including Copilot access and GitHub Pages.
If you changed Copilot authentication or other workflow configuration after creating the
fixtures, commit those changes on main and synchronize them first:

```sh
for branch in demo/pr-review demo/ci-failure demo/issue-fix; do
  git switch "$branch"
  git merge --no-edit main
done
git switch main
```

This brings workflow configuration into each fixture; it does not merge fixture defects
into main. PR-triggered workflows must not retain the old authentication configuration.
From this existing clone, authenticate and publish the prepared local history:

```sh
gh auth login
git push origin main
git push origin demo/pr-review demo/ci-failure demo/issue-fix
npm run labels:setup
gh aw doctor --repo AakashPandya/github-agentic-sdlc-demo
gh aw status
```

No remote push or PR creation was performed during the unauthenticated local build.
Wait for main's CI and Deploy to finish. Open the Pages URL from Deploy's environment.
Open the app, Actions, Issues, Pull requests and these source files in browser tabs:
`ci.yml`, `deploy.yml`, `ai-pr-review.md`, `ai-implement-task.md`.

Prepare PRs from the fixture branches:

```sh
gh pr create --base main --head demo/pr-review --title 'Improve task editing and display' --body 'Refine task editing behavior and display rich task text. Review the implementation and test coverage before merging.'
gh pr create --base main --head demo/ci-failure --title 'Adjust remaining task count' --body 'Update the remaining-task calculation. Inspect the CI result before merging.'
```

Never merge the fixture PRs. The review PR is deliberately green under its existing test
suite, while the CI fixture has exactly one failing unit test. Both are based on the clean
main implementation. `demo/issue-fix` is a third, isolated fixture for the fixer story.

For the review demo, do not read the branch-defect explanation to the agent: its source
instructions require independent evidence from the PR diff and application code.

## Demo 1 — Application (1 minute)

Add “Prepare customer demo” and “Review checklist”. Edit a title. Complete one task,
show Active and Completed filters, switch to All, clear completed and delete a task.
Refresh to demonstrate persistence. Keep a few tasks for the priority demonstration.

Say: **“We intentionally use a simple application so we can focus on the software delivery lifecycle.”**

## Demo 2 — Traditional CI/CD (1 minute)

Show `ci.yml`: `npm ci`, lint, tests, build. Show `deploy.yml`: same checks, Pages
artifact, deployment. The deployment job only runs after its build/check job passes.

```text
PR → Lint → Tests → Build
Merge → main → checked build → Pages artifact → GitHub Pages
```

Say: **“GitHub Actions follows deterministic instructions. There is no AI decision
involved in installing dependencies, linting, testing, building or deploying.”**

Traditional CI answers: **“Did these predefined checks pass?”**

## Demo 3 — PR Review (2 minutes)

Open “Improve task editing and display” and show green CI. Open `ai-pr-review.md` and
point at **engine: copilot**, read permissions, and the two bounded review safe outputs.

Say: **“This is different. We're giving GitHub Copilot an engineering objective and
repository context rather than a predefined sequence of analysis commands.”**

Show the actual review: Problem, Impact, Recommended Fix; then Risk, Critical Findings,
Important Findings, Testing Concerns and Recommendation. Explain why passing existing
tests can coexist with a real defect. Findings are evidence-based model decisions and
may vary between runs; do not promise exactly the same wording or count.

Presenter reference: the fixture accepts whitespace-only edited titles, renders titles
as HTML, and uses an unguarded `findIndex` result when replacing a task. A missing ID
becomes index -1 and replaces the final task. Existing tests cover ordinary editing but
not those new edge cases. No malicious payload or giveaway source comments are included.

## Demo 4 — Security (1 minute)

Show the PR's separate **AI · Security Review** result. Explain the unsafe HTML sink
and how untrusted task content reaches it; use only harmless text in the app.
Do not display or execute exploit payloads. A clean repository manual scan can be run:

```sh
gh aw run ai-security-review --ref main
```

On main, a correct clean scan may emit noop instead of inventing a finding. To manually
inspect the fixture, dispatch on `demo/pr-review`; a serious repository finding can
produce one issue. Automatic PR runs deliver review feedback on the triggering PR.

## Demo 5 — Issue Triage (1 minute)

Create one prepared issue from [DEMO-ISSUES.md](DEMO-ISSUES.md). For the quickest clear
example use “Todo does not work” with body “The todo feature is broken.” Show Copilot
asking for browser, steps, expected and actual behavior, then applying `needs-info` and
an estimated priority. Explain that classification and priority are Copilot decisions.
Show a prepared bug/enhancement result if available. The agent searches for duplicates
but does not close legitimate issues.

## Demo 6 — Issue → Fix → PR (2 minutes)

Main already rejects blank creation, so this demonstration uses an isolated fixture.
A maintainer chooses its base with a repository variable. The workflow only accepts
this exact fixture name or main; issue text cannot select an arbitrary branch.

```sh
gh variable set DEMO_ISSUE_FIX_BASE --body 'demo/issue-fix'
```

Equivalent UI: **Settings → Secrets and variables → Actions → Variables → New repository
variable**, name `DEMO_ISSUE_FIX_BASE`, value `demo/issue-fix`.

1. Create **Prevent blank tasks from being created** with the exact body in DEMO-ISSUES.md.
2. On the issue's right sidebar choose **Labels → ai-fix** using a write/maintainer account.
3. Show **AI · Issue Fixer** in Actions. The label is automatically removed so a human
   can apply it again later. Do not repeatedly reapply while a run is active.
4. Show Copilot inspecting the issue, restoring trim-before-validation, adding empty,
   whitespace-only and valid-title regression tests, and producing a draft PR.
5. Verify the PR's base is **demo/issue-fix**. Review the diff and real test results.
   Do not merge any fixture into main. If the optional CI token is absent, inspect the
   generated branch and run `gh workflow run ci.yml --ref COPILOT_PR_BRANCH`.
6. After the run finishes, reset the demo override:

```sh
gh variable delete DEMO_ISSUE_FIX_BASE
```

Without the variable, this issue should yield an honest “already satisfied” comment on
main. The fixture intentionally removes whitespace rejection and its two regression
cases; main retains both. A code-writing agent must add meaningful regression coverage.

Say: **“An issue becomes a proposed fix, with tests and human review still in the loop.”**

## Demo 7 — Manual Requirement → PR (3 minutes, primary WOW moment)

In **Actions → AI · Implement Task → Run workflow**, choose main and paste this exact task:

```text
Add priority support to To-Do items.

Requirements:

- Support Low, Medium and High priorities.
- Default new tasks to Medium.
- Allow priority selection while creating a task.
- Display priority on every task.
- Persist priority using localStorage.
- Add appropriate unit tests.
- Do not change unrelated functionality.
```

CLI equivalent, preserving the full input:

```sh
gh aw run ai-implement-task --ref main --raw-field 'task=Add priority support to To-Do items.

Requirements:

- Support Low, Medium and High priorities.
- Default new tasks to Medium.
- Allow priority selection while creating a task.
- Display priority on every task.
- Persist priority using localStorage.
- Add appropriate unit tests.
- Do not change unrelated functionality.'
```

Show the draft PR's requirement, implementation summary, files changed, tests and actual
validation. Check that pre-existing saved tasks get a sensible Medium default. Point out
that the original app intentionally has no priority support: this change is Copilot's
runtime work. Run CI explicitly if the optional CI trigger token is absent.

Say: **“The human defines the outcome. Copilot reasons about how that outcome should be
implemented. The result still goes through the normal pull-request and CI process.”**

## Demo 8 — CI Investigation (1–2 minutes)

Open the CI-failure PR and its red test. The fixture adds a test with an incorrect expected remaining count: two instead of
one for a list containing one active and one completed task. Exactly one assertion fails.
Show **AI · CI Investigator** and its issue: Failed Stage, Likely Root Cause, Evidence,
Recommended Fix, Confidence. Compare the diagnosis with the failing assertion and SHA.

Say: **“Traditional CI detects that something failed. GitHub Copilot investigates why it failed.”**

The investigator accepts CI failures/timeouts on main and `demo/**`, `copilot/**`,
`codex/**` branches; it only reads source and logs through GitHub tools. Cancelled runs
are excluded. Add another trusted branch pattern in source and recompile if needed.

## Finish (30 seconds)

**“GitHub Actions executes deterministic automation. GitHub Copilot performs reasoning.
gh-aw connects those capabilities with controlled permissions, safe outputs and standard
GitHub workflows.”**

If time permits, show the manual Release Readiness report and Documentation Updater.
Readiness never deploys; current documentation should produce noop rather than churn.

## Recovery and cleanup

```sh
# After changing any agent Markdown source:
gh aw compile
gh aw validate
gh aw validate --strict

# Manual agents only:
gh aw run ai-security-review --ref main
gh aw run ai-release-readiness --ref main
gh aw run ai-docs-updater --ref main

# Find run state and inspect artifacts:
gh aw status
gh aw logs ai-pr-review -c 1 --artifacts all
gh aw logs ai-issue-fixer -c 1 --artifacts all
gh aw logs ai-ci-investigator -c 1 --artifacts all
gh aw doctor --repo AakashPandya/github-agentic-sdlc-demo
```

For missing Copilot access, follow the README's fallback carefully: remove the permission,
configure `COPILOT_GITHUB_TOKEN` in GitHub UI and recompile; a token alone is insufficient
while the permission remains. Never switch engines. If Pages fails, confirm Source is
GitHub Actions, environment permits main, and organization policy permits Pages.

Close the intentional demo PRs without merging and close demonstration issues after
showing the result. Remove `DEMO_ISSUE_FIX_BASE` once the fixer has finished. Keep local
fixture branches for rehearsal. Never bypass branch protection to make a demo appear green.
