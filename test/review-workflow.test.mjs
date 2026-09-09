import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { scenario, corpus } from '../support/cli.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';
import { exampleRun } from '../support/run.mjs';

test('draft reports cover only selected questions and sources without inventing answers', () => scenario(({ path, put, get, run }) => {
  put('corpus.json', corpus);
  put('config.json', { ...DEFAULT_CONFIG, mode: 'custom', questions: [17, 4], exclude: ['creative'] });
  run(['draft-report', path('corpus.json'), path('draft.json'), path('config.json')]);
  run(['validate-report', path('draft.json'), path('corpus.json'), path('config.json')]);
  const draft = get('draft.json');
  assert.deepEqual(draft.source_ids, ['S1', 'S2']);
  assert.deepEqual(draft.answers.map(answer => answer.id), [17, 4]);
  assert.ok(draft.answers.every(answer => answer.status === 'insufficient evidence' && answer.conclusion === '' && answer.evidence.length === 0));
  put('empty.json', { version: 1, sources: [] });
  put('full.json', { ...DEFAULT_CONFIG, mode: 'full' });
  run(['draft-report', path('empty.json'), path('full-draft.json'), path('full.json')]);
  run(['validate-report', path('full-draft.json'), path('empty.json'), path('full.json')]);
  assert.equal(get('full-draft.json').answers.length, 22);
}));

test('human review is bound to selected run data and requires explicit evidence checks', () => scenario(({ path, put, get, run }) => {
  const input = exampleRun(); put('run.json', input);
  run(['review-plan', path('run.json'), path('review.json')]);
  const review = get('review.json');
  assert.match(review.run_digest, /^[a-f0-9]{64}$/); assert.equal(review.decisions[0].decision, 'pending');
  run(['validate-review', path('run.json'), path('review.json')]);
  Object.assign(review.decisions[0], { decision: 'accept', note: 'Useful but tentative synthetic reading.' }); put('unchecked.json', review);
  run(['validate-review', path('run.json'), path('unchecked.json')], 1);
  Object.assign(review.decisions[0], { checked_sources: ['S1', 'S2'], counterevidence_checked: true }); put('checked.json', review);
  run(['validate-review', path('run.json'), path('checked.json')]);
  const reordered = Object.fromEntries(Object.entries(input).reverse()); put('reordered.json', reordered);
  run(['validate-review', path('reordered.json'), path('checked.json')]);
  input.corpus.sources[0].text += ' Changed source.'; put('changed.json', input);
  run(['validate-review', path('changed.json'), path('checked.json')], 1);
  const bad = structuredClone(review); bad.decisions.push(bad.decisions[0]); put('duplicate.json', bad);
  run(['validate-review', path('run.json'), path('duplicate.json')], 1);
}));

test('run snapshots omit filtered sources and work directly with comparison', () => scenario(({ path, put, get, run }) => {
  const input = structuredClone(corpus); input.sources[2].text = 'SYNTHETIC_EXCLUDED_MARKER';
  put('corpus.json', input); put('config.json', { ...DEFAULT_CONFIG, exclude: ['creative'] });
  run(['draft-report', path('corpus.json'), path('report.json'), path('config.json')]);
  run(['pack-run', path('corpus.json'), path('report.json'), path('run.json'), path('config.json')]);
  assert.deepEqual(get('run.json').corpus.sources.map(source => source.id), ['S1', 'S2']);
  assert.ok(!readFileSync(path('run.json'), 'utf8').includes('SYNTHETIC_EXCLUDED_MARKER'));
  run(['compare', path('run.json'), path('run.json'), path('comparison.md')]);
  const bad = get('report.json'); bad.source_ids.push('S3'); put('bad-report.json', bad);
  run(['pack-run', path('corpus.json'), path('bad-report.json'), path('bad-run.json'), path('config.json')], 1);
  assert.ok(!existsSync(path('bad-run.json')));
}));
