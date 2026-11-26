#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { packetStats } from './lib/preflight.mjs';
import { requireThat, readJSON, validateCorpus, writeNew, writeJSONNew } from './lib/core.mjs';
import { configure, DEFAULT_CONFIG } from './lib/config.mjs';
import { buildPacket } from './lib/packet.mjs';
import { validateReport } from './lib/report.mjs';
import { redact } from './lib/redact.mjs';
import { receiptFor, verifyReceipt } from './lib/receipt.mjs';
import { compareRuns } from './lib/compare.mjs';
import { runWorkflow, WORKFLOW_COMMANDS } from './lib/workflows.mjs';
const args = process.argv.slice(2);
try {
  if (args.length === 1 && ['--help','-h'].includes(args[0])) {
    console.log('Commands: help, packet-stats, check-budget, validate-corpus, build, redact, receipt, verify-receipt, validate-report, compare, ' + WORKFLOW_COMMANDS.join(', ') + '. Run node reflection.mjs help <command> for positional arguments.');
  } else if (args[0] === 'help' && args.length === 2) {
    const reference = readFileSync(new URL('./docs/offline.md', import.meta.url), 'utf8');
    const usage = reference.split(/\r?\n/).find(line => line.split(' ')[2] === args[1] && line.startsWith('node reflection.mjs '));
    requireThat(usage, 'Unknown command. Run node reflection.mjs --help for the command list.');
    console.log(usage);
  } else if (args[0] === 'packet-stats' && [2, 3].includes(args.length)) {
    const config = args[2] ? readJSON(args[2]) : DEFAULT_CONFIG;
    console.log(JSON.stringify(packetStats(readJSON(args[1]), config)));
  } else if (args[0] === 'check-budget' && [3, 4].includes(args.length)) {
    const limit = Number(args[1]);
    requireThat(/^[1-9]\d*$/.test(args[1]) && Number.isSafeInteger(limit), 'Byte limit must be a positive safe integer.');
    const config = args[3] ? readJSON(args[3]) : DEFAULT_CONFIG;
    const { packet_bytes } = packetStats(readJSON(args[2]), config);
    const within_budget = packet_bytes <= limit;
    console.log(JSON.stringify({ packet_bytes, limit_bytes: limit, within_budget }));
    if (!within_budget) process.exitCode = 1;
  } else if (runWorkflow(args)) {
    // Preparation and review workflows create only explicitly named new files.
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
    writeJSONNew(args[3], result.corpus);
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
  } else { throw new Error('Invalid command or arguments. Run node reflection.mjs --help for all commands or node reflection.mjs help <command> for usage.'); }
} catch (error) {
  console.error(`Error: ${error.code ? 'File operation failed (' + error.code + ')' : error.message}`);
  process.exitCode = 1;
}
