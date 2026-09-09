import { exact } from './core.mjs';
import { configure, DEFAULT_CONFIG } from './config.mjs';
import { validateReport } from './report.mjs';
import { createHash } from 'node:crypto';

export function snapshotRun(corpus, report, config = DEFAULT_CONFIG) {
  validateReport(report, corpus, config);
  return { corpus: configure(corpus, config).corpus, config: structuredClone(config), report: structuredClone(report) };
}

export function selectedRun(run) {
  exact(run, ['corpus', 'config', 'report'], 'Run');
  return snapshotRun(run.corpus, run.report, run.config);
}

function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
  return JSON.stringify(value);
}

export function runDigest(run) {
  return createHash('sha256').update(canonical(selectedRun(run))).digest('hex');
}
