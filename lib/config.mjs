import { exact, requireThat, validDate, validateCorpus } from './core.mjs';
export const DEFAULT_CONFIG = {version:1,mode:'quick',questions:[],domains:[],exclude:[],from:null,to:null,format:'markdown'};
export function configure(corpus, config = DEFAULT_CONFIG) {
  validateCorpus(corpus);
  exact(config, Object.keys(DEFAULT_CONFIG), 'Config');
  requireThat(config.version === 1 && ['quick','full','custom'].includes(config.mode), 'Invalid configuration mode');
  requireThat(['markdown','json'].includes(config.format), 'Invalid output format');
  requireThat(Array.isArray(config.questions) && new Set(config.questions).size === config.questions.length && config.questions.every(q => Number.isInteger(q) && q >= 1 && q <= 22), 'Invalid question selection');
  requireThat(config.mode === 'custom' ? config.questions.length > 0 : config.questions.length === 0, 'Only custom mode accepts explicit question IDs');
  for (const key of ['domains','exclude']) requireThat(Array.isArray(config[key]) && config[key].every(x => typeof x === 'string' && /^[a-z][a-z0-9 -]{0,39}$/.test(x)) && new Set(config[key]).size === config[key].length, `Invalid ${key}`);
  for (const key of ['from','to']) requireThat(config[key] === null || validDate(config[key]), 'Invalid date window');
  requireThat(!config.from || !config.to || config.from <= config.to, 'Date window is reversed');
  const sources = corpus.sources.filter(s => (!config.domains.length || config.domains.includes(s.domain)) && !config.exclude.includes(s.domain) && (!config.from || (s.date !== null && s.date >= config.from)) && (!config.to || (s.date !== null && s.date <= config.to)));
  const ids = config.mode === 'quick' ? [4,11,17] : config.mode === 'full' ? Array.from({length:22},(_,i) => i+1) : config.questions;
  return {corpus:{version:1,sources}, ids};
}
