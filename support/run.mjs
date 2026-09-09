import { corpus } from './cli.mjs';
import { DEFAULT_CONFIG } from '../lib/config.mjs';
export function exampleRun() {
  return {
    corpus: structuredClone(corpus), config: { ...DEFAULT_CONFIG, mode: 'custom', questions: [4] },
    report: { version: 1, source_ids: ['S1', 'S2', 'S3'], answers: [{
      id: 4, status: 'tentative hypothesis', confidence: 4, conclusion: 'Synthetic hypothesis about a shorter practice plan.',
      evidence: ['S1', 'S2'], counterevidence: 'The creative task needed a detailed checklist.',
      alternative: 'The task or schedule may explain the difference.',
      action: { step: 'Optionally try one short practice session.', check: 'Record whether the planned session occurred.', stop: 'Stop if the activity is unhelpful or uncomfortable.' }
    }] }
  };
}
