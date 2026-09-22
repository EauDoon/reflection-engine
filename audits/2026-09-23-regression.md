# reflection-engine regression baseline — 2026-09-23

## Scope
`reflection-engine-offline` (reflection-engine). Test target invoked:
`npm test`, which runs `node --test` against the project test tree.

## Environment
- Default branch: `main`.
- Toolchain: Node v24.18.0, npm 12.0.2 on Windows.
- Audit branch: `imp/portfolio-triage-phase9-2026-09-23`.
- No dependency install required (zero declared dependencies).

## Results
- tests: 53
- pass: 52
- fail: 0
- skipped: 1
- error: 0
- duration_ms: 2,056.7

## Verdict
- All 53 node:test cases ran cleanly. 1 skip is pre-existing and unrelated to
  this audit.
- No failures, no cancelled runs, no errors.
- Audit branch is a no-op against source, tests, and schemas. Only this report
  is added under `audits/`.

## Follow-ups (out of scope for this commit)
- No PR is opened by this worker; the human opens the PR per the standing rule.