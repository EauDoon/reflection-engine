#!/usr/bin/env node
import { readJSON, validateCorpus } from './lib/core.mjs';
const args = process.argv.slice(2);
try {
  if (args[0] === 'validate-corpus' && args.length === 2) {
    const corpus = validateCorpus(readJSON(args[1]));
    console.log(`Valid corpus: ${corpus.sources.length} sources`);
  } else { throw new Error('Usage: node reflection.mjs validate-corpus <corpus.json>'); }
} catch (error) {
  console.error(`Error: ${error.code ? 'File operation failed (' + error.code + ')' : error.message}`);
  process.exitCode = 1;
}
