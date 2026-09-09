import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReport } from '../lib/report.mjs';
import { readJSON } from '../lib/core.mjs';
const corpus=readJSON(new URL('../examples/synthetic-corpus.json',import.meta.url));
export const emptyReport=()=>({version:1,source_ids:['S1','S2','S3'],answers:[4,11,17].map(id=>({id,status:'insufficient evidence',confidence:2,conclusion:'',evidence:[],counterevidence:'No conclusion to counter.',alternative:'This limited fictional corpus cannot establish the pattern.',action:{step:'Optionally record another episode.',check:'Review after a week.',stop:'Stop if this is unhelpful.'}}))});
test('insufficient evidence is a valid complete report',()=>validateReport(emptyReport(),corpus));
test('unknown evidence, unsupported certainty and missing answers fail',()=>{
  for (const mutate of [r=>r.answers.pop(),r=>r.answers[0].evidence=['S99'],r=>r.answers[0].confidence=9,r=>r.answers[0].conclusion='Invented trait']) {
    const r=emptyReport();mutate(r);assert.throws(()=>validateReport(r,corpus));
  }
});
test('high confidence checks distinct episodes, not count of sources',()=>{
  const r=emptyReport();Object.assign(r.answers[0],{status:'inference',confidence:7,conclusion:'Synthetic proposition, not validated by these tests.',evidence:['S1','S2']});
  validateReport(r,corpus);
  const c=structuredClone(corpus);c.sources[1].episode='E1';assert.throws(()=>validateReport(r,c));
});
