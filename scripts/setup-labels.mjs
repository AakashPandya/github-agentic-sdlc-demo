import { execFileSync } from 'node:child_process'

const labels = [
  ['bug', 'd73a4a', 'Something is not working'],
  ['enhancement', 'a2eeef', 'New feature or improvement'],
  ['question', 'd876e3', 'A question about expected behavior'],
  ['documentation', '0075ca', 'Documentation change'],
  ['security', 'b60205', 'Evidence-backed security concern'],
  ['needs-info', 'fbca04', 'More reproduction details needed'],
  ['priority-high', 'b60205', 'High impact or blocking'],
  ['priority-medium', 'e99695', 'Normal priority'],
  ['priority-low', 'c5def5', 'Low urgency'],
  ['ai-fix', '7057ff', 'Request a Codex fix through a pull request'],
]
execFileSync('gh', ['auth', 'status'], { stdio: 'inherit' })
for (const [name, color, description] of labels) {
  execFileSync('gh', ['label', 'create', name, '--color', color, '--description', description, '--force'], { stdio: 'inherit' })
}
