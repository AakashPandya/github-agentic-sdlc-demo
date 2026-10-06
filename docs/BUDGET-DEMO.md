# One-day OpenAI demo with a $5 starting balance

The current workflows use `openai/gpt-5.4-mini` through the Codex engine. This is an
API model; ChatGPT Plus is not the billing source. No API key is stored in this repository.

## Why this model

Checked on 6 October 2026 against two official sources:

- [OpenAI's model page](https://developers.openai.com/api/docs/models/gpt-5.4-mini)
  lists coding/tool support, Responses API support, and `low` reasoning effort.
- [GitHub's gh-aw cost guide](https://github.github.com/gh-aw/reference/cost-management/)
  explicitly shows `gpt-5.4-mini` as a Codex default-model option.

All eight sources and generated locks select this model. Main agents request low reasoning
through an explicit Codex CLI argument. Readers and the docs updater have 20 turns;
the implementation/fixer agents have 40. Automatic agent harness retries are disabled.
Threat detection stays enabled, uses the same mini model and has a separate 10-turn limit;
its reasoning remains the framework default. Reaching a limit may leave a task incomplete.

The installed compiler is pinned to gh-aw v0.89.21 and emits Codex CLI 0.154.0.
Successful compilation verifies configuration, not your API account access or a hosted run.

## Cost expectations

The published standard rates checked today are $0.75 per million input tokens,
$0.075 per million cached input tokens and $4.50 per million output tokens.
For illustration, 100,000 uncached input tokens plus 10,000 total billed output tokens
cost about $0.12. This is arithmetic, not a measured workflow cost or run-count estimate.
Reasoning tokens, repeated context, multiple agents and threat detection add usage.

A $5 balance is a starting budget, not a guarantee of completing every scenario.
Turn/time limits and gh-aw AI Credits are not an account-wide USD spending cap.
Disable automatic credit recharge if you only want to fund today's trial, monitor the
OpenAI usage dashboard after each run, and avoid running every scenario simultaneously.

## Setup and first run

1. Push the updated `.md`, `.lock.yml` and policy-check files to the destination repository's
   default branch (`main`). If using the Git bundle migration, recreate the bundle after
   committing these changes; an older bundle still contains the old model.
2. In OpenAI Platform, select the intended API project, add your starting credits and create
   a project API key. Confirm the project permits `gpt-5.4-mini`.
3. In the destination GitHub repository, open Settings → Secrets and variables → Actions.
   Add a **repository secret** named `OPENAI_API_KEY`. Paste the value only into that secret
   field. An existing `CODEX_API_KEY` takes precedence; check inherited organization secrets.
4. Complete the Actions permission setup in [ORG-SETUP.md](ORG-SETUP.md). You do not need
   a Copilot subscription or a key in your laptop's shell for these hosted workflows.
5. Run Actions → **AI · Security Review** → Run workflow → **main** once.
6. Inspect the run: the agent must complete inference, then detection/output/conclusion must
   complete as applicable. A clean scan can produce noop. A green setup job alone does not
   prove inference worked. Check OpenAI usage before running another scenario.
7. Open the `demo/pr-review` PR for a small code review demo; that PR triggers two AI agents.
   Add other scenarios one at a time. Never merge intentional demo defects into main.

If the run returns 401, check the key/project; for model-access errors, check project access;
for 429, distinguish insufficient quota/billing from rate limits using the error message.
Do not paste secret values into logs or chat. Account entitlement and rate limits can only
be confirmed by this live test after funding and secret setup.

## Stop after today's demo

In GitHub Actions, disable each of the eight `AI · ...` workflows using its workflow menu,
then cancel any still-running AI runs. Ordinary CI/build/deploy can remain enabled.
Remove this repository's OpenAI secret or revoke the demo-only API key when finished.
These changes do not expire automatically at midnight.
