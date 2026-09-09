import { readJSON, writeJSONNew, requireThat } from './core.mjs';
import { importText, mergeCorpora, selectSources } from './preparation.mjs';

export const WORKFLOW_COMMANDS = ['import-text', 'merge', 'select'];
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
  } else return false;
  return true;
}
