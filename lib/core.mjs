import { readFileSync, statSync, writeFileSync } from 'node:fs';
export const MAX_BYTES = 1024 * 1024;
export function requireThat(ok, message) { if (!ok) throw new Error(message); }
export function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
export function exact(value, keys, label) {
  requireThat(object(value), `${label} must be an object`);
  requireThat(Object.keys(value).every(k => keys.includes(k)) && keys.every(k => Object.hasOwn(value, k)), `${label} has missing or unknown fields`);
}
export function readJSON(path) {
  requireThat(statSync(path).isFile() && statSync(path).size <= MAX_BYTES, 'Input must be a file of at most 1 MiB');
  const bytes = readFileSync(path);
  requireThat(bytes.length <= MAX_BYTES, 'Input exceeds 1 MiB');
  try { return JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')); }
  catch { throw new Error('Input is not valid JSON'); }
}
export function writeNew(path, text) { writeFileSync(path, text, { encoding:'utf8', flag:'wx', mode:0o600 }); }
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function validateCorpus(corpus) {
  exact(corpus, ['version','sources'], 'Corpus');
  requireThat(corpus.version === 1 && Array.isArray(corpus.sources) && corpus.sources.length <= 200, 'Corpus requires version 1 and at most 200 sources');
  const ids = new Set();
  for (const source of corpus.sources) {
    exact(source, ['id','episode','date','domain','kind','text'], 'Source');
    for (const key of ['id','episode']) requireThat(typeof source[key] === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(source[key]), `Invalid source ${key}`);
    requireThat(!ids.has(source.id), 'Duplicate source ID'); ids.add(source.id);
    requireThat(source.date === null || validDate(source.date), 'Source date must be a real YYYY-MM-DD date or null');
    requireThat(typeof source.domain === 'string' && /^[a-z][a-z0-9 -]{0,39}$/.test(source.domain), 'Invalid source domain');
    requireThat(['self-report','quotation','observation'].includes(source.kind), 'Invalid source kind');
    requireThat(typeof source.text === 'string' && source.text.trim().length > 0 && source.text.length <= 20000 && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(source.text), 'Source text must contain 1 to 20000 characters without control codes');
  }
  return corpus;
}
