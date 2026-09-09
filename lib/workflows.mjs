import { readJSON, writeJSONNew, requireThat } from './core.mjs';
import { importText, mergeCorpora, selectSources } from './preparation.mjs';
import { inspectCorpus, previewSelection } from './inspection.mjs';
import { DEFAULT_CONFIG } from './config.mjs';
import { draftReport } from './report.mjs';
import { snapshotRun } from './run.mjs';
import { reviewPlan, validateReview } from './review.mjs';

export const WORKFLOW_COMMANDS = ['import-text', 'merge', 'select', 'inspect', 'preview', 'draft-report', 'pack-run', 'review-plan', 'validate-review'];
export function runWorkflow(args) {
  const [command, ...paths] = args;
  if (command === 'import-text') {
    requireThat(paths.length === 3, 'Usage: import-text <chosen.txt> <metadata.json> <new-corpus.json>');
    writeJSONNew(paths[2], importText(paths[0], readJSON(paths[1])));
    console.log('Chosen text imported. Review the corpus before preparing a packet.');
  } else if (command === 'merge') {
    requireThat(paths.length >= 3 && paths.length <= 21, 'Usage: merge <new-corpus.json> <corpus-a.json> <corpus-b.json> [more corpora, at most 20]');
    writeJSONNew(paths[0], mergeCorpora(paths.slice(1).map(readJSON)));
    console.log('Named corpora merged. Identical source IDs are included once.');
  } else if (command === 'select') {
    requireThat(paths.length === 3, 'Usage: select <corpus.json> <selection.json> <new-corpus.json>');
    writeJSONNew(paths[2], selectSources(readJSON(paths[0]), readJSON(paths[1])));
    console.log('Explicit source selection created. Unselected source text is omitted.');
  } else if (command === 'inspect') {
    requireThat(paths.length === 2, 'Usage: inspect <corpus.json> <new-inspection.json>');
    writeJSONNew(paths[1], inspectCorpus(readJSON(paths[0])));
    console.log('Coverage inspection created. Counts and warnings do not establish evidence quality.');
  } else if (command === 'preview') {
    requireThat([2, 3].includes(paths.length), 'Usage: preview <corpus.json> <new-preview.json> [config.json]');
    writeJSONNew(paths[1], previewSelection(readJSON(paths[0]), paths[2] ? readJSON(paths[2]) : DEFAULT_CONFIG));
    console.log('Selection preview created. Review the full packet separately before sharing.');
  } else if (command === 'draft-report') {
    requireThat([2, 3].includes(paths.length), 'Usage: draft-report <corpus.json> <new-report.json> [config.json]');
    writeJSONNew(paths[1], draftReport(readJSON(paths[0]), paths[2] ? readJSON(paths[2]) : DEFAULT_CONFIG));
    console.log('Insufficient-evidence draft created. No interpretation or action recommendation was generated.');
  } else if (command === 'pack-run') {
    requireThat([3, 4].includes(paths.length), 'Usage: pack-run <corpus.json> <report.json> <new-run.json> [config.json]');
    writeJSONNew(paths[2], snapshotRun(readJSON(paths[0]), readJSON(paths[1]), paths[3] ? readJSON(paths[3]) : DEFAULT_CONFIG));
    console.log('Validated run snapshot created with selected sources only. Keep it private.');
  } else if (command === 'review-plan') {
    requireThat(paths.length === 2, 'Usage: review-plan <run.json> <new-review.json>');
    writeJSONNew(paths[1], reviewPlan(readJSON(paths[0])));
    console.log('Pending human review created. Read the sources, counterevidence and alternatives before editing decisions.');
  } else if (command === 'validate-review') {
    requireThat(paths.length === 2, 'Usage: validate-review <run.json> <review.json>');
    validateReview(readJSON(paths[0]), readJSON(paths[1]));
    console.log('Review structure and run binding are valid. Pending decisions may remain; checks are self-attested.');
  } else return false;
  return true;
}
