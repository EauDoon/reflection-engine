import test from 'node:test';
import assert from 'node:assert/strict';
import { compareDetails, compareRuns } from '../lib/compare.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';
import { runDigest } from '../lib/run.mjs';

const answer = () => ({
  id: 4, status: 'insufficient evidence', confidence: 1, conclusion: '', evidence: [],
  counterevidence: 'No conclusion to counter.', alternative: 'The sample is too small.',
  action: { step: 'Optionally record another episode.', check: 'Review once.', stop: 'Stop if unhelpful.' }
});
const source = (id) => ({ id, episode: id, date: null, domain: 'work', kind: 'self-report', text: 'Synthetic source ' + id });
function run(sourceIds) {
  const sources = [source('S1'), source('S2')];
  return {
    corpus: { version: 1, sources },
    config: { ...DEFAULT_CONFIG, mode: 'custom', questions: [4] },
    report: { version: 1, source_ids: sourceIds, answers: [answer()] }
  };
}

test('comparison reports report coverage order when source records are otherwise unchanged', () => {
  const before = run(['S1', 'S2']);
  const after = run(['S2', 'S1']);
  assert.notEqual(runDigest(before), runDigest(after));
  const details = compareDetails(before, after);
  assert.equal(details.coverage_order_changed, true);
  assert.deepEqual(details.sources.changed, []);
  assert.equal(details.sources.order_changed, false);
  assert.match(compareRuns(before, after), /Report coverage order changed/);
  assert.doesNotMatch(compareRuns(before, after), /Synthetic source/);
  assert.equal(compareDetails(before, before).coverage_order_changed, false);
  assert.doesNotMatch(compareRuns(before, before), /Report coverage order changed/);
});
