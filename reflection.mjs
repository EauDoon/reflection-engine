#!/usr/bin/env node
import { readJSON, validateCorpus, writeNew } from './lib/core.mjs';
import { buildPacket } from './lib/packet.mjs';
const args = process.argv.slice(2);
try {
  if (args[0] === 'validate-corpus' && args.length === 2) {
    const corpus = validateCorpus(readJSON(args[1]));
    console.log(`Valid corpus: ${corpus.sources.length} sources`);
  } else if (args[0] === 'build' && args.length === 3) {
    writeNew(args[2], buildPacket(readJSON(args[1])));
    console.log('Packet created. Review it locally before sharing with any provider.');
  } else { throw new Error('Usage: node reflection.mjs validate-corpus <corpus.json> | build <corpus.json> <new-packet.md>'); }
} catch (error) {
  console.error(`Error: ${error.code ? 'File operation failed (' + error.code + ')' : error.message}`);
  process.exitCode = 1;
}
