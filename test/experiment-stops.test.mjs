import test from 'node:test';
import assert from 'node:assert/strict';
import { exampleRun } from '../support/run.mjs';
import { reviewPlan } from '../lib/review.mjs';
import { planExperiment, validateExperiment } from '../lib/experiment.mjs';

function trial() {
  const run = exampleRun(), review = reviewPlan(run);
  Object.assign(review.decisions[0], { decision: 'accept', note: 'Synthetic acceptance.', checked_sources: ['S1', 'S2'], counterevidence_checked: true });
  const experiment = planExperiment(run, review, 4);
  Object.assign(experiment, { started: '2026-03-01', observations: [{ date: '2026-03-02', kind: 'observation', note: 'Synthetic result.' }], reviewed: '2026-03-02', decision: 'continue', reason: 'Try once more.', alternative: 'Schedule may explain the result.' });
  return { run, review, experiment };
}

test('withdrawn current acceptance prevents continue or adjust but permits preserving a stopped record', () => {
  for (const decision of ['reject', 'revise', 'defer', 'pending']) {
    const { run, review, experiment } = trial(); review.decisions[0].decision = decision;
    assert.throws(() => validateExperiment(run, review, experiment), /current acceptance/);
    experiment.decision = 'adjust';
    assert.throws(() => validateExperiment(run, review, experiment), /current acceptance/);
    experiment.decision = 'stop';
    assert.equal(validateExperiment(run, review, experiment), experiment);
  }
});

test('an explicit stop observation closes the chronological observation sequence', () => {
  const { run, review, experiment } = trial();
  experiment.decision = 'stop'; experiment.observations[0].kind = 'stop';
  experiment.observations.push({ date: '2026-03-02', kind: 'observation', note: 'After stopping.' });
  assert.throws(() => validateExperiment(run, review, experiment), /after a stop/);
  experiment.observations.pop();
  assert.equal(validateExperiment(run, review, experiment), experiment);
});
