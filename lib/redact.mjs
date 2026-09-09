import { exact, requireThat, validateCorpus } from './core.mjs';
export function redact(corpus, rules) {
  validateCorpus(corpus);
  exact(rules,['version','terms'],'Redaction rules');
  requireThat(rules.version===1 && Array.isArray(rules.terms) && rules.terms.length>=1 && rules.terms.length<=100 && new Set(rules.terms).size===rules.terms.length && rules.terms.every(t=>typeof t==='string' && t.trim() && t.length<=200), 'Rules need 1 to 100 unique literal terms, each at most 200 characters');
  const labels=new Map(rules.terms.map((term,i)=>[term,`[REDACTED_${i+1}]`]));
  const pattern=new RegExp([...rules.terms].sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
  let count=0;
  const result={version:1,sources:corpus.sources.map(s=>({...s,text:s.text.replace(pattern,term=>{count++;return labels.get(term);})}))};
  validateCorpus(result);
  return {corpus:result,count};
}
