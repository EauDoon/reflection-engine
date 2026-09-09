import test from 'node:test';
import assert from 'node:assert/strict';
import { compareRuns } from '../lib/compare.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';
const run=()=>({corpus:{version:1,sources:[]},config:{...DEFAULT_CONFIG,mode:'custom',questions:[4]},report:{version:1,source_ids:[],answers:[{id:4,status:'insufficient evidence',confidence:1,conclusion:'',evidence:[],counterevidence:'None supplied.',alternative:'Unknown.',action:{step:'Optionally observe.',check:'Review.',stop:'Stop if unhelpful.'}}]}});
test('comparison does not equate confidence changes with growth',()=>{
  const a=run(),b=run();b.report.answers[0].confidence=2;
  assert.match(compareRuns(a,b),/1 to 2/);assert.match(compareRuns(a,b),/not a measurement of personal growth/);
  b.report.answers[0].evidence=['UNKNOWN'];assert.throws(()=>compareRuns(a,b));
});
test('comparison represents changed question scope explicitly',()=>{
  const a=run(),b=run();b.config.questions=[17];b.report.answers[0].id=17;
  const text=compareRuns(a,b);assert.match(text,/4 \| removed/);assert.match(text,/17 \| added/);
});
