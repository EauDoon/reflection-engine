import { readJSON, writeJSONNew, writeNew, requireThat } from './core.mjs';
import { importText, mergeCorpora, selectSources } from './preparation.mjs';
import { inspectCorpus, previewSelection, evidenceMap } from './inspection.mjs';
import { configure, DEFAULT_CONFIG } from './config.mjs';
import { draftReport } from './report.mjs';
import { snapshotRun } from './run.mjs';
import { reviewPlan, validateReview, reviewSummary, reviewGaps, exportAccepted } from './review.mjs';
import { planExperiment, experimentSummary } from './experiment.mjs';
import { questions } from './packet.mjs';

export const WORKFLOW_COMMANDS = ['export-accepted', 'review-gaps', 'evidence-map', 'questions', 'selection-plan', 'import-text', 'merge', 'select', 'inspect', 'preview', 'draft-report', 'pack-run', 'review-plan', 'validate-review', 'review-summary', 'plan-experiment', 'review-experiment'];
export function runWorkflow(args) {
  const [command, ...paths] = args;
  if (command === 'export-accepted') {
    requireThat(paths.length === 3, 'Usage: export-accepted <run.json> <review.json> <new-excerpt.md>');
    writeNew(paths[2], exportAccepted(readJSON(paths[0]), readJSON(paths[1])));
    console.log('Accepted excerpts created. Review all prose and metadata before deciding whether to share.');
  } else if (command === 'review-gaps') {
    requireThat(paths.length === 3, 'Usage: review-gaps <run.json> <review.json> <new-gaps.json>');
    writeJSONNew(paths[2], reviewGaps(readJSON(paths[0]), readJSON(paths[1])));
    console.log('Review gaps created. Checks remain self-attested and no decision was changed.');
  } else if (command === 'evidence-map') {
    requireThat(paths.length === 2, 'Usage: evidence-map <run.json> <new-map.json>');
    writeJSONNew(paths[1], evidenceMap(readJSON(paths[0])));
    console.log('Evidence map created. Citation counts do not establish independent or truthful evidence.');
  } else if (command === 'questions') {
    requireThat(paths.length === 1, 'Usage: questions <new-questions.json>');
    writeJSONNew(paths[0], { version: 1, quick_ids: configure({ version: 1, sources: [] }).ids, questions: questions() });
    console.log('Question catalog created. Choose custom IDs explicitly; broader coverage does not imply better evidence.');
  } else if (command === 'selection-plan') {
    requireThat([2, 3].includes(paths.length), 'Usage: selection-plan <corpus.json> <new-selection.json> [config.json]');
    const selected = configure(readJSON(paths[0]), paths[2] ? readJSON(paths[2]) : DEFAULT_CONFIG);
    writeJSONNew(paths[1], { version: 1, source_ids: selected.corpus.sources.map(source => source.id) });
    console.log('Editable selection created from supplied corpus and filters. Remove any unwanted IDs before selecting.');
  } else if (command === 'import-text') {
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
  } else if (command === 'review-summary') {
    requireThat(paths.length === 3, 'Usage: review-summary <run.json> <review.json> <new-summary.md>');
    writeNew(paths[2], reviewSummary(readJSON(paths[0]), readJSON(paths[1])));
    console.log('Human review summary created. Accepted proposals remain optional and unverified.');
  } else if (command === 'plan-experiment') {
    requireThat(paths.length === 4 && /^(?:[1-9]|1[0-9]|2[0-2])$/.test(paths[2]), 'Usage: plan-experiment <run.json> <review.json> <question-id> <new-experiment.json>');
    writeJSONNew(paths[3], planExperiment(readJSON(paths[0]), readJSON(paths[1]), Number(paths[2])));
    console.log('One optional experiment plan created. No action was started or scheduled.');
  } else if (command === 'review-experiment') {
    requireThat(paths.length === 4, 'Usage: review-experiment <run.json> <review.json> <experiment.json> <new-summary.md>');
    writeNew(paths[3], experimentSummary(readJSON(paths[0]), readJSON(paths[1]), readJSON(paths[2])));
    console.log('Self-reported experiment review created. It does not establish causation or personal progress.');
  } else return false;
  return true;
}
