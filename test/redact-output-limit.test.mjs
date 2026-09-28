import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { scenario } from '../support/cli.mjs';
import { MAX_BYTES } from '../lib/core.mjs';
import { redact } from '../lib/redact.mjs';

test('redact refuses a pretty-printed corpus larger than the JSON input limit', () => scenario(({ path, put, run }) => {
  const text = ('Name says ' + 'word '.repeat(100)).repeat(20);
  const sources = [];
  for (let i = 0; i < 200; i++) {
    const next = [...sources, { id: 'S' + i, episode: 'E' + i, date: null, domain: 'work', kind: 'quotation', text }];
    if (Buffer.byteLength(JSON.stringify({ version: 1, sources: next })) > MAX_BYTES) break;
    sources.push(next.at(-1));
  }
  const corpus = { version: 1, sources };
  const inputBytes = Buffer.byteLength(JSON.stringify(corpus));
  assert.ok(inputBytes <= MAX_BYTES);
  const expanded = Buffer.byteLength(JSON.stringify(redact(corpus, { version: 1, terms: ['Name'] }).corpus, null, 2) + '\n');
  assert.ok(expanded > MAX_BYTES, `expected redacted JSON above 1 MiB, got ${expanded}`);
  put('corpus.json', corpus);
  put('rules.json', { version: 1, terms: ['Name'] });
  run(['validate-corpus', path('corpus.json')]);
  const result = run(['redact', path('corpus.json'), path('rules.json'), path('redacted.json')], 1);
  assert.match(result.stderr, /1 MiB/);
  assert.ok(!result.stdout.includes('Redacted corpus created'));
  assert.ok(!existsSync(path('redacted.json')));
}));
