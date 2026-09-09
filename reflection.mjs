#!/usr/bin/env node
import { readJSON, validateCorpus, writeNew } from './lib/core.mjs';
import { configure, DEFAULT_CONFIG } from './lib/config.mjs';
import { buildPacket } from './lib/packet.mjs';
import { validateReport } from './lib/report.mjs';
const args = process.argv.slice(2);
try {
  if (args[0] === 'validate-corpus' && args.length === 2) {
    const corpus = validateCorpus(readJSON(args[1]));
    console.log(`Valid corpus: ${corpus.sources.length} sources`);
  } else if (args[0] === 'build' && [3,4].includes(args.length)) {
    const config = args[3] ? readJSON(args[3]) : DEFAULT_CONFIG;
    const selected = configure(readJSON(args[1]), config);
    writeNew(args[2], buildPacket(selected.corpus, selected.ids, config.format));
    console.log('Packet created. Review it locally before sharing with any provider.');
  } else if (args[0] === 'validate-report' && [3,4].includes(args.length)) {
    validateReport(readJSON(args[1]), readJSON(args[2]), args[3] ? readJSON(args[3]) : DEFAULT_CONFIG);
    console.log('Report structure and references are valid. Semantic review is still required.');
  } else { throw new Error('Usage: node reflection.mjs validate-corpus <corpus.json> | build <corpus.json> <new-packet.md> [config.json] | validate-report <report.json> <corpus.json> [config.json]'); }
} catch (error) {
  console.error(`Error: ${error.code ? 'File operation failed (' + error.code + ')' : error.message}`);
  process.exitCode = 1;
}


