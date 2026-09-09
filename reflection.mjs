#!/usr/bin/env node
import { readJSON, validateCorpus, writeNew } from './lib/core.mjs';
import { configure, DEFAULT_CONFIG } from './lib/config.mjs';
import { buildPacket } from './lib/packet.mjs';
import { validateReport } from './lib/report.mjs';
import { redact } from './lib/redact.mjs';
import { receiptFor, verifyReceipt } from './lib/receipt.mjs';
import { compareRuns } from './lib/compare.mjs';
const args = process.argv.slice(2);
try {
  if (args.length === 1 && ['--help','-h'].includes(args[0])) {
    console.log('Commands: validate-corpus, build, redact, receipt, verify-receipt, validate-report, compare. See docs/offline.md for positional arguments.');
  } else if (args[0] === 'validate-corpus' && args.length === 2) {
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
  } else if (args[0] === 'redact' && args.length === 4) {
    const result = redact(readJSON(args[1]), readJSON(args[2]));
    writeNew(args[3], JSON.stringify(result.corpus, null, 2) + '\n');
    console.log('Redacted corpus created; ' + result.count + ' literal substitutions. Review remaining identifying details.');
  } else if (args[0] === 'receipt' && args.length === 3) {
    writeNew(args[2], JSON.stringify(receiptFor(args[1]), null, 2) + '\n');
    console.log('Exact-byte receipt created.');
  } else if (args[0] === 'verify-receipt' && args.length === 3) {
    verifyReceipt(readJSON(args[1]), args[2]);
    console.log('Receipt matches the current packet bytes.');
  } else if (args[0] === 'compare' && args.length === 4) {
    writeNew(args[3], compareRuns(readJSON(args[1]), readJSON(args[2])));
    console.log('Run comparison created. Interpret changes against source evidence.');
  } else { throw new Error('Usage: node reflection.mjs validate-corpus <corpus.json> | build <corpus.json> <new-packet.md> [config.json] | validate-report <report.json> <corpus.json> [config.json] | redact <corpus.json> <rules.json> <new-corpus.json> | receipt <packet.md> <new-receipt.json> | verify-receipt <receipt.json> <packet.md> | compare <before-run.json> <after-run.json> <new-comparison.md>'); }
} catch (error) {
  console.error(`Error: ${error.code ? 'File operation failed (' + error.code + ')' : error.message}`);
  process.exitCode = 1;
}
