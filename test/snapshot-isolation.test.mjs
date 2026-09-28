import test from 'node:test';
import assert from 'node:assert/strict';
import { snapshotRun } from '../lib/run.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';

test('run snapshot keeps an independent copy of selected source text', () => {
  const corpus = { version: 1, sources: [{ id: 'S1', episode: 'E1', date: null, domain: 'work', kind: 'self-report', text: 'original secret' }] };
  const config = { ...DEFAULT_CONFIG, mode: 'custom', questions: [4] };
  const report = { version: 1, source_ids: ['S1'], answers: [{
    id: 4, status: 'insufficient evidence', confidence: 1, conclusion: '', evidence: [],
    counterevidence: 'No conclusion to counter.', alternative: 'The sample is too small.',
    action: { step: 'Optionally record another episode.', check: 'Review once.', stop: 'Stop if unhelpful.' }
  }] };
  const snap = snapshotRun(corpus, report, config);
  corpus.sources[0].text = 'mutated secret';
  assert.equal(snap.corpus.sources[0].text, 'original secret');
  snap.corpus.sources[0].text = 'snapshot edit';
  assert.equal(corpus.sources[0].text, 'mutated secret');
});
