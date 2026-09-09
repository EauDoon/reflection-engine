import { readJSON, writeJSONNew, requireThat } from './core.mjs';
import { importText, mergeCorpora, selectSources } from './preparation.mjs';
import { inspectCorpus, previewSelection } from './inspection.mjs';
import { DEFAULT_CONFIG } from './config.mjs';

export const WORKFLOW_COMMANDS = ['import-text', 'merge', 'select', 'inspect', 'preview'];
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
  } else return false;
  return true;
}
