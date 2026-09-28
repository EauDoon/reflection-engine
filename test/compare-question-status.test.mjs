import test from 'node:test';
import assert from 'node:assert/strict';
import { compareRuns } from '../lib/compare.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';

const source = (id) => ({ id, episode: id, date: null, domain: 'work', kind: 'self-report', text: 'Synthetic source ' + id });
function answer(id, status, confidence) {
  const supported = status !== 'insufficient evidence';
  return {
    id, status, confidence, conclusion: supported ? 'Synthetic conclusion that must stay out of the comparison.' : '',
    evidence: supported ? ['S1', 'S2'] : [],
    counterevidence: 'A competing reading remains available.', alternative: 'The schedule may explain it.',
    action: { step: 'Optionally note one episode.', check: 'Review the note once.', stop: 'Stop if unhelpful.' }
  };
}
function run(id, status, confidence) {
  return {
    corpus: { version: 1, sources: [source('S1'), source('S2')] },
    config: { ...DEFAULT_CONFIG, mode: 'custom', questions: [id] },
    report: { version: 1, source_ids: ['S1', 'S2'], answers: [answer(id, status, confidence)] }
  };
}

test('added and removed question rows keep status and confidence without copying conclusions', () => {
  const text = compareRuns(run(4, 'inference', 5), run(17, 'insufficient evidence', 2));
  assert.match(text, /\| 4 \| removed \| 5 to n\/a \| inference \|/);
  assert.match(text, /\| 17 \| added \| n\/a to 2 \| insufficient evidence \|/);
  assert.doesNotMatch(text, /Synthetic conclusion/);
});
