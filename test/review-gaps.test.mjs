import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario } from '../support/cli.mjs';
import { exampleRun } from '../support/run.mjs';
import { reviewPlan } from '../lib/review.mjs';

test('review gaps track unfinished checks without converting them into acceptance', () => scenario(({ put, path, get, run }) => {
  const input = exampleRun(), review = reviewPlan(input);
  put('run.json', input); put('review.json', review);
  run(['review-gaps', path('run.json'), path('review.json'), path('gaps.json')]);
  assert.deepEqual(get('gaps.json').answers[0], { question_id: 4, decision: 'pending', unchecked_cited_sources: ['S1', 'S2'], counterevidence_unchecked: true, decision_needed: true, revision_needed: false });
  Object.assign(review.decisions[0], { decision: 'revise', note: 'Conclusion needs narrowing.', checked_sources: ['S1'], counterevidence_checked: true });
  put('review2.json', review);
  run(['review-gaps', path('run.json'), path('review2.json'), path('gaps2.json')]);
  assert.deepEqual(get('gaps2.json').answers[0].unchecked_cited_sources, ['S2']);
  assert.equal(get('gaps2.json').answers[0].revision_needed, true);
  assert.equal(get('review2.json').decisions[0].decision, 'revise');
  review.run_digest = '0'.repeat(64); put('stale.json', review);
  run(['review-gaps', path('run.json'), path('stale.json'), path('bad.json')], 1);
}));
