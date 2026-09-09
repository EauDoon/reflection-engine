import { exact } from './core.mjs';
import { configure } from './config.mjs';
import { validateReport } from './report.mjs';
export function compareRuns(before, after) {
  for(const run of [before,after]) { exact(run,['corpus','config','report'],'Run'); validateReport(run.report,run.corpus,run.config); }
  const left=configure(before.corpus,before.config),right=configure(after.corpus,after.config);
  const leftSources=new Map(left.corpus.sources.map(s=>[s.id,JSON.stringify(s)]));
  const rightSources=new Map(right.corpus.sources.map(s=>[s.id,JSON.stringify(s)]));
  const added=[...rightSources.keys()].filter(id=>!leftSources.has(id));
  const removed=[...leftSources.keys()].filter(id=>!rightSources.has(id));
  const edited=[...rightSources.keys()].filter(id=>leftSources.has(id)&&leftSources.get(id)!==rightSources.get(id));
  const l=new Map(before.report.answers.map(a=>[a.id,a])),r=new Map(after.report.answers.map(a=>[a.id,a]));
  const rows=[...new Set([...left.ids,...right.ids])].sort((a,b)=>a-b).map(id=> {
    const a=l.get(id),b=r.get(id);
    if(!a||!b) return `| ${id} | ${a?'removed':'added'} | n/a | n/a |`;
    return `| ${id} | ${a.status} to ${b.status} | ${a.confidence} to ${b.confidence} | ${JSON.stringify(a)===JSON.stringify(b)?'unchanged':'changed'} |`;
  });
  return `# Reflection run comparison\n\nThis is a textual and coverage comparison, not a measurement of personal growth or model accuracy. Confidence scores are uncalibrated editorial judgments. Changes in source selection, prompt, or model can explain different conclusions. Model and prompt versions are not verified by this comparison.\n\nSources added: ${added.length}. Removed: ${removed.length}. Edited under the same ID: ${edited.length}.\n\n| Question | Status | Confidence | Answer text or fields |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n\nReview changes against the original episodes. Record what happened during the optional experiment, competing explanations, and whether to continue, adjust, or stop. Do not treat a more confident answer as evidence that its claim is true.\n`;
}
