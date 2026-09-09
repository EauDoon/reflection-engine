import { exact } from './core.mjs';
import { configure, DEFAULT_CONFIG } from './config.mjs';
import { validateReport } from './report.mjs';

export function snapshotRun(corpus, report, config = DEFAULT_CONFIG) {
  validateReport(report, corpus, config);
  return { corpus: configure(corpus, config).corpus, config: structuredClone(config), report: structuredClone(report) };
}

export function selectedRun(run) {
  exact(run, ['corpus', 'config', 'report'], 'Run');
  return snapshotRun(run.corpus, run.report, run.config);
}
