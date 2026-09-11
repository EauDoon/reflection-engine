import { exact, requireThat, validateCorpus } from './core.mjs';
function applyRedaction(corpus, rules) {
  validateCorpus(corpus);
  exact(rules,['version','terms'],'Redaction rules');
  requireThat(rules.version===1 && Array.isArray(rules.terms) && rules.terms.length>=1 && rules.terms.length<=100 && new Set(rules.terms).size===rules.terms.length && rules.terms.every(t=>typeof t==='string' && t.trim() && t.length<=200), 'Rules need 1 to 100 unique literal terms, each at most 200 characters');
  const labels=new Map(rules.terms.map((term,i)=>[term,`[REDACTED_${i+1}]`]));
  const pattern=new RegExp([...rules.terms].sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
  let count=0;
  const matches = new Map(rules.terms.map(term => [term, 0])), sources = [];
  const result={version:1,sources:corpus.sources.map(s=>{
    let substitutions = 0;
    const text = s.text.replace(pattern,term=>{ count++; substitutions++; matches.set(term, matches.get(term) + 1); return labels.get(term); });
    sources.push({ id: s.id, substitutions });
    return { ...s, text };
  })};
  validateCorpus(result);
  const terms = [...matches].map(([term, total]) => ({ label: labels.get(term), matches: total }));
  return {corpus:result,count,preview:{ version: 1, substitutions: count, terms, sources, unmatched_labels: terms.filter(term => !term.matches).map(term => term.label) }};
}
export function redact(corpus, rules) { const { corpus: result, count } = applyRedaction(corpus, rules); return { corpus: result, count }; }
export function previewRedaction(corpus, rules) { return applyRedaction(corpus, rules).preview; }
