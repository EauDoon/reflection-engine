import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCorpus } from '../lib/core.mjs';
import { redact } from '../lib/redact.mjs';
import { validateReport } from '../lib/report.mjs';
import { reviewPlan, validateReview } from '../lib/review.mjs';
import { planExperiment, validateExperiment } from '../lib/experiment.mjs';
import { exampleRun } from '../support/run.mjs';

const source = (text) => ({ version: 1, sources: [{ id: 'S1', episode: 'E1', date: null, domain: 'work', kind: 'self-report', text }] });

test('evidence rejects control codes and hidden formatting that can spoof or bypass redaction', () => {
  validateCorpus(source('Café, 日本語, 🙂, and 👩\u200d💻'));
  for (const hidden of ['\u007f', '\u009b', '\u200b', '\u202e', '\u00ad', '\ufeff', '\u2028']) {
    assert.throws(() => validateCorpus(source('secret' + hidden + 'name')), /hidden formatting/);
  }
  assert.throws(() => redact(source('sec\u200bret'), { version: 1, terms: ['secret'] }), /hidden formatting/);
  const input = exampleRun();
  const config = input.config;
  input.report.answers[0].conclusion = 'Visible claim \u007f';
  assert.throws(() => validateReport(input.report, input.corpus, config), /hidden formatting/);
  input.report.answers[0].conclusion = 'Synthetic hypothesis about a shorter practice plan.';
  const review = reviewPlan(input);
  review.decisions[0].note = 'Checked \u202e sources';
  review.decisions[0].decision = 'reject';
  assert.throws(() => validateReview(input, review), /hidden formatting/);
  Object.assign(review.decisions[0], { decision: 'accept', note: 'Synthetic acceptance.', checked_sources: ['S1', 'S2'], counterevidence_checked: true });
  const experiment = planExperiment(input, review, 4);
  experiment.started = '2026-03-01';
  experiment.observations = [{ date: '2026-03-02', kind: 'observation', note: 'sec\u200bret' }];
  assert.throws(() => validateExperiment(input, review, experiment), /hidden formatting/);
});
