import { readJSON, writeJSONNew, requireThat } from './core.mjs';
import { importText } from './preparation.mjs';

export const WORKFLOW_COMMANDS = ['import-text'];
export function runWorkflow(args) {
  const [command, ...paths] = args;
  if (command === 'import-text') {
    requireThat(paths.length === 3, 'Usage: import-text <chosen.txt> <metadata.json> <new-corpus.json>');
    writeJSONNew(paths[2], importText(paths[0], readJSON(paths[1])));
    console.log('Chosen text imported. Review the corpus before preparing a packet.');
  } else return false;
  return true;
}
