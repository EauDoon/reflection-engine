import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { DEFAULT_CONFIG } from '../lib/config.mjs';
const cli=fileURLToPath(new URL('../reflection.mjs',import.meta.url));
const fixture=readFileSync(new URL('../examples/synthetic-corpus.json',import.meta.url),'utf8');
function scenario(fn) {
  const dir=mkdtempSync(join(tmpdir(),'reflection cli '));
  const path=name=>join(dir,name);
  const run=(args,code=0)=> {
    const result=spawnSync(process.execPath,[cli,...args],{cwd:dir,encoding:'utf8',timeout:10000});
    assert.equal(result.status,code,result.stderr || String(result.error));
    return result;
  };
  const put=(name,value)=>{writeFileSync(path(name),JSON.stringify(value));return path(name);};
  try {writeFileSync(path('corpus.json'),fixture);fn({path,run,put});}
  finally {rmSync(dir,{recursive:true,force:true});}
}
test('real CLI build, redaction, receipt and verification work outside repository',()=>scenario(({path,run,put})=>{
  run(['--help']);run(['validate-corpus',path('corpus.json')]);
  run(['build',path('corpus.json'),path('packet.md')]);
  const packet=readFileSync(path('packet.md'),'utf8');
  run(['build',path('corpus.json'),path('packet.md')],1);
  assert.equal(readFileSync(path('packet.md'),'utf8'),packet);
  run(['receipt',path('packet.md'),path('receipt.json')]);
  run(['verify-receipt',path('receipt.json'),path('packet.md')]);
  writeFileSync(path('packet.md'),packet+'changed');
  run(['verify-receipt',path('receipt.json'),path('packet.md')],1);
  put('rules.json',{version:1,terms:['Synthetic example']});
  run(['redact',path('corpus.json'),path('rules.json'),path('redacted.json')]);
  assert.ok(!readFileSync(path('redacted.json'),'utf8').includes('Synthetic example'));
  run(['validate-corpus',path('redacted.json')]);
}));
test('real CLI honors custom filters and validates reports and comparison bundles',()=>scenario(({path,run,put})=>{
  const config={...DEFAULT_CONFIG,mode:'custom',questions:[17],exclude:['creative'],format:'json'};
  put('config.json',config);
  run(['build',path('corpus.json'),path('selected.md'),path('config.json')]);
  const packet=readFileSync(path('selected.md'),'utf8');
  assert.match(packet,/Output format for this run: json/);assert.match(packet,/# Structured report contract/);
  assert.ok(!packet.includes('"id": "S3"'));assert.ok(!packet.includes('4. What am I making'));
  const report={version:1,source_ids:['S1','S2'],answers:[{id:17,status:'insufficient evidence',confidence:2,conclusion:'',evidence:[],counterevidence:'No conclusion to counter.',alternative:'Insufficient synthetic material.',action:{step:'Optionally record a new episode.',check:'Review once.',stop:'Stop if unhelpful.'}}]};
  put('report.json',report);
  run(['validate-report',path('report.json'),path('corpus.json'),path('config.json')]);
  const bundle={corpus:JSON.parse(fixture),config,report};put('before.json',bundle);put('after.json',bundle);
  run(['compare',path('before.json'),path('after.json'),path('comparison.md')]);
  assert.match(readFileSync(path('comparison.md'),'utf8'),/unchanged/);
  report.answers[0].evidence=['S3'];put('invalid-report.json',report);
  run(['validate-report',path('invalid-report.json'),path('corpus.json'),path('config.json')],1);
}));
test('real CLI rejects malformed, oversized and missing inputs without echoing content',()=>scenario(({path,run})=>{
  writeFileSync(path('bad.json'),'{SYNTHETIC_PRIVATE_MARKER');
  const result=run(['validate-corpus',path('bad.json')],1);
  assert.ok(!result.stderr.includes('SYNTHETIC_PRIVATE_MARKER'));
  writeFileSync(path('huge.json'),' '.repeat(1024*1024+1));
  run(['validate-corpus',path('huge.json')],1);
  run(['validate-corpus',path('missing.json')],1);
  run(['build',path('corpus.json'),path('x.md'),'extra','unwanted'],1);
}));
test('real CLI rejects duplicate domain keys before exclusion filtering',()=>scenario(({path,run,put})=>{
  put('config.json',{...DEFAULT_CONFIG,exclude:['private']});
  for (const duplicate of ['domain','\\u0064omain']) {
    const source='{"version":1,"sources":[{"id":"S1","episode":"E1","date":null,"domain":"private","'+duplicate+'":"learning","kind":"self-report","text":"SYNTHETIC_PRIVATE_MARKER"}]}';
    writeFileSync(path('ambiguous.json'),source);
    const result=run(['build',path('ambiguous.json'),path('forbidden.md'),path('config.json')],1);
    assert.match(result.stderr,/duplicate key/);
    assert.ok(!result.stderr.includes('SYNTHETIC_PRIVATE_MARKER'));
    assert.ok(!existsSync(path('forbidden.md')));
  }
  writeFileSync(path('ambiguous-config.json'),JSON.stringify(DEFAULT_CONFIG).replace('"exclude":[]','"exclude":["private"],"exclude":[]'));
  run(['build',path('corpus.json'),path('forbidden.md'),path('ambiguous-config.json')],1);
  assert.ok(!existsSync(path('forbidden.md')));
}));
test('real CLI refuses malformed UTF-8 without silently replacing evidence',()=>scenario(({path,run})=>{
  const raw=Buffer.from(fixture.replace('Synthetic example','SYNTHETIC_PRIVATE_MARKER'));
  raw[raw.indexOf('SYNTHETIC_PRIVATE_MARKER')]=0xff;
  writeFileSync(path('invalid-utf8.json'),raw);
  const result=run(['build',path('invalid-utf8.json'),path('forbidden.md')],1);
  assert.match(result.stderr,/valid UTF-8/);
  assert.ok(!existsSync(path('forbidden.md')));
  const valid=fixture.replace('Synthetic example','Café, 日本語, 🙂');
  writeFileSync(path('valid-utf8.json'),Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),Buffer.from(valid)]));
  run(['build',path('valid-utf8.json'),path('unicode.md')]);
  assert.ok(readFileSync(path('unicode.md'),'utf8').includes('Café, 日本語, 🙂'));
}));

test('real CLI comparison ignores object key order but preserves actual and array changes',()=>scenario(({path,run,put})=>{
  const corpus=JSON.parse(fixture);
  const config={...DEFAULT_CONFIG,mode:'custom',questions:[4]};
  const answer={id:4,status:'inference',confidence:5,conclusion:'Synthetic interpretation for comparison only.',evidence:['S1','S2'],counterevidence:'The creative episode differs.',alternative:'The examples may reflect different tasks.',action:{step:'Optionally observe another episode.',check:'Review once.',stop:'Stop if unhelpful.'}};
  const before={corpus,config,report:{version:1,source_ids:['S1','S2','S3'],answers:[answer]}};
  function reorder(value) {
    if (Array.isArray(value)) return value.map(reorder);
    if (value && typeof value==='object') return Object.fromEntries(Object.entries(value).reverse().map(([key,item])=>[key,reorder(item)]));
    return value;
  }
  put('before.json',before);
  const reordered=reorder(before);
  put('reordered.json',reordered);
  run(['compare',path('before.json'),path('reordered.json'),path('same.md')]);
  const same=readFileSync(path('same.md'),'utf8');
  assert.match(same,/Edited under the same ID: 0/);
  assert.match(same,/\| 4 \| inference to inference \| 5 to 5 \| unchanged \|/);
  const changed=structuredClone(reordered);
  changed.corpus.sources[0].text+=' A real source edit.';
  changed.report.answers[0].action.step='A different optional action.';
  put('changed.json',changed);
  run(['compare',path('before.json'),path('changed.json'),path('changed.md')]);
  const changedText=readFileSync(path('changed.md'),'utf8');
  assert.match(changedText,/Edited under the same ID: 1/);
  assert.match(changedText,/\| 4 \| inference to inference \| 5 to 5 \| changed \|/);
  const reorderedEvidence=structuredClone(reordered);
  reorderedEvidence.report.answers[0].evidence.reverse();
  put('array-order.json',reorderedEvidence);
  run(['compare',path('before.json'),path('array-order.json'),path('array-order.md')]);
  assert.match(readFileSync(path('array-order.md'),'utf8'),/\| 4 \| inference to inference \| 5 to 5 \| changed \|/);
}));
