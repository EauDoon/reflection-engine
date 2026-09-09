import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const cli = fileURLToPath(new URL('../reflection.mjs', import.meta.url));
export const corpus = JSON.parse(readFileSync(new URL('../examples/synthetic-corpus.json', import.meta.url), 'utf8'));
export function scenario(fn) {
  const directory = mkdtempSync(join(tmpdir(), 'reflection release two '));
  const path = name => join(directory, name);
  const put = (name, value) => { writeFileSync(path(name), JSON.stringify(value)); return path(name); };
  const get = name => JSON.parse(readFileSync(path(name), 'utf8'));
  const run = (args, status = 0) => {
    const result = spawnSync(process.execPath, [cli, ...args], { cwd: directory, encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, status, result.stderr || String(result.error));
    return result;
  };
  try { return fn({ path, put, get, run }); }
  finally { rmSync(directory, { recursive: true, force: true }); }
}
