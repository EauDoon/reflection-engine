import { openSync, fstatSync, readSync, closeSync, constants, writeFileSync } from 'node:fs';
export const MAX_BYTES = 1024 * 1024;
export function requireThat(ok, message) { if (!ok) throw new Error(message); }
export function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
export function exact(value, keys, label) {
  requireThat(object(value), `${label} must be an object`);
  requireThat(Object.keys(value).every(k => keys.includes(k)) && keys.every(k => Object.hasOwn(value, k)), `${label} has missing or unknown fields`);
}
export function readBoundedFile(path, limit = MAX_BYTES) {
  requireThat(Number.isSafeInteger(limit) && limit > 0 && limit <= 8 * MAX_BYTES, 'Invalid byte limit');
  const label = `${limit / MAX_BYTES} MiB`;
  // Open once, then validate and read that descriptor. Nonblocking open avoids
  // waiting for a writer if a selected path is replaced with a FIFO on POSIX.
  const descriptor = openSync(path, constants.O_RDONLY | (constants.O_NONBLOCK ?? 0));
  let bytes;
  try {
    const stat = fstatSync(descriptor);
    requireThat(stat.isFile() && stat.size <= limit, `Input must be a regular file of at most ${label}`);
    const buffer = Buffer.alloc(limit + 1);
    let total = 0;
    while (total < buffer.length) {
      const count = readSync(descriptor, buffer, total, buffer.length - total, null);
      if (count === 0) break;
      total += count;
    }
    requireThat(total <= limit, `Input exceeds ${label}`);
    bytes = buffer.subarray(0, total);
  } finally {
    closeSync(descriptor);
  }
  return bytes;
}
export function readJSON(path) {
  const bytes = readBoundedFile(path);
  let source;
  try { source = new TextDecoder('utf-8', { fatal:true }).decode(bytes); }
  catch { throw new Error('Input must be valid UTF-8'); }
  let value;
  try { value = JSON.parse(source); }
  catch { throw new Error('Input is not valid JSON'); }
  // JSON.parse checks grammar but silently chooses the last duplicate key.
  // Scan validated tokens without recursion, comparing decoded key names.
  const stack = [];
  for (const match of source.matchAll(/"(?:\\[\s\S]|[^"\\])*"|[{}\[\],:]/g)) {
    const token = match[0];
    if (token === '{' || token === '[') {
      requireThat(stack.length < 128, 'JSON nesting exceeds 128 containers');
      stack.push(token === '{' ? { keys:new Set(), expectingKey:true } : null);
    } else if (token === '}' || token === ']') {
      stack.pop();
    } else {
      const frame = stack.at(-1);
      if (!frame) continue;
      if (token === ':') frame.expectingKey = false;
      else if (token === ',') frame.expectingKey = true;
      else if (frame.expectingKey) {
        const key = JSON.parse(token);
        requireThat(!frame.keys.has(key), 'JSON object contains a duplicate key');
        frame.keys.add(key);
      }
    }
  }
  return value;
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
