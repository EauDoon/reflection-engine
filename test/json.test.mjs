import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readJSON } from '../lib/core.mjs';
function read(raw) {
  const dir=mkdtempSync(join(tmpdir(),'reflection-strict-json-'));
  try {const path=join(dir,'input.json');writeFileSync(path,raw);return readJSON(path);}
  finally {rmSync(dir,{recursive:true,force:true});}
}
test('strict JSON compares decoded keys in every object and preserves separate scopes',()=>{
  for (const raw of ['{"id":1,"id":2}', '{"a":[{"x":1,"\\u0078":2}]}', '{"__proto__":1,"__proto__":2}', '{"a":{"secret":1,"secret":2}}']) {
    assert.throws(()=>read(raw),/duplicate key/);
  }
  const value={a:[{id:1},{id:2}],b:{id:'A "quoted" key: {,}, and \\slashes'}};
  assert.deepEqual(read(JSON.stringify(value)),value);
});
test('strict JSON bounds nesting without recursive scanning',()=>{
  assert.equal(read('['.repeat(128)+'0'+']'.repeat(128)).length,1);
  assert.throws(()=>read('['.repeat(129)+'0'+']'.repeat(129)),/nesting exceeds/);
});
test('strict UTF-8 rejects incomplete, overlong and surrogate encodings',()=>{
  for (const bytes of [[0xc3],[0xc0,0xaf],[0xed,0xa0,0x80]]) {
    assert.throws(()=>read(Buffer.concat([Buffer.from('"'),Buffer.from(bytes),Buffer.from('"')])),/valid UTF-8/);
  }
});
