import test from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import { scenario, corpus } from '../support/cli.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';

test('command help gives the complete positional usage and protects unknown arguments', () =>
  scenario(({ run }) => {
    assert.match(run(['help', 'append-observation']).stdout, /new-experiment.json/);
    assert.match(run(['--help']).stdout, /check-budget/);
    assert.doesNotMatch(run(['help', 'private-input-name'], 1).stderr, /private-input-name/);
    assert.match(run(['missing'], 1).stderr, /--help/);
  })
);

test('packet preflight measures the exact built UTF-8 bytes and honors the selected config', () =>
  scenario(({ run, put, path }) => {
    const input = structuredClone(corpus);
    input.sources[0].text += ' Café <private-marker> 🙂';
    const inputPath = put('input.json', input);
    const configPath = put('config.json', { ...DEFAULT_CONFIG, format: 'json', exclude: ['creative'] });
    const stats = run(['packet-stats', inputPath, configPath]).stdout;
    const result = JSON.parse(stats);
    run(['build', inputPath, path('packet.md'), configPath]);
    assert.equal(result.packet_bytes, statSync(path('packet.md')).size);
    assert.equal(result.selected_sources, 2);
    assert.equal(result.omitted_sources, 1);
    assert.equal(result.questions, 3);
    assert.doesNotMatch(stats, /private-marker|S1|creative/);
    const check = (limit, code) => run(['check-budget', String(limit), inputPath, configPath], code);
    assert.equal(JSON.parse(check(result.packet_bytes, 0).stdout).within_budget, true);
    assert.equal(JSON.parse(check(result.packet_bytes - 1, 1).stdout).within_budget, false);
    for (const invalid of ['0', '1.5', '1e3', '9007199254740992']) {
      assert.match(check(invalid, 1).stderr, /positive safe integer/);
    }
  })
);
