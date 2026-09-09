import test from 'node:test';
import assert from 'node:assert/strict';
import { redact } from '../lib/redact.mjs';
const c=text=>({version:1,sources:[{id:'S1',episode:'E1',date:null,domain:'work',kind:'quotation',text}]});
test('redaction is literal, longest first, non-cascading and preserves input',()=>{
  const input=c('Ada Lovelace, Ada, a.b, A.b');
  const r=redact(input,{version:1,terms:['Ada','Ada Lovelace','a.b','[REDACTED_1]']});
  assert.equal(r.corpus.sources[0].text,'[REDACTED_2], [REDACTED_1], [REDACTED_3], A.b');
  assert.equal(r.count,3);assert.equal(input.sources[0].text,'Ada Lovelace, Ada, a.b, A.b');
});
test('empty or duplicated terms fail closed',()=>{
  for(const terms of [[],[''],['a','a']]) assert.throws(()=>redact(c('example'),{version:1,terms}));
});
