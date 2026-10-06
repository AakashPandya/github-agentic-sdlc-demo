# Move to another Mac and configure OpenAI API workflows

These steps configure **OpenAI Codex in GitHub Actions**, using an **OpenAI Platform API key**.
They do not use a ChatGPT browser session or Copilot subscription. Your laptop edits and
pushes code; GitHub-hosted runners perform inference. No key is needed to install, compile,
run local tests or view the To-Do app.

## 1. Transfer all committed code and branches

The updated `.github` directory is essential. Finder hides dot folders; press
**Command + Shift + .** to reveal them. Copying only visible files misses `.github`
and `.git`, including the workflow files and local demo branches.

Preferred: commit the reviewed changes and push them to a repository you can access,
then clone on the other machine. Do not assume copying main also copies demo branches.
Alternatively, transfer a Git bundle without node_modules or credentials:

```sh
# On the source machine, after all reviewed changes are committed:
git status --short
git bundle create ../agentic-demo.bundle --branches
```

Copy that bundle to the other Mac, then:

```sh
git clone agentic-demo.bundle github-agentic-sdlc-demo
cd github-agentic-sdlc-demo
git switch main
git branch demo/pr-review origin/demo/pr-review
git branch demo/ci-failure origin/demo/ci-failure
git branch demo/issue-fix origin/demo/issue-fix
```

Skip a `git branch` command if that local branch already exists. A bundle contains Git
history, not uncommitted changes or secrets stored on GitHub. Keep the source copy until
the transferred branch list and commits have been verified.

## 2. Point this clone at your intended organization repository

Use the target repository your organization provides. Replace ORG and REPO below.
For an empty target repository:

```sh
git remote set-url origin https://github.com/ORG/REPO.git
git remote -v
gh auth login
gh auth status
git push -u origin main
git push origin demo/pr-review demo/ci-failure demo/issue-fix
```

Verify the remote before pushing. Your GitHub account needs write access and any required
SSO authorization. This does not configure OpenAI authentication. If the destination already
has unrelated history or requires a protected-branch PR, follow your organization's import
process; do not force-push over it. This agent has not created, transferred or pushed an
organization repository on your behalf.

Use **main** as the destination default branch for this prepared demo. If your organization
requires another branch name, update ci.yml/deploy.yml triggers and deployment condition,
agent checkout/PR bases, release prompt and CI-investigator branch filter, update the policy
check's main assertion, then recompile. Renaming the repository itself is supported without
these branch edits.

## 3. Check tooling on the other Mac

Install Node.js **24 LTS**, Git and the GitHub CLI through your approved software process.
The generated locks already work without installing gh-aw on that laptop. To edit/compile
agent Markdown with the version used here:

```sh
gh extension install github/gh-aw --pin v0.89.21
gh aw version
npm ci
npm run workflows:check
npm run lint
npm test
npm run build
```

If gh-aw is already installed, check its version first. A deliberate version upgrade should
be followed by compilation, strict validation and review of generated changes.

## 4. Add your OpenAI API key in GitHub

For a one-day trial, start with [BUDGET-DEMO.md](BUDGET-DEMO.md). The current
workflows use GPT-5.4 mini, low reasoning and reduced turn limits.

1. Open [OpenAI Platform](https://platform.openai.com/) and select the organization-approved
   API project. Enable API billing/credits as required and verify access to **gpt-5.4-mini**.
   ChatGPT subscription access does not configure API billing for this integration.
2. Create an API key through [API keys](https://platform.openai.com/api-keys). Prefer an
   organization-managed project/service-account key for team automation. Apply your
   organization's access, spend and rotation policies. No token value belongs in this repo.
3. In the **target GitHub repository**, open **Settings → Secrets and variables → Actions →
   Secrets → New repository secret**.
4. Name it exactly **OPENAI_API_KEY**, paste the value into the secret field, and save.
   An organization Actions secret with selected-repository access is also supported.
5. Check whether **CODEX_API_KEY** is already exposed by the repository/organization.
   gh-aw uses it before OPENAI_API_KEY. For this setup, expose only OPENAI_API_KEY or
   intentionally configure the other key with its administrator. Do not delete a shared
   organization secret globally; adjust selected-repository access if necessary.

CLI alternative (prompts for the value; do not put the key into command history):

```sh
gh secret set OPENAI_API_KEY --repo ORG/REPO
```

The workflow compiler handles injection into Codex; do not add custom echo/export steps
or paste the key into YAML. Do not use `VITE_OPENAI_API_KEY`: Vite client variables can
be exposed to browser users. Do not configure a Copilot token or inference permission.
Setting OPENAI_API_KEY in a laptop shell does not set the GitHub Actions secret.
The compiler may mention COPILOT_GITHUB_TOKEN in a generic activation token-type check;
leave it unset. If an inherited legacy OAuth token trips that check, remove this repo's
access to that unused token. It is not used for Codex inference.

The checked-in model declaration is `model: openai/gpt-5.4-mini`. If your API project cannot
access it, have its administrator enable an approved compatible model, edit the model
fields consistently and update the policy check's expected model before recompiling.
Do not silently select another provider. Runtime access is not established by compilation.

## 5. Enable repository Actions and outputs

Under **Settings → Actions → General**:

- Permit the pinned `actions/*` and `github/gh-aw-actions` references in the generated locks.
- Keep default workflow permissions read-only; individual safe-output jobs declare their
  required writes. Enable **Allow GitHub Actions to create and approve pull requests**.
  The permission label includes approval, but this demo never submits APPROVE or merges.
- Ask an administrator to resolve organization restrictions if those settings are locked.
- Use supported GitHub-hosted Ubuntu runners. The generated sandbox needs its containers
  and allowed outbound access. Internal/self-hosted runner adaptation needs separate testing.

Run `npm run labels:setup` from the correctly configured clone. In **Settings → Rules →
Rulesets**, require human review and the CI check for main after the first run. Avoid agent
bypasses. Source read permissions are separate from the OpenAI inference credential.

For Pages: **Settings → Pages → Build and deployment → Source → GitHub Actions**; under
**Settings → Environments → github-pages**, permit main. The deployment derives its URL
path from Pages configuration, including a renamed target repository or custom domain.
Check the actual environment URL in the successful deployment; no live URL is assumed.

## 6. First smoke test

Push the updated `.md` and `.lock.yml` files to the target default branch, then:

```sh
gh aw doctor
gh aw run ai-security-review --ref main
gh aw status
gh aw logs ai-security-review -c 1 --artifacts all
```

Or use **Actions → AI · Security Review → Run workflow → main**. A clean scan can return
noop in the run summary; no issue is required to demonstrate success. Verify the run uses
Codex, inference succeeds and the safe-output/conclusion jobs finish. Do not interpret
“no issue created” by itself as success. This first live run consumes OpenAI API usage.

Next, open a PR from demo/pr-review to main. Deterministic CI should pass; the two review
agents should assess the introduced defects. Then open demo/ci-failure for a single failing
test and CI diagnosis. Exact commands and the priority implementation task are in DEMO.md.

## 7. Optional automatic CI on generated PRs

The OpenAI API key only authorizes inference. PR events created with GITHUB_TOKEN normally
do not start another Actions run. For automatic PR CI, add a separate Actions secret
**GH_AW_CI_TRIGGER_TOKEN** containing a fine-grained GitHub PAT restricted to this repository
with **Contents: Read and write**, subject to organization approval/SSO requirements.
The safe-output handler pushes an extra empty commit to trigger CI. This secret is optional.

Without it, inspect the draft PR and dispatch CI against its branch:

```sh
gh workflow run ci.yml --ref AGENT_PR_BRANCH
```

Check the resulting SHA and required-check association before merging real work. If needed,
a human-authorized empty commit on that PR branch triggers the normal PR checks. Never merge
intentional demo defects. See the [official CI trigger guide](https://github.github.com/gh-aw/reference/triggering-ci/).

## 8. Recompile after future changes

```sh
gh aw compile
npm run workflows:check
gh aw validate
gh aw validate --strict
git add .github/workflows .github/aw/actions-lock.json
git commit -m "Update agent workflows and compiled locks"
```

Synchronize reviewed main changes into any older local demo branches before pushing them:

```sh
for branch in demo/pr-review demo/ci-failure demo/issue-fix; do
  git switch "$branch"
  git merge --no-edit main
done
git switch main
```

Stop and resolve a real conflict if one occurs. Never merge the fixture branches into main.
The current migration includes local branch synchronization; repeat only after later edits.

## Troubleshooting

| Symptom | Check |
|---|---|
| Not a git repository | Copy .git too, or clone/bundle instead of visible files only |
| Push denied | Correct remote, GitHub user, organization write access and SSO |
| Missing API secret | Secret exists on destination, is named OPENAI_API_KEY, and repository can access it |
| Unexpected key used | CODEX_API_KEY overrides OPENAI_API_KEY if present |
| 401/403 from inference | Key validity, API project permissions and model access; never paste the value into logs |
| 429 or quota error | API billing/credits, rate limits and project usage; avoid repeatedly rerunning |
| Workflow action blocked | Organization action allowlist and runner policies |
| Agent PR creation denied | PR creation checkbox and organization policy |
| PR has no CI | Optional GitHub CI token or human-dispatched CI on exact branch/SHA |
| Pages fails or assets 404 | Pages source/environment, deployment result and configured base path |
| Agent produces no finding | Check run completion/noop; findings depend on evidence, not a fixed script |

Official references: [gh-aw Codex](https://github.github.com/gh-aw/engines/codex/),
[gh-aw authentication](https://github.github.com/gh-aw/reference/auth/),
[OpenAI quickstart](https://developers.openai.com/api/docs/quickstart),
[API credential handling](https://developers.openai.com/api/reference/overview),
[configured model](https://developers.openai.com/api/docs/models/gpt-5.4-mini).
