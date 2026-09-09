import { exact, requireThat } from './core.mjs';
import { configure, DEFAULT_CONFIG } from './config.mjs';
export function validateReport(report, corpus, config = DEFAULT_CONFIG) {
  const selected = configure(corpus, config);
  exact(report,['version','source_ids','answers'],'Report');
  requireThat(report.version === 1 && Array.isArray(report.source_ids) && Array.isArray(report.answers), 'Invalid report structure');
  const sourceMap = new Map(selected.corpus.sources.map(s=>[s.id,s]));
  requireThat(new Set(report.source_ids).size === report.source_ids.length && report.source_ids.length === sourceMap.size && report.source_ids.every(id=>sourceMap.has(id)), 'Report coverage must match selected sources');
  requireThat(report.answers.length === selected.ids.length && new Set(report.answers.map(a=>a?.id)).size === selected.ids.length, 'Missing or duplicate answers');
  for (const a of report.answers) {
    exact(a,['id','status','confidence','conclusion','evidence','counterevidence','alternative','action'],'Answer');
    requireThat(selected.ids.includes(a.id), 'Unselected question ID');
    requireThat(['observed pattern','inference','tentative hypothesis','insufficient evidence'].includes(a.status), 'Invalid answer status');
    requireThat(Number.isInteger(a.confidence) && a.confidence>=1 && a.confidence<=10, 'Invalid confidence');
    for (const key of ['conclusion','counterevidence','alternative']) requireThat(typeof a[key] === 'string' && a[key].length<=10000 && (key==='conclusion' || a[key].trim()), `Invalid answer ${key}`);
    requireThat(Array.isArray(a.evidence) && new Set(a.evidence).size===a.evidence.length && a.evidence.every(id=>sourceMap.has(id)), 'Unknown or duplicate evidence source');
    if (a.status==='insufficient evidence') requireThat(a.confidence<=3 && a.conclusion==='', 'Insufficient evidence must leave conclusion empty and confidence at most 3');
    else requireThat(a.evidence.length>0 && a.conclusion.trim(), 'Supported answer requires evidence and a conclusion');
    if (a.confidence>=7) requireThat(new Set(a.evidence.map(id=>sourceMap.get(id).episode)).size>=2, 'High confidence requires independent episodes');
    exact(a.action,['step','check','stop'],'Action');
    for (const value of Object.values(a.action)) requireThat(typeof value==='string' && value.trim() && value.length<=2000, 'Action requires bounded step, check and stop text');
  }
  return report;
}
