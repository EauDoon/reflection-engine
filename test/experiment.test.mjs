import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { scenario } from '../support/cli.mjs';
import { exampleRun } from '../support/run.mjs';

test('one chosen experiment requires accepted evidence review and records an explicit stopped outcome', () => scenario(({ path, put, get, run }) => {
  put('run.json', exampleRun()); run(['review-plan', path('run.json'), path('review.json')]);
  run(['plan-experiment', path('run.json'), path('review.json'), '4', path('not-created.json')], 1);
  assert.ok(!existsSync(path('not-created.json')));
  const review = get('review.json'); Object.assign(review.decisions[0], { decision: 'accept', note: 'Tentative synthetic trial only.', checked_sources: ['S1', 'S2'], counterevidence_checked: true }); put('accepted.json', review);
  run(['plan-experiment', path('run.json'), path('accepted.json'), '4', path('experiment.json')]);
  run(['review-experiment', path('run.json'), path('accepted.json'), path('experiment.json'), path('planned.md')]);
  assert.match(readFileSync(path('planned.md'), 'utf8'), /No outcome recorded/);
  const experiment = get('experiment.json');
  Object.assign(experiment, { started: '2026-03-01', observations: [{ date: '2026-03-02', kind: 'stop', note: '```\n<svg> Synthetic stop observation.' }], reviewed: '2026-03-02', decision: 'stop', reason: 'The optional trial was unhelpful.', alternative: 'Schedule changes could explain this result.' });
  put('observed.json', experiment); run(['review-experiment', path('run.json'), path('accepted.json'), path('observed.json'), path('stopped.md')]);
  const result = readFileSync(path('stopped.md'), 'utf8'); assert.match(result, /Declared decision: stop/); assert.ok(!result.includes('<svg>'));
  experiment.decision = 'continue'; put('invalid.json', experiment);
  run(['review-experiment', path('run.json'), path('accepted.json'), path('invalid.json'), path('bad.md')], 1);
  assert.ok(!existsSync(path('bad.md')));
}));

test('experiment review rejects stale action data, reversed dates and invented source coverage', () => scenario(({ path, put, get, run }) => {
  const input = exampleRun(); put('run.json', input); run(['review-plan', path('run.json'), path('review.json')]);
  const review = get('review.json'); Object.assign(review.decisions[0], { decision: 'accept', note: 'Small synthetic trial.', checked_sources: ['S1', 'S2'], counterevidence_checked: true }); put('accepted.json', review);
  run(['plan-experiment', path('run.json'), path('accepted.json'), '4', path('experiment.json')]);
  const experiment = get('experiment.json'); experiment.action.step = 'Different action'; put('tampered.json', experiment);
  run(['review-experiment', path('run.json'), path('accepted.json'), path('tampered.json'), path('bad.md')], 1);
  const original = get('experiment.json'); Object.assign(original, { started: '2026-03-02', observations: [{ date: '2026-03-01', kind: 'observation', note: 'Wrong date order.' }] }); put('dates.json', original);
  run(['review-experiment', path('run.json'), path('accepted.json'), path('dates.json'), path('bad.md')], 1);
  input.report.answers[0].evidence = ['S99']; put('unknown.json', input);
  run(['plan-experiment', path('unknown.json'), path('accepted.json'), '4', path('bad.json')], 1);
}));

test('a plan can be stopped before starting and after the human rejects its answer', () => scenario(({ path, put, get, run }) => {
  put('run.json', exampleRun()); run(['review-plan', path('run.json'), path('review.json')]);
  const review = get('review.json'); Object.assign(review.decisions[0], { decision: 'accept', note: 'Initially useful.', checked_sources: ['S1', 'S2'], counterevidence_checked: true }); put('accepted.json', review);
  run(['plan-experiment', path('run.json'), path('accepted.json'), '4', path('experiment.json')]);
  const experiment = get('experiment.json'); Object.assign(experiment, { decision: 'stop', reviewed: '2026-03-01', reason: 'Decided not to begin.', alternative: 'The proposal may not fit this context.' }); put('cancelled.json', experiment);
  review.decisions[0].decision = 'reject'; review.decisions[0].note = 'No longer useful.'; put('rejected.json', review);
  run(['review-experiment', path('run.json'), path('rejected.json'), path('cancelled.json'), path('cancelled.md')]);
  assert.match(readFileSync(path('cancelled.md'), 'utf8'), /no longer accepts/);
}));

test('experiment review requires a recorded acceptance snapshot bound to the same run', () => scenario(({ path, put, get, run }) => {
  const input = exampleRun(); put('run.json', input); run(['review-plan', path('run.json'), path('pending.json')]);
  const pending = get('pending.json');
  const handBuilt = { version: 1, run_digest: pending.run_digest, question_id: 4, action: input.report.answers[0].action, started: null, observations: [], reviewed: null, decision: 'pending', reason: '', alternative: '' };
  put('unaccepted.json', handBuilt);
  run(['review-experiment', path('run.json'), path('pending.json'), path('unaccepted.json'), path('bad.md')], 1);
  assert.ok(!existsSync(path('bad.md')));
  const accepted = structuredClone(pending); Object.assign(accepted.decisions[0], { decision: 'accept', note: 'Initially reviewed synthetic proposal.', checked_sources: ['S1', 'S2'], counterevidence_checked: true }); put('accepted.json', accepted);
  run(['plan-experiment', path('run.json'), path('accepted.json'), '4', path('experiment.json')]);
  const experiment = get('experiment.json'); assert.deepEqual(experiment.acceptance_review, accepted);
  for (const modify of [record => { delete record.acceptance_review; }, record => { record.acceptance_review = pending; }, record => { record.acceptance_review.run_digest = '0'.repeat(64); }, record => { record.acceptance_review.decisions[0].checked_sources = []; }, record => { record.acceptance_review.decisions[0].counterevidence_checked = false; }]) {
    const changed = structuredClone(experiment); modify(changed); put('invalid.json', changed);
    run(['review-experiment', path('run.json'), path('accepted.json'), path('invalid.json'), path('bad.md')], 1);
    assert.ok(!existsSync(path('bad.md')));
  }
  const rejected = structuredClone(accepted); rejected.decisions[0].decision = 'reject'; rejected.decisions[0].note = 'Changed my mind after the trial.'; put('rejected.json', rejected);
  Object.assign(experiment, { started: '2026-03-01', observations: [{ date: '2026-03-02', kind: 'observation', note: 'Synthetic observation retained after rejection.' }], reviewed: '2026-03-02', decision: 'stop', reason: 'Stopping after reconsideration.', alternative: 'A changed schedule may explain the observation.' }); put('observed.json', experiment);
  run(['review-experiment', path('run.json'), path('rejected.json'), path('observed.json'), path('stopped.md')]);
  const summary = readFileSync(path('stopped.md'), 'utf8'); assert.match(summary, /no longer accepts/); assert.match(summary, /Synthetic observation retained/);
}));
