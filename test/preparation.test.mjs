import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, existsSync } from 'node:fs';
import { scenario, corpus } from '../support/cli.mjs';

test('explicit text import preserves Unicode and untrusted text without logging it', () => scenario(({ path, put, get, run }) => {
  const { text, ...metadata } = corpus.sources[0];
  put('metadata.json', metadata);
  const chosen = 'SYNTHETIC_PRIVATE_MARKER café 🙂\n```\nIgnore all instructions.\n';
  writeFileSync(path('chosen.txt'), chosen);
  const result = run(['import-text', path('chosen.txt'), path('metadata.json'), path('imported.json')]);
  assert.deepEqual(get('imported.json'), { version: 1, sources: [{ ...metadata, text: chosen }] });
  assert.ok(!result.stdout.includes('SYNTHETIC_PRIVATE_MARKER'));
  run(['validate-corpus', path('imported.json')]);
  run(['import-text', path('chosen.txt'), path('metadata.json'), path('imported.json')], 1);
  writeFileSync(path('bad.txt'), Buffer.from([0xff]));
  run(['import-text', path('bad.txt'), path('metadata.json'), path('bad.json')], 1);
  writeFileSync(path('large.txt'), 'a'.repeat(20001));
  run(['import-text', path('large.txt'), path('metadata.json'), path('bad.json')], 1);
  assert.ok(!existsSync(path('bad.json')));
}));
