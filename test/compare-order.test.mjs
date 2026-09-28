import test from 'node:test';
import assert from 'node:assert/strict';
import { compareRuns } from '../lib/compare.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';

const answer = (id, evidence) => ({
  id, status: 'inference', confidence: 5, conclusion: 'Synthetic conclusion ' + id, evidence,
  counterevidence: 'A competing reading remains available.', alternative: 'The schedule may explain it.',
  action: { step: 'Optionally note one episode.', check: 'Review the note once.', stop: 'Stop if unhelpful.' }
});
const source = (id) => ({ id, episode: id, date: null, domain: 'work', kind: 'self-report', text: 'Synthetic source ' + id });
function run(sources, ids, answers, sourceIds = sources.map(item => item.id)) {
  return {
    corpus: { version: 1, sources },
    config: { ...DEFAULT_CONFIG, mode: 'custom', questions: ids },
    report: { version: 1, source_ids: sourceIds, answers }
  };
}

test('markdown comparison reports reordered sources and answers instead of calling them unchanged', () => {
  const sources = [source('S1'), source('S2')];
  const answers = [answer(4, ['S1']), answer(11, ['S2'])];
  const before = run(sources, [4, 11], answers);
  const reorderedSources = run([source('S2'), source('S1')], [4, 11], answers, ['S1', 'S2']);
  const sourceText = compareRuns(before, reorderedSources);
  assert.match(sourceText, /Shared source order changed/);
  assert.match(sourceText, /Edited under the same ID: 0/);
  assert.doesNotMatch(sourceText, /Synthetic source/);
  const reorderedAnswers = run(sources, [4, 11], [answer(11, ['S2']), answer(4, ['S1'])]);
  const answerText = compareRuns(before, reorderedAnswers);
  assert.match(answerText, /Shared answer order changed/);
  assert.match(answerText, /\| 4 \| inference to inference \| 5 to 5 \| unchanged \|/);
  assert.doesNotMatch(compareRuns(before, before), /order changed/);
});
