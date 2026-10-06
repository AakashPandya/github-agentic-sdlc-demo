import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { parse } from 'yaml'

const root = new URL('../.github/workflows/', import.meta.url)
const sources = readdirSync(root).filter(name => /^ai-.*\.md$/.test(name))
assert.equal(sources.length, 8, 'Expected all eight agent sources')
const codeWriters = new Set(['ai-issue-fixer.md', 'ai-implement-task.md'])
const prWriters = new Set([...codeWriters, 'ai-docs-updater.md'])
const safeConfig = job => {
  const step = job.steps.find(step => step.env?.GH_AW_SAFE_OUTPUTS_CONFIG)
  assert.ok(step, 'Missing generated safe-output configuration')
  return JSON.parse(step.env.GH_AW_SAFE_OUTPUTS_CONFIG)
}

for (const name of sources) {
  const source = readFileSync(new URL(name, root), 'utf8')
  const parts = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  assert.ok(parts, `${name}: missing frontmatter`)
  const config = parse(parts[1])
  const lockText = readFileSync(new URL(name.replace('.md', '.lock.yml'), root), 'utf8')
  const lock = parse(lockText)
  const metadata = JSON.parse(lockText.split('\n')[0].replace('# gh-aw-metadata: ', ''))
  assert.equal(config.engine, 'codex', `${name}: unexpected engine`)
  assert.equal(config.model, 'openai/gpt-6.1-sol', `${name}: unexpected model/provider`)
  assert.equal(metadata.agent_id, config.engine, `${name}: stale lock engine`)
  assert.equal(metadata.agent_model, config.model, `${name}: stale lock model`)
  assert.equal(metadata.strict, true, `${name}: strict mode disabled`)
  assert.equal(metadata.body_hash, createHash('sha256').update(parts[2].trim()).digest('hex'), `${name}: prompt changed; run gh aw compile`)
  assert.ok(config.network.allowed.includes('codex'), `${name}: missing OpenAI network access`)
  assert.ok(!config.network.allowed.includes('copilot'), `${name}: stale inference network`)
  assert.equal(config.tools['cli-proxy'], false)
  assert.equal(config.tools.bash, prWriters.has(name), `${name}: wrong shell policy`)
  for (const [scope, value] of Object.entries(config.permissions)) {
    assert.equal(value, 'read', `${name}: agent ${scope} must be read-only`)
  }
  for (const [scope, value] of Object.entries(lock.jobs.agent.permissions)) {
    assert.equal(value, 'read', `${name}: generated agent ${scope} must be read-only`)
  }
  assert.equal(config.permissions['copilot-requests'], undefined)
  assert.ok(lock.jobs.agent.steps.some(step => step.env?.OPENAI_API_KEY?.includes('secrets.OPENAI_API_KEY')), `${name}: missing API-key wiring`)
  assert.ok(!lock.jobs.agent.steps.some(step => step.env?.COPILOT_GITHUB_TOKEN?.includes('secrets.')), `${name}: unexpected Copilot credential`)
  const agentRun = lock.jobs.agent.steps.map(step => step.run ?? '').join('\n')
  assert.ok(agentRun.includes('codex_harness.cjs'), `${name}: expected Codex execution`)
  assert.ok(agentRun.includes('web_search="disabled"') && agentRun.includes('fetch="disabled"'), `${name}: unexpected web search/fetch`)
  if (!prWriters.has(name)) assert.ok(agentRun.includes('features.shell_tool=false'), `${name}: generated shell not disabled`)
  if (!prWriters.has(name)) {
    assert.equal(config.checkout, false)
    assert.ok(!lock.jobs.agent.steps.some(step => step.uses?.startsWith('actions/checkout@')), `${name}: unexpected agent checkout`)
  }
  const outputs = config['safe-outputs']
  assert.equal(outputs['merge-pull-request'], undefined)
  for (const [type, output] of Object.entries(outputs)) {
    assert.ok(Number.isInteger(output.max) && output.max >= 1 && output.max <= 5, `${name}: ${type} needs a bounded max`)
  }
  const review = outputs['submit-pull-request-review']
  if (review) assert.deepEqual(review['allowed-events'], ['COMMENT', 'REQUEST_CHANGES'])
  const generated = safeConfig(lock.jobs.agent)
  if (prWriters.has(name)) {
    const pr = outputs['create-pull-request']
    const expected = name === 'ai-docs-updater.md' ? ['README.md'] : ['src/**', 'tests/**']
    assert.equal(pr.draft, true)
    assert.deepEqual(pr['allowed-branches'], ['codex/**'])
    assert.equal(pr.max, 1)
    assert.equal(pr['fallback-as-issue'], false)
    assert.deepEqual(pr['allowed-files'], expected)
    assert.deepEqual(generated.create_pull_request.allowed_files, expected)
    assert.equal(generated.create_pull_request.protected_files_policy, 'blocked')
    assert.equal(generated.create_pull_request.draft, true)
    if (name === 'ai-docs-updater.md') {
      assert.deepEqual(pr['protected-files'], { policy: 'blocked', exclude: ['README.md'] })
    } else assert.equal(pr['protected-files'], 'blocked')
  }
  assert.ok(parts[2].includes('## Objective') && parts[2].includes('## Required output') && parts[2].includes('## Boundaries'))
  assert.ok(!source.includes('AakashPandya/'), `${name}: hardcoded source owner`)
  console.log(`PASS ${name}: engine, prompt hash, permissions, tools and output boundaries`)
}
const triage = parse(readFileSync(new URL('ai-issue-triage.md', root), 'utf8').split('---')[1])
assert.ok(!triage['safe-outputs']['add-labels'].allowed.includes('ai-fix'), 'Triage must not authorize implementation')
const deploy = parse(readFileSync(new URL('deploy.yml', root), 'utf8'))
assert.equal(deploy.jobs.deploy.needs, 'build')
assert.equal(deploy.jobs.build.if, "github.ref == 'refs/heads/main'")
assert.ok(deploy.jobs.build.steps.some(step => step.run === 'npm test'))
console.log('PASS triage authorization and deterministic deployment gate')
