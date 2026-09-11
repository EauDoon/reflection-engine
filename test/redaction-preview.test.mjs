import test from 'node:test';
import assert from 'node:assert/strict';
import { scenario, corpus } from '../support/cli.mjs';

test('redaction preview counts actual longest-first substitutions and unmatched labels without terms', () => scenario(({ put, path, get, run }) => {
  const input = structuredClone(corpus); input.sources = [input.sources[0]];
  input.sources[0].text = 'Fictional Person, Fictional, literal.*';
  put('corpus.json', input); put('rules.json', { version: 1, terms: ['Fictional', 'Fictional Person', 'literal.*', 'unmatched'] });
  run(['preview-redaction', path('corpus.json'), path('rules.json'), path('preview.json')]);
  const preview = get('preview.json');
  assert.equal(preview.substitutions, 3);
  assert.deepEqual(preview.terms.map(term => term.matches), [1, 1, 1, 0]);
  assert.deepEqual(preview.unmatched_labels, ['[REDACTED_4]']);
  assert.deepEqual(preview.sources, [{ id: 'S1', substitutions: 3 }]);
  assert.ok(!JSON.stringify(preview).includes('Fictional'));
  assert.equal(get('corpus.json').sources[0].text, input.sources[0].text);
  run(['redact', path('corpus.json'), path('rules.json'), path('redacted.json')]);
  assert.equal(get('redacted.json').sources[0].text, '[REDACTED_2], [REDACTED_1], [REDACTED_3]');
}));
